from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.coupon import Coupon
from app.schemas.coupon import (
    CouponCreate, CouponUpdate, CouponResponse,
    CouponValidateRequest, CouponValidateResponse
)
from app.services.coupon_service import CouponService
from app.dependencies.auth import get_current_active_admin
from app.models.user import User

router = APIRouter(prefix="/coupons", tags=["Coupons"])

@router.post("/validate", response_model=CouponValidateResponse)
def validate_coupon(data: CouponValidateRequest, db: Session = Depends(get_db)):
    return CouponService.validate_coupon(db, data.code, data.cart_subtotal)

@router.get("", response_model=List[CouponResponse])
def get_coupons(db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    return db.query(Coupon).order_by(Coupon.created_at.desc()).all()

@router.post("", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
def create_coupon(data: CouponCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    existing = db.query(Coupon).filter(Coupon.code == data.code.upper().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Coupon code already exists")
    
    coupon = Coupon(**data.model_dump())
    coupon.code = coupon.code.upper().strip()
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    from app.utils.realtime import emit_realtime_event
    emit_realtime_event("admin", "COUPON_CREATED", "coupon", {"id": coupon.id, "code": coupon.code})
    return coupon

@router.put("/{coupon_id}", response_model=CouponResponse)
def update_coupon(coupon_id: str, data: CouponUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(coupon, k, v)
    db.commit()
    db.refresh(coupon)
    from app.utils.realtime import emit_realtime_event
    emit_realtime_event("admin", "COUPON_UPDATED", "coupon", {"id": coupon.id, "code": coupon.code})
    return coupon

@router.delete("/{coupon_id}")
def delete_coupon(coupon_id: str, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    db.delete(coupon)
    db.commit()
    from app.utils.realtime import emit_realtime_event
    emit_realtime_event("admin", "COUPON_DELETED", "coupon", {"id": coupon_id})
    return {"success": True, "message": "Coupon deleted successfully"}
