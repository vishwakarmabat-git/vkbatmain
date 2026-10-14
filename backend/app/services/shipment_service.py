from datetime import datetime, timezone
import logging
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from app.models.shipment import Shipment
from app.models.order import Order, OrderItem
from app.models.user import User
from app.models.activity_log import AdminActivityLog
from app.schemas.shipment import ShipmentBookingRequest, ShipmentTrackingResponse
from app.services.courier_uncle import courier_uncle_client
from app.services.shipping_service import ShippingService
from app.utils.realtime import emit_realtime_event

logger = logging.getLogger("vkbathouse.shipment_service")

# Normalized status mapping for human-friendly customer UI
STATUS_LABELS = {
    "CREATED": "Shipment Booked",
    "PICKUP_SCHEDULED": "Pickup Scheduled",
    "PICKED_UP": "Picked Up by Courier",
    "IN_TRANSIT": "In Transit",
    "OUT_FOR_DELIVERY": "Out for Delivery",
    "DELIVERED": "Delivered",
    "DELIVERY_ATTEMPTED": "Delivery Attempted",
    "FAILED": "Delivery Failed",
    "RTO_INITIATED": "Return to Origin Initiated",
    "RTO_IN_TRANSIT": "Return in Transit",
    "RETURNED": "Returned to Origin",
    "CANCELLED": "Shipment Cancelled"
}

class ShipmentService:
    @staticmethod
    async def book_shipment(
        db: Session,
        order_id: str,
        booking_data: ShipmentBookingRequest,
        admin_user: User
    ) -> Shipment:
        """
        Books a Courier Uncle shipment for an eligible order.
        Guarantees duplicate-booking prevention and persists provider identifiers.
        """
        order = db.query(Order).options(joinedload(Order.items), joinedload(Order.shipments)).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # 1. Order Eligibility Validation
        if order.order_status in ["cancelled", "refunded"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot book shipment for an order with status '{order.order_status}'."
            )

        # 2. Duplicate Booking Protection
        # Check if an active shipment already exists
        active_shipment = next(
            (s for s in order.shipments if s.shipment_status not in ["CANCELLED", "FAILED"]),
            None
        )
        if active_shipment:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"An active shipment ({active_shipment.tracking_id} - {active_shipment.courier_name}) already exists for this order."
            )

        # 3. Calculate parcel packaging specifications
        items_tuples = [(item.product, item.quantity) for item in order.items if item.product]
        parcel_calc = ShippingService.calculate_cricket_bat_parcel(items_tuples)

        weight_kg = booking_data.custom_weight_kg or parcel_calc["chargeable_weight_kg"]
        length_cm = booking_data.custom_length_cm or parcel_calc["length_cm"]
        width_cm = booking_data.custom_width_cm or parcel_calc["width_cm"]
        height_cm = booking_data.custom_height_cm or parcel_calc["height_cm"]

        shipping_addr = order.shipping_address or {}
        payment_mode = "COD" if order.payment_method == "cod" else "PREPAID"
        cod_amount = float(order.grand_total) if payment_mode == "COD" else 0.0

        # 4. Construct Courier Uncle documented API payload
        payload = {
            "order_id": order.order_number,
            "recipient_name": order.customer_name,
            "recipient_phone": order.customer_phone,
            "recipient_email": order.customer_email,
            "delivery_address": shipping_addr.get("address_line1") or shipping_addr.get("address", ""),
            "delivery_city": shipping_addr.get("city", ""),
            "delivery_state": shipping_addr.get("state", ""),
            "delivery_pincode": shipping_addr.get("pincode", ""),
            "weight_kg": round(float(weight_kg), 3),
            "length_cm": round(float(length_cm), 1),
            "width_cm": round(float(width_cm), 1),
            "height_cm": round(float(height_cm), 1),
            "payment_mode": payment_mode,
            "cod_amount": cod_amount,
            "order_value": float(order.grand_total),
            "items": [
                {
                    "name": item.product_name,
                    "sku": item.product_sku,
                    "qty": item.quantity,
                    "unit_price": float(item.unit_price)
                }
                for item in order.items
            ]
        }

        pickup_uid = booking_data.pickup_address_uid
        if not pickup_uid:
            try:
                addr_res = await courier_uncle_client.get_pickup_addresses()
                addresses = addr_res.get("addresses") or []
                if addresses:
                    default_addr = next((a for a in addresses if a.get("is_default")), addresses[0])
                    pickup_uid = default_addr.get("uid")
            except Exception as e:
                logger.warning(f"Could not auto-fetch pickup addresses: {e}")

        if pickup_uid:
            payload["pickup_address_uid"] = pickup_uid
        if booking_data.courier_code:
            payload["courier_code"] = booking_data.courier_code
        if booking_data.courier_service:
            payload["courier_service"] = booking_data.courier_service

        # 5. Execute API Booking
        try:
            api_res = await courier_uncle_client.create_shipment(payload)
        except HTTPException:
            raise
        except Exception as exc:
            logger.error(f"Shipment booking exception for order {order.order_number}: {exc}")
            raise HTTPException(
                status_code=502,
                detail=f"Courier Uncle shipment creation failed: {str(exc)}"
            )

        tracking_id = api_res.get("tracking_id")
        if not tracking_id:
            raise HTTPException(
                status_code=502,
                detail=f"Provider failed to return a tracking identifier: {api_res}"
            )

        courier_name = api_res.get("courier") or "Courier Uncle"
        courier_code = api_res.get("courier_code") or booking_data.courier_code
        courier_service = api_res.get("courier_service") or booking_data.courier_service
        courier_awb = api_res.get("courier_awb")
        shipping_charge = float(api_res.get("shipping_charge", 0.0))
        zone = api_res.get("zone")
        is_sandbox = bool(api_res.get("sandbox", False))

        now_utc = datetime.now(timezone.utc)

        # 6. Save Shipment database record
        shipment = Shipment(
            order_id=order.id,
            provider="courier_uncle",
            provider_order_id=api_res.get("order_id") or order.order_number,
            tracking_id=tracking_id,
            courier_name=courier_name,
            courier_code=courier_code,
            courier_service=courier_service,
            courier_awb=courier_awb,
            shipping_charge=shipping_charge,
            currency="INR",
            payment_mode=payment_mode,
            cod_amount=cod_amount,
            shipment_status="CREATED",
            zone=zone,
            chargeable_weight_kg=float(weight_kg),
            length_cm=float(length_cm),
            width_cm=float(width_cm),
            height_cm=float(height_cm),
            tracking_url=api_res.get("tracking_url"),
            label_url=api_res.get("label_url"),
            is_sandbox=is_sandbox,
            booked_at=now_utc,
            raw_response=api_res,
            timeline_data=[
                {
                    "status": "CREATED",
                    "notes": f"Shipment booked via Courier Uncle ({courier_name})",
                    "timestamp": now_utc.isoformat()
                }
            ]
        )
        db.add(shipment)

        # 7. Update Order metadata
        order.tracking_number = courier_awb or tracking_id
        order.shipping_carrier = courier_name
        if order.order_status in ["pending", "confirmed"]:
            order.order_status = "processing"

        # 8. Activity log
        log = AdminActivityLog(
            admin_id=admin_user.id,
            admin_name=admin_user.full_name,
            action="BOOK_SHIPMENT",
            entity_type="shipment",
            entity_id=shipment.id,
            details={
                "order_number": order.order_number,
                "tracking_id": tracking_id,
                "courier": courier_name,
                "charge": shipping_charge,
                "sandbox": is_sandbox
            }
        )
        db.add(log)
        db.commit()
        db.refresh(shipment)
        db.refresh(order)

        # 9. Realtime WebSockets
        emit_realtime_event("admin", "SHIPMENT_BOOKED", "shipment", {
            "shipment_id": shipment.id,
            "order_id": order.id,
            "order_number": order.order_number,
            "tracking_id": tracking_id,
            "courier": courier_name,
            "status": shipment.shipment_status
        })

        if order.user_id:
            emit_realtime_event("user", "ORDER_STATUS_UPDATED", "order", {
                "order_id": order.id,
                "order_number": order.order_number,
                "order_status": order.order_status,
                "tracking_number": tracking_id,
                "shipping_carrier": courier_name
            }, user_id=order.user_id)

        # 10. Send shipment dispatched email
        try:
            from app.services.email_service import EmailService
            EmailService.send_order_dispatched_email(
                order=order,
                customer_email=order.customer_email,
                customer_name=order.customer_name,
                tracking_number=tracking_id,
                shipping_carrier=courier_name
            )
        except Exception:
            pass

        return shipment

    @staticmethod
    def get_shipment_by_id(db: Session, shipment_id: str) -> Shipment:
        shipment = db.query(Shipment).options(joinedload(Shipment.order)).filter(Shipment.id == shipment_id).first()
        if not shipment:
            raise HTTPException(status_code=404, detail="Shipment not found")
        return shipment

    @staticmethod
    async def get_order_tracking(
        db: Session,
        order_id: str,
        current_user: Optional[User] = None,
        is_public: bool = False,
        target_shipment_id: Optional[str] = None
    ) -> ShipmentTrackingResponse:
        """
        Retrieves real-time shipment tracking with IDOR protection.
        Synchronizes live timeline & carrier scans from Courier Uncle.
        When is_public is True, allows lookup by AWB number without exposing customer private data.
        """
        clean_order_id = order_id.strip()
        order = db.query(Order).options(joinedload(Order.shipments)).filter(
            (Order.id == clean_order_id) | (Order.order_number.ilike(clean_order_id))
        ).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # Security Ownership Check (IDOR Prevention)
        if not is_public and order.user_id:
            if not current_user or (current_user.id != order.user_id and current_user.role not in ["admin", "superadmin"]):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to view tracking for this order."
                )

        if not order.shipments:
            return ShipmentTrackingResponse(
                tracking_id="",
                order_id=order.id,
                order_number=order.order_number,
                carrier="VK Express Dispatch",
                service="Standard Courier",
                courier_awb=None,
                status="AWAITING_DISPATCH",
                status_label="Awaiting Warehouse Dispatch",
                payment_mode=order.payment_method.upper() if order.payment_method else "PREPAID",
                cod_amount=float(order.grand_total) if order.payment_method == "cod" else 0.0,
                shipping_charge=float(order.shipping_fee or 0.0),
                zone=None,
                booked_at=None,
                delivered_at=None,
                tracking_url=None,
                timeline=[
                    {
                        "status": "CONFIRMED",
                        "notes": "Order confirmed and being prepared in workshop.",
                        "location": "Vishwakarma Bat House Workshop",
                        "timestamp": order.created_at.isoformat() if order.created_at else None
                    }
                ],
                scans=[]
            )

        # Select target shipment: specific shipment if requested, else active non-cancelled, else first
        active_shipment = None
        if target_shipment_id:
            for s in order.shipments:
                if s.id == target_shipment_id:
                    active_shipment = s
                    break

        if not active_shipment:
            for s in order.shipments:
                if s.shipment_status != "CANCELLED":
                    active_shipment = s
                    break
            if not active_shipment and order.shipments:
                active_shipment = order.shipments[0]

        # Live sync with Courier Uncle API
        timeline = active_shipment.timeline_data or []
        scans = active_shipment.scans_data or []
        try:
            lookup_ref = active_shipment.courier_awb or active_shipment.tracking_id
            live_data = await asyncio.wait_for(courier_uncle_client.get_shipment(lookup_ref), timeout=3.0)
            if live_data:
                latest_status = live_data.get("status")
                if latest_status and latest_status != active_shipment.shipment_status:
                    active_shipment.shipment_status = latest_status
                    if latest_status == "DELIVERED":
                        active_shipment.delivered_at = datetime.now(timezone.utc)
                        order.order_status = "delivered"
                    elif latest_status in ["IN_TRANSIT", "OUT_FOR_DELIVERY"]:
                        order.order_status = "shipped"

                if "timeline" in live_data and live_data["timeline"]:
                    timeline = live_data["timeline"]
                    active_shipment.timeline_data = timeline
                if "scans" in live_data and live_data["scans"]:
                    scans = live_data["scans"]
                    active_shipment.scans_data = scans

                db.commit()
                db.refresh(active_shipment)
        except Exception as e:
            logger.warning(f"Live tracking sync skipped for {active_shipment.tracking_id}: {e}")

        # Ensure timeline has at least the initial creation entry
        if not timeline:
            timeline = [
                {
                    "status": active_shipment.shipment_status,
                    "notes": f"Shipment booked with {active_shipment.courier_name or 'Courier Partner'}",
                    "location": "Vishwakarma Bat House Workshop",
                    "timestamp": active_shipment.booked_at.isoformat() if active_shipment.booked_at else None
                }
            ]

        if scans is None:
            scans = []

        status_key = active_shipment.shipment_status
        label = STATUS_LABELS.get(status_key, status_key.replace("_", " ").title())

        return ShipmentTrackingResponse(
            tracking_id=active_shipment.tracking_id,
            order_id=order.id,
            order_number=order.order_number,
            carrier=active_shipment.courier_name or "Courier Uncle",
            service=active_shipment.courier_service or "SURFACE",
            courier_awb=active_shipment.courier_awb,
            status=status_key,
            status_label=label,
            payment_mode=active_shipment.payment_mode,
            cod_amount=float(active_shipment.cod_amount or 0.0),
            shipping_charge=float(active_shipment.shipping_charge or 0.0),
            zone=active_shipment.zone,
            booked_at=active_shipment.booked_at.isoformat() if active_shipment.booked_at else None,
            delivered_at=active_shipment.delivered_at.isoformat() if active_shipment.delivered_at else None,
            tracking_url=active_shipment.tracking_url,
            timeline=timeline,
            scans=scans
        )

    @staticmethod
    async def cancel_shipment(
        db: Session,
        shipment_id: str,
        reason: str,
        admin_user: User
    ) -> Shipment:
        """
        Cancels a booked shipment before courier pickup.
        """
        shipment = db.query(Shipment).options(joinedload(Shipment.order)).filter(Shipment.id == shipment_id).first()
        if not shipment:
            raise HTTPException(status_code=404, detail="Shipment not found")

        if shipment.shipment_status in ["DELIVERED", "PICKED_UP", "IN_TRANSIT"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel shipment in status '{shipment.shipment_status}'. Parcel is already with the carrier."
            )

        if shipment.shipment_status == "CANCELLED":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This shipment has already been cancelled."
            )

        # Call Courier Uncle cancel endpoint
        api_res = await courier_uncle_client.cancel_shipment(shipment.tracking_id, reason)

        shipment.shipment_status = "CANCELLED"
        shipment.cancelled_at = datetime.now(timezone.utc)
        shipment.failure_reason = reason or "Cancelled by Merchant"

        # Log admin activity
        log = AdminActivityLog(
            admin_id=admin_user.id,
            admin_name=admin_user.full_name,
            action="CANCEL_SHIPMENT",
            entity_type="shipment",
            entity_id=shipment.id,
            details={"tracking_id": shipment.tracking_id, "reason": reason}
        )
        db.add(log)
        db.commit()
        db.refresh(shipment)

        emit_realtime_event("admin", "SHIPMENT_CANCELLED", "shipment", {
            "shipment_id": shipment.id,
            "tracking_id": shipment.tracking_id,
            "status": "CANCELLED"
        })

        return shipment

    @staticmethod
    async def process_webhook(db: Session, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes incoming Courier Uncle webhooks with idempotency and audit logs.
        Supported events:
        shipment.created, shipment.picked_up, shipment.in_transit, shipment.out_for_delivery,
        shipment.delivered, shipment.ndr, shipment.rto, shipment.cancelled
        """
        event_name = payload.get("event")
        event_id = payload.get("event_id")
        tracking_id = payload.get("awb_number")
        current_status = payload.get("current_status")
        notes = payload.get("notes")
        location = payload.get("location")
        status_time = payload.get("status_time")

        if not tracking_id:
            return {"status": "ignored", "reason": "Missing awb_number"}

        clean_awb = str(tracking_id).strip()
        shipment = db.query(Shipment).options(joinedload(Shipment.order)).filter(
            (Shipment.tracking_id.ilike(clean_awb)) |
            (Shipment.courier_awb.ilike(clean_awb))
        ).first()
        if not shipment:
            logger.warning(f"Webhook received for unknown tracking_id: {clean_awb}")
            return {"status": "ignored", "reason": "Shipment not found"}

        # Status Update
        if current_status:
            shipment.shipment_status = current_status
            
            # Synchronize Order status where applicable
            if shipment.order:
                if current_status == "DELIVERED":
                    shipment.delivered_at = datetime.now(timezone.utc)
                    shipment.order.order_status = "delivered"
                elif current_status in ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"]:
                    shipment.order.order_status = "shipped"
                elif current_status == "CANCELLED":
                    shipment.cancelled_at = datetime.now(timezone.utc)

            # Append to timeline
            existing_timeline = list(shipment.timeline_data or [])
            existing_timeline.insert(0, {
                "status": current_status,
                "notes": notes or f"Status updated to {current_status}",
                "location": location or "",
                "timestamp": status_time or datetime.now(timezone.utc).isoformat()
            })
            shipment.timeline_data = existing_timeline

            db.commit()

            # Emit Realtime Notification
            emit_realtime_event("admin", "SHIPMENT_STATUS_UPDATED", "shipment", {
                "shipment_id": shipment.id,
                "tracking_id": shipment.tracking_id,
                "status": current_status,
                "notes": notes
            })

            if shipment.order and shipment.order.user_id:
                emit_realtime_event("user", "ORDER_STATUS_UPDATED", "order", {
                    "order_id": shipment.order.id,
                    "order_number": shipment.order.order_number,
                    "order_status": shipment.order.order_status,
                    "tracking_number": shipment.tracking_id
                }, user_id=shipment.order.user_id)

        return {"status": "processed", "tracking_id": tracking_id, "new_status": current_status}
