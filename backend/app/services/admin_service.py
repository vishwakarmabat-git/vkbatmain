from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.order import Order, OrderItem
from app.models.product import Product, InventoryVariant
from app.models.user import User
from app.models.activity_log import AdminActivityLog
from app.schemas.admin import AdminDashboardStats, InventoryAdjustment

class AdminService:
    @staticmethod
    def get_dashboard_stats(db: Session) -> AdminDashboardStats:
        # 1. Total revenue (from confirmed/paid/delivered orders)
        revenue_query = db.query(func.sum(Order.grand_total)).filter(
            Order.order_status.in_(["confirmed", "processing", "shipped", "delivered"])
        ).scalar()
        total_revenue = float(revenue_query or 0.0)

        # 2. Orders count
        total_orders = db.query(Order).count()
        pending_orders = db.query(Order).filter(Order.order_status == "pending").count()

        # 3. Products
        total_products = db.query(Product).filter(Product.status == "active").count()
        low_stock_products = 0

        # 4. Customers count
        total_customers = db.query(User).filter(User.role == "customer").count()

        # 5. Revenue chart & growth calculations (last 7 days vs previous 7 days)
        today = datetime.now(timezone.utc).date()
        today_end = datetime(today.year, today.month, today.day, 23, 59, 59, tzinfo=timezone.utc)
        curr_week_start = datetime(today.year, today.month, today.day, 0, 0, 0, tzinfo=timezone.utc) - timedelta(days=6)
        prev_week_start = curr_week_start - timedelta(days=7)
        prev_week_end = curr_week_start - timedelta(seconds=1)

        # Current 7-day totals
        curr_week_rev = db.query(func.sum(Order.grand_total)).filter(
            Order.created_at >= curr_week_start,
            Order.created_at <= today_end,
            Order.order_status.in_(["confirmed", "processing", "shipped", "delivered"])
        ).scalar() or 0.0

        curr_week_orders = db.query(Order).filter(
            Order.created_at >= curr_week_start,
            Order.created_at <= today_end,
            Order.order_status != "cancelled"
        ).count()

        # Previous 7-day totals
        prev_week_rev = db.query(func.sum(Order.grand_total)).filter(
            Order.created_at >= prev_week_start,
            Order.created_at <= prev_week_end,
            Order.order_status.in_(["confirmed", "processing", "shipped", "delivered"])
        ).scalar() or 0.0

        prev_week_orders = db.query(Order).filter(
            Order.created_at >= prev_week_start,
            Order.created_at <= prev_week_end,
            Order.order_status != "cancelled"
        ).count()

        # Real Growth Percentages
        if float(prev_week_rev) > 0:
            revenue_growth_percent = round(((float(curr_week_rev) - float(prev_week_rev)) / float(prev_week_rev)) * 100, 1)
        elif float(curr_week_rev) > 0:
            revenue_growth_percent = 100.0
        else:
            revenue_growth_percent = 0.0

        if prev_week_orders > 0:
            orders_growth_percent = round(((curr_week_orders - prev_week_orders) / prev_week_orders) * 100, 1)
        elif curr_week_orders > 0:
            orders_growth_percent = 100.0
        else:
            orders_growth_percent = 0.0

        # Daily Revenue Chart (last 7 days)
        revenue_chart = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_start = datetime(day.year, day.month, day.day, 0, 0, 0, tzinfo=timezone.utc)
            day_end = datetime(day.year, day.month, day.day, 23, 59, 59, tzinfo=timezone.utc)
            
            day_rev = db.query(func.sum(Order.grand_total)).filter(
                Order.created_at >= day_start,
                Order.created_at <= day_end,
                Order.order_status.in_(["confirmed", "processing", "shipped", "delivered"])
            ).scalar() or 0.0

            day_orders = db.query(Order).filter(
                Order.created_at >= day_start,
                Order.created_at <= day_end,
                Order.order_status != "cancelled"
            ).count()

            revenue_chart.append({
                "date": day.strftime("%b %d"),
                "revenue": float(day_rev),
                "orders": day_orders
            })

        # 6. Orders by status (Real counts)
        status_counts = db.query(Order.order_status, func.count(Order.id)).group_by(Order.order_status).all()
        orders_by_status = [{"status": s.replace('_', ' ').title(), "count": c} for s, c in status_counts]

        # 7. Top selling products (Real query)
        top_items = db.query(
            OrderItem.product_name,
            func.sum(OrderItem.quantity).label("total_sold"),
            func.sum(OrderItem.total_price).label("total_revenue")
        ).group_by(OrderItem.product_name).order_by(desc("total_sold")).limit(5).all()

        top_selling_products = [
            {"name": item[0], "sold": int(item[1]), "revenue": float(item[2])}
            for item in top_items
        ]

        # 8. Category sales distribution (Real query)
        from app.models.category import Category
        category_items = db.query(
            Category.name,
            func.coalesce(func.sum(OrderItem.total_price), 0.0)
        ).outerjoin(Product, Product.category_id == Category.id)\
         .outerjoin(OrderItem, OrderItem.product_id == Product.id)\
         .filter(Category.is_active == True)\
         .group_by(Category.name).all()

        total_cat_sum = sum(float(c[1]) for c in category_items)
        category_sales_distribution = []
        for cat_name, cat_val in category_items:
            val_float = float(cat_val)
            pct = round((val_float / total_cat_sum * 100), 1) if total_cat_sum > 0 else 0.0
            category_sales_distribution.append({
                "category": cat_name,
                "value": pct
            })

        return AdminDashboardStats(
            total_revenue=total_revenue,
            total_orders=total_orders,
            pending_orders=pending_orders,
            total_products=total_products,
            low_stock_products=low_stock_products,
            total_customers=total_customers,
            revenue_growth_percent=revenue_growth_percent,
            orders_growth_percent=orders_growth_percent,
            revenue_chart=revenue_chart,
            orders_by_status=orders_by_status,
            top_selling_products=top_selling_products,
            category_sales_distribution=category_sales_distribution
        )

    @staticmethod
    def adjust_inventory(db: Session, data: InventoryAdjustment, admin_user: User):
        product = db.query(Product).filter(Product.id == data.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        old_qty = product.stock_quantity
        if data.adjustment_type == "set":
            product.stock_quantity = data.quantity
        elif data.adjustment_type == "add":
            product.stock_quantity += data.quantity
        elif data.adjustment_type == "subtract":
            product.stock_quantity = max(0, product.stock_quantity - data.quantity)

        # Log action
        log = AdminActivityLog(
            admin_id=admin_user.id,
            admin_name=admin_user.full_name,
            action="ADJUST_INVENTORY",
            entity_type="product",
            entity_id=product.id,
            details={
                "product_name": product.name,
                "old_quantity": old_qty,
                "new_quantity": product.stock_quantity,
                "reason": data.reason
            }
        )
        db.add(log)
        db.commit()
        from app.utils.realtime import emit_realtime_event
        emit_realtime_event("public", "INVENTORY_UPDATED", "inventory", {
            "product_id": product.id,
            "product_name": product.name,
            "stock_quantity": product.stock_quantity
        })
        return {"success": True, "message": f"Stock adjusted for {product.name}", "stock_quantity": product.stock_quantity}
