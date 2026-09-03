from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.bulk_order import BulkOrder
from app.models.user import User
from app.schemas.bulk_order import BulkOrderCreate, BulkOrderStatusUpdate, BulkOrderResponse
from app.dependencies.auth import get_current_active_admin
from app.utils.realtime import emit_realtime_event

router = APIRouter(tags=["Bulk Orders & B2B Inquiries"])

# Public Endpoint: Anyone can submit a bulk inquiry
@router.post("/bulk-orders", response_model=BulkOrderResponse, status_code=status.HTTP_201_CREATED)
def submit_bulk_order(
    data: BulkOrderCreate,
    db: Session = Depends(get_db)
):
    if not data.name or not data.phone or not data.details:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name, phone number, and requirements are required."
        )

    inquiry = BulkOrder(
        inquiry_type=data.inquiry_type or "bulk_order",
        name=data.name.strip(),
        phone=data.phone.strip(),
        email=data.email.strip() if data.email else None,
        club_name=data.club_name.strip() if data.club_name else None,
        order_quantity=data.order_quantity.strip() if data.order_quantity else None,
        bat_models=data.bat_models.strip() if data.bat_models else None,
        details=data.details.strip(),
        status="PENDING",
    )
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)

    # Realtime notification to all active admins
    emit_realtime_event(
        channel="admin",
        event="BULK_ORDER_CREATED",
        entity="bulk_order",
        data={
            "id": inquiry.id,
            "name": inquiry.name,
            "phone": inquiry.phone,
            "club_name": inquiry.club_name,
            "quantity": inquiry.order_quantity,
            "bat_models": inquiry.bat_models,
            "details": inquiry.details,
            "status": inquiry.status,
            "created_at": inquiry.created_at.isoformat(),
        }
    )

    return inquiry

# Admin Endpoint: List all bulk inquiries with search & filter
@router.get("/admin/bulk-orders", response_model=List[BulkOrderResponse])
def get_admin_bulk_orders(
    status_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    query = db.query(BulkOrder).order_by(BulkOrder.created_at.desc())
    if status_filter and status_filter != "all":
        query = query.filter(BulkOrder.status == status_filter.upper())
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (BulkOrder.name.ilike(s)) |
            (BulkOrder.phone.ilike(s)) |
            (BulkOrder.email.ilike(s)) |
            (BulkOrder.club_name.ilike(s)) |
            (BulkOrder.details.ilike(s))
        )
    return query.all()

# Admin Endpoint: Update status and notes
@router.put("/admin/bulk-orders/{inquiry_id}/status", response_model=BulkOrderResponse)
def update_bulk_order_status(
    inquiry_id: str,
    data: BulkOrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    inquiry = db.query(BulkOrder).filter(BulkOrder.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bulk order inquiry not found."
        )

    inquiry.status = data.status.upper()
    if data.admin_notes is not None:
        inquiry.admin_notes = data.admin_notes.strip()
    inquiry.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(inquiry)

    # Realtime notification to all active admins
    emit_realtime_event(
        channel="admin",
        event="BULK_ORDER_UPDATED",
        entity="bulk_order",
        data={
            "id": inquiry.id,
            "status": inquiry.status,
            "admin_notes": inquiry.admin_notes,
        }
    )

    return inquiry

# Admin Endpoint: Delete bulk inquiry
@router.delete("/admin/bulk-orders/{inquiry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bulk_order(
    inquiry_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    inquiry = db.query(BulkOrder).filter(BulkOrder.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bulk order inquiry not found."
        )

    db.delete(inquiry)
    db.commit()

    # Realtime notification to all active admins
    emit_realtime_event(
        channel="admin",
        event="BULK_ORDER_DELETED",
        entity="bulk_order",
        data={"id": inquiry_id}
    )

    return None
