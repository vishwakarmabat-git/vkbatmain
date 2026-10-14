from typing import List, Optional
from fastapi import APIRouter, Depends, Query, Response, status, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.core.config import settings
from app.schemas.shipment import (
    ShipmentBookingRequest,
    ShipmentResponse,
    ShipmentTrackingResponse,
    CancelShipmentRequest,
    ShipmentListResponse
)
from app.models.shipment import Shipment
from app.models.order import Order
from app.models.user import User
from app.services.shipment_service import ShipmentService
from app.services.courier_uncle import courier_uncle_client
from app.dependencies.auth import (
    get_current_active_admin,
    get_optional_current_user,
    get_current_user
)

router = APIRouter(tags=["Shipments & Tracking"])

# --- ADMIN ENDPOINTS ---

@router.get("/admin/shipments", response_model=ShipmentListResponse)
def get_all_shipments(
    status_filter: Optional[str] = Query(None, description="Shipment status filter"),
    courier_filter: Optional[str] = Query(None, description="Courier name or code filter"),
    search: Optional[str] = Query(None, description="Search by tracking AWB or order number"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """
    Lists all shipments with filters, search, and pagination for the admin dashboard.
    """
    query = db.query(Shipment).options(joinedload(Shipment.order)).order_by(Shipment.created_at.desc())

    if status_filter and status_filter != "all":
        query = query.filter(Shipment.shipment_status == status_filter)

    if courier_filter and courier_filter != "all":
        query = query.filter(
            (Shipment.courier_name.ilike(f"%{courier_filter}%")) |
            (Shipment.courier_code == courier_filter)
        )

    if search:
        s = f"%{search.strip()}%"
        query = query.join(Shipment.order).filter(
            (Shipment.tracking_id.ilike(s)) |
            (Shipment.courier_awb.ilike(s)) |
            (Order.order_number.ilike(s)) |
            (Order.customer_name.ilike(s))
        )

    total_count = query.count()
    shipments = query.offset((page - 1) * page_size).limit(page_size).all()

    # Populate order_number for response
    results = []
    for sh in shipments:
        res = ShipmentResponse.model_validate(sh)
        res.order_number = sh.order.order_number if sh.order else None
        results.append(res)

    import math
    pages_count = math.ceil(total_count / page_size) if total_count > 0 else 1
    return ShipmentListResponse(
        count=total_count,
        shipments=results,
        items=results,
        total=total_count,
        page=page,
        limit=page_size,
        pages=pages_count
    )

@router.get("/admin/shipments/{shipment_id}", response_model=ShipmentResponse)
def get_shipment_details(
    shipment_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """
    Retrieves full shipment details by internal ID.
    """
    sh = ShipmentService.get_shipment_by_id(db, shipment_id)
    res = ShipmentResponse.model_validate(sh)
    res.order_number = sh.order.order_number if sh.order else None
    return res

@router.post("/admin/orders/{order_id}/book-shipment", response_model=ShipmentResponse, status_code=status.HTTP_201_CREATED)
async def book_order_shipment(
    order_id: str,
    booking_data: ShipmentBookingRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """
    Admin action: Books a shipment for the given order with Courier Uncle.
    Guarantees duplicate-booking protection and audit trail.
    """
    sh = await ShipmentService.book_shipment(db, order_id, booking_data, admin)
    res = ShipmentResponse.model_validate(sh)
    res.order_number = sh.order.order_number if sh.order else None
    return res

@router.post("/admin/shipments/{shipment_id}/cancel", response_model=ShipmentResponse)
async def cancel_shipment(
    shipment_id: str,
    data: CancelShipmentRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """
    Cancels a booked shipment before courier pickup.
    """
    sh = await ShipmentService.cancel_shipment(db, shipment_id, data.reason or "", admin)
    res = ShipmentResponse.model_validate(sh)
    res.order_number = sh.order.order_number if sh.order else None
    return res

@router.get("/admin/shipments/{shipment_id}/label")
async def download_shipment_label(
    shipment_id: str,
    size: str = Query("thermal_4x6", pattern="^(thermal_4x6|a4)$"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """
    Secure backend-proxied download of the shipping label PDF.
    Does not expose sensitive provider credentials to browser.
    """
    shipment = ShipmentService.get_shipment_by_id(db, shipment_id)
    pdf_bytes = await courier_uncle_client.get_label_pdf(shipment.tracking_id, size=size)
    filename = f"label_{shipment.tracking_id}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{filename}"'
        }
    )

@router.get("/admin/shipping/wallet")
async def get_wallet_overview(admin: User = Depends(get_current_active_admin)):
    """
    Returns Courier Uncle wallet balance, floor balance, and booking capability.
    """
    raw = await courier_uncle_client.get_wallet()
    bal = raw.get("wallet_balance") if raw.get("wallet_balance") is not None else raw.get("balance", 0.0)
    floor = raw.get("floor_balance") if raw.get("floor_balance") is not None else raw.get("min_booking_balance", 100.0)
    is_sandbox = settings.is_courier_uncle_sandbox
    can_book = raw.get("can_book", True) if float(bal or 0) >= float(floor or 0) else False
    if is_sandbox:
        can_book = True

    return {
        "wallet_balance": float(bal or 0.0),
        "floor_balance": float(floor or 100.0),
        "balance": float(bal or 0.0),
        "min_booking_balance": float(floor or 100.0),
        "can_book": bool(can_book),
        "is_sandbox": bool(is_sandbox),
        "currency": raw.get("currency", "INR")
    }

# --- CUSTOMER ORDER TRACKING ENDPOINTS ---

@router.get("/orders/{order_id}/tracking", response_model=ShipmentTrackingResponse)
async def get_order_tracking(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Customer shipment tracking with strict IDOR order ownership enforcement.
    """
    return await ShipmentService.get_order_tracking(db, order_id, current_user)

@router.get("/track/{tracking_id}", response_model=ShipmentTrackingResponse)
async def get_public_tracking_by_id(
    tracking_id: str,
    db: Session = Depends(get_db)
):
    """
    Public tracking by courier AWB number (e.g. Ekart/Delhivery AWB),
    Courier Uncle tracking ID (e.g. CUTEST...), internal shipment ID,
    or Order Number without exposing sensitive customer personal data.
    """
    clean_id = tracking_id.strip()

    # 1. Search directly in shipments (courier_awb, tracking_id, shipment id, or order_number)
    shipment = (
        db.query(Shipment)
        .options(joinedload(Shipment.order))
        .join(Order, Shipment.order_id == Order.id, isouter=True)
        .filter(
            (Shipment.courier_awb.ilike(clean_id)) |
            (Shipment.tracking_id.ilike(clean_id)) |
            (Shipment.id == clean_id) |
            (Order.order_number.ilike(clean_id)) |
            (Order.id == clean_id)
        )
        .order_by(Shipment.created_at.desc())
        .first()
    )

    if shipment:
        return await ShipmentService.get_order_tracking(
            db,
            shipment.order_id,
            current_user=None,
            is_public=True,
            target_shipment_id=shipment.id
        )

    # 2. Check if this is an Order number or ID that exists but doesn't have a booked shipment yet
    order = (
        db.query(Order)
        .options(joinedload(Order.shipments))
        .filter((Order.order_number.ilike(clean_id)) | (Order.id == clean_id))
        .first()
    )

    if order:
        return await ShipmentService.get_order_tracking(
            db,
            order.id,
            current_user=None,
            is_public=True
        )

    raise HTTPException(
        status_code=404,
        detail="Shipment tracking not found for this consignment or order number."
    )

