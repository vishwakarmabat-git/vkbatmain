import random
import string
from datetime import datetime, timezone
from typing import Optional, List
from urllib.parse import quote
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.order import Order, OrderItem, Payment
from app.models.product import Product, InventoryVariant
from app.models.user import User
from app.schemas.order import OrderCreate, OrderStatusUpdate, WhatsAppOrderRequest
from app.services.coupon_service import CouponService
from app.utils.calculations import calculate_order_totals
from app.core.config import settings

def generate_order_number() -> str:
    today_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    random_str = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"VK-{today_str}-{random_str}"

class OrderService:
    @staticmethod
    def create_order(
        db: Session,
        data: OrderCreate,
        current_user: Optional[User] = None
    ) -> Order:
        if not data.items:
            raise HTTPException(status_code=400, detail="Order must contain at least one item")

        # 1. Fetch products & calculate subtotal
        item_objects = []
        raw_subtotal = 0.0

        for item_in in data.items:
            product = db.query(Product).options(joinedload(Product.images)).filter(Product.id == item_in.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product not found: {item_in.product_id}")
            if product.status != "active":
                raise HTTPException(status_code=400, detail=f"Product {product.name} is not available for purchase")

            # Calculate item unit price + extra customization cost
            unit_price = float(product.price)
            custom_extra = 0.0
            custom_dict = None
            
            if item_in.customization:
                custom_dict = item_in.customization.model_dump()
                custom_extra = float(custom_dict.get("extra_cost", 0.0))

            final_unit_price = unit_price + custom_extra
            item_total = final_unit_price * item_in.quantity
            raw_subtotal += item_total

            # Get primary image if available
            primary_img = None
            if product.images:
                primary_img = next((img.image_url for img in product.images if img.is_primary), product.images[0].image_url)

            order_item = OrderItem(
                product_id=product.id,
                product_name=product.name,
                product_sku=product.sku,
                product_image=primary_img,
                unit_price=final_unit_price,
                quantity=item_in.quantity,
                total_price=item_total,
                customization=custom_dict
            )
            item_objects.append((order_item, product))

        # 2. Coupon Validation
        discount_amount = 0.0
        applied_coupon_code = None
        if data.coupon_code:
            coupon_res = CouponService.validate_coupon(db, data.coupon_code, raw_subtotal)
            if coupon_res.is_valid:
                discount_amount = coupon_res.discount_amount
                applied_coupon_code = data.coupon_code.upper().strip()

        # 3. Calculate financial totals with decimal safety (Bat price only — 0 extra tax, 0 shipping)
        subtotal, gst_amount, shipping_fee, discount_amt, grand_total = calculate_order_totals(
            subtotal=raw_subtotal,
            discount_amount=discount_amount,
            gst_percentage=0.0,
            shipping_fee=0.0,
            free_shipping_threshold=0.0
        )

        # 4. Create Order entity
        order = Order(
            order_number=generate_order_number(),
            user_id=current_user.id if current_user else None,
            customer_name=data.shipping_address.full_name,
            customer_email=data.shipping_address.email,
            customer_phone=data.shipping_address.phone,
            shipping_address=data.shipping_address.model_dump(),
            subtotal=subtotal,
            gst_percent=0.0,
            gst_amount=0.0,
            shipping_fee=0.0,
            discount_amount=discount_amt,
            grand_total=grand_total,
            coupon_code=applied_coupon_code,
            payment_method=data.payment_method,
            payment_status="pending",
            order_status="confirmed" if data.payment_method == "cod" else "pending",
            customer_notes=data.customer_notes
        )
        db.add(order)
        db.flush()

        # 5. Add order items
        for order_item, product in item_objects:
            order_item.order_id = order.id
            db.add(order_item)

        # 6. Mark coupon as used if applied
        if applied_coupon_code:
            CouponService.use_coupon(db, applied_coupon_code)

        # 7. Create Payment record placeholder
        payment_record = Payment(
            order_id=order.id,
            payment_method=data.payment_method,
            amount=grand_total,
            currency="INR",
            status="pending"
        )
        db.add(payment_record)

        db.commit()
        db.refresh(order)
        from app.utils.realtime import emit_realtime_event
        # Broadcast to Admin Dashboard & Orders
        emit_realtime_event("admin", "ORDER_CREATED", "order", {
            "order_id": order.id,
            "order_number": order.order_number,
            "grand_total": float(order.grand_total),
            "customer_name": order.customer_name,
            "order_status": order.order_status,
            "created_at": order.created_at.isoformat() if order.created_at else None
        })
        # Broadcast private notification if registered user
        if order.user_id:
            emit_realtime_event("user", "ORDER_CREATED", "order", {
                "order_id": order.id,
                "order_number": order.order_number,
                "grand_total": float(order.grand_total),
                "order_status": order.order_status
            }, user_id=order.user_id)

        populated_order = OrderService.get_order_by_id(db, order.id)

        # Send order confirmation email asynchronously
        try:
            from app.services.email_service import EmailService
            EmailService.send_order_confirmation_email(
                order=populated_order,
                customer_email=populated_order.customer_email,
                customer_name=populated_order.customer_name
            )
        except Exception as e:
            pass

        return populated_order

    @staticmethod
    def get_order_by_id(db: Session, order_id: str) -> Order:
        order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order

    @staticmethod
    def get_order_by_number(db: Session, order_number: str) -> Order:
        order = db.query(Order).options(joinedload(Order.items)).filter(Order.order_number == order_number).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order

    @staticmethod
    def get_user_orders(db: Session, user_id: str) -> List[Order]:
        return db.query(Order).options(joinedload(Order.items)).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()

    @staticmethod
    def update_order_status(db: Session, order_id: str, data: OrderStatusUpdate) -> Order:
        order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        previous_status = order.order_status

        if data.order_status is not None:
            order.order_status = data.order_status
        if data.payment_status is not None:
            order.payment_status = data.payment_status
        if data.tracking_number is not None:
            order.tracking_number = data.tracking_number
        if data.shipping_carrier is not None:
            order.shipping_carrier = data.shipping_carrier
        if data.admin_notes is not None:
            order.admin_notes = data.admin_notes

        db.commit()
        db.refresh(order)
        from app.utils.realtime import emit_realtime_event
        # Broadcast to Admin
        emit_realtime_event("admin", "ORDER_STATUS_UPDATED", "order", {
            "order_id": order.id,
            "order_number": order.order_number,
            "order_status": order.order_status,
            "payment_status": order.payment_status
        })
        # Broadcast to Customer's private channel
        if order.user_id:
            emit_realtime_event("user", "ORDER_STATUS_UPDATED", "order", {
                "order_id": order.id,
                "order_number": order.order_number,
                "order_status": order.order_status,
                "payment_status": order.payment_status,
                "tracking_number": order.tracking_number
            }, user_id=order.user_id)

        # Trigger Order Delivered email if status changed to 'delivered'
        if data.order_status == "delivered" and previous_status != "delivered":
            try:
                from app.services.email_service import EmailService
                EmailService.send_order_delivered_email(
                    order=order,
                    customer_email=order.customer_email,
                    customer_name=order.customer_name
                )
            except Exception as e:
                pass

        return order


    @staticmethod
    def generate_whatsapp_order_link(db: Session, data: WhatsAppOrderRequest) -> dict:
        total_estimate = 0.0
        items_summary = []

        for item in data.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                price = float(product.price)
                extra = 0.0
                custom_lines = []
                if item.customization:
                    c = item.customization
                    extra = float(c.extra_cost or 0.0)
                    custom_lines.append(f"• Weight: {c.weight}")
                    custom_lines.append(f"• Handle: {c.handle_shape} ({c.handle_size})")
                    custom_lines.append(f"• Grip: {c.grip_pattern} ({c.grip_color}, {c.grip_count})")
                    custom_lines.append(f"• Sticker: {c.sticker_finish}")
                    if c.pre_knocking and c.pre_knocking != "Raw":
                        custom_lines.append(f"• Knocking: {c.pre_knocking}")
                    if c.custom_engraving:
                        custom_lines.append(f"• Laser Engraving: '{c.custom_engraving}'")

                item_total = (price + extra) * item.quantity
                total_estimate += item_total
                
                custom_text = "\n  ".join(custom_lines)
                items_summary.append(
                    f"🏏 *{product.name}* (SKU: {product.sku})\n"
                    f"  Qty: {item.quantity} × ₹{price + extra:,.2f} = ₹{item_total:,.2f}\n"
                    f"  {custom_text}"
                )

        # Total calculation (Free shipping, Zero extra tax)
        grand_total = total_estimate

        message = (
            f"👑 *NEW ORDER INQUIRY — VK BAT HOUSE*\n\n"
            f"👤 *Customer:* {data.customer_name}\n"
            f"📞 *Phone:* {data.customer_phone}\n"
            f"📍 *City:* {data.city}\n\n"
            f"📦 *Ordered Bats:*\n" + "\n\n".join(items_summary) + "\n\n"
            f"💵 *Total Amount:* ₹{grand_total:,.2f}\n"
            f"🚚 *Shipping:* FREE\n\n"
            f"📝 *Notes:* {data.notes or 'None'}\n\n"
            f"Please confirm availability and bank details for instant dispatch!"
        )

        whatsapp_url = f"https://wa.me/{settings.WHATSAPP_NUMBER}?text={quote(message)}"
        return {
            "whatsapp_url": whatsapp_url,
            "message": message,
            "estimated_total": grand_total
        }
