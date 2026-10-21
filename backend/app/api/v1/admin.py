from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.schemas.admin import (
    AdminDashboardStats, InventoryAdjustment, ActivityLogResponse,
    AdminUserCreate, AdminUserUpdate
)
from app.schemas.order import OrderResponse, OrderStatusUpdate
from app.schemas.auth import UserResponse
from app.services.admin_service import AdminService
from app.services.order_service import OrderService
from app.dependencies.auth import get_current_active_admin
from app.models.user import User
from app.models.order import Order
from app.models.product import Product
from app.models.activity_log import AdminActivityLog
from app.core.security import get_password_hash

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

@router.get("/dashboard", response_model=AdminDashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    return AdminService.get_dashboard_stats(db)

# --- ORDERS MANAGEMENT ---
@router.get("/orders", response_model=List[OrderResponse])
def get_all_orders(
    status_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    query = db.query(Order).options(joinedload(Order.items)).order_by(Order.created_at.desc())
    if status_filter and status_filter != "all":
        query = query.filter(Order.order_status == status_filter)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (Order.order_number.ilike(s)) |
            (Order.customer_name.ilike(s)) |
            (Order.customer_email.ilike(s)) |
            (Order.customer_phone.ilike(s))
        )
    return query.all()

@router.put("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: str,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    order = OrderService.update_order_status(db, order_id, data)
    # Log activity
    log = AdminActivityLog(
        admin_id=admin.id,
        admin_name=admin.full_name,
        action="UPDATE_ORDER_STATUS",
        entity_type="order",
        entity_id=order.id,
        details={"order_number": order.order_number, "order_status": order.order_status, "payment_status": order.payment_status}
    )
    db.add(log)
    db.commit()
    return order

# --- INVENTORY MANAGEMENT ---
@router.get("/inventory")
def get_inventory_list(db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    products = db.query(Product).options(joinedload(Product.category), joinedload(Product.variants)).all()
    results = []
    for p in products:
        results.append({
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "category": p.category.name if p.category else "Uncategorized",
            "stock_quantity": p.stock_quantity,
            "price": float(p.price),
            "status": p.status,
            "stock_status": "Out of Stock" if p.stock_quantity == 0 else ("Low Stock" if p.stock_quantity <= 3 else "In Stock"),
            "variants_count": len(p.variants)
        })
    return results

@router.post("/inventory/adjust")
def adjust_inventory(data: InventoryAdjustment, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    return AdminService.adjust_inventory(db, data, admin)

# --- CUSTOMERS ---
@router.get("/customers", response_model=List[UserResponse])
def get_all_customers(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    query = db.query(User).filter(User.role == "customer").order_by(User.created_at.desc())
    if search:
        s = f"%{search.strip()}%"
        query = query.filter((User.full_name.ilike(s)) | (User.email.ilike(s)) | (User.phone.ilike(s)))
    return query.all()

@router.put("/customers/{user_id}/status", response_model=UserResponse)
def toggle_customer_status(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user

@router.delete("/customers/{user_id}")
def delete_customer(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Customer not found")
    user.is_active = False
    db.commit()
    return {"success": True, "message": "Customer blocked / deactivated"}

# --- ADMIN USERS ---
@router.get("/users", response_model=List[UserResponse])
def get_admin_users(db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    return db.query(User).filter(User.role.in_(["admin", "superadmin"])).all()

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_admin_user(data: AdminUserCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    user = User(
        email=data.email.lower(),
        full_name=data.full_name,
        phone=data.phone,
        hashed_password=get_password_hash(data.password),
        role=data.role,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# --- ACTIVITY LOGS ---
@router.get("/activity-logs", response_model=List[ActivityLogResponse])
def get_activity_logs(limit: int = Query(50, le=200), db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    return db.query(AdminActivityLog).order_by(AdminActivityLog.created_at.desc()).limit(limit).all()
