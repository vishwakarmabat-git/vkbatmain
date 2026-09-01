from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.order import (
    OrderCreate, OrderResponse, OrderStatusUpdate, WhatsAppOrderRequest
)
from app.services.order_service import OrderService
from app.dependencies.auth import get_optional_current_user, get_current_user, get_current_active_admin
from app.models.user import User
from app.models.order import Order

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    return OrderService.create_order(db, data, current_user)

@router.get("/my-orders", response_model=List[OrderResponse])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return OrderService.get_user_orders(db, current_user.id)

@router.get("/track/{order_number}", response_model=OrderResponse)
def track_order_by_number(order_number: str, db: Session = Depends(get_db)):
    return OrderService.get_order_by_number(db, order_number)

@router.post("/whatsapp-order")
def generate_whatsapp_order(data: WhatsAppOrderRequest, db: Session = Depends(get_db)):
    return OrderService.generate_whatsapp_order_link(db, data)

@router.get("/{order_id}", response_model=OrderResponse)
def get_order_by_id(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    order = OrderService.get_order_by_id(db, order_id)
    # IDOR Prevention: If order belongs to a registered customer, enforce that only the owner or an admin can access it
    if order.user_id:
        if not current_user or (current_user.id != order.user_id and current_user.role not in ["admin", "superadmin"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this order"
            )
    return order
