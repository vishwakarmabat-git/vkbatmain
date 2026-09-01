from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.coupon import Coupon
from app.schemas.coupon import CouponCreate, CouponUpdate, CouponValidateResponse
from app.utils.calculations import to_decimal

class CouponService:
    @staticmethod
    def validate_coupon(db: Session, code: str, cart_subtotal: float) -> CouponValidateResponse:
        coupon = db.query(Coupon).filter(Coupon.code == code.upper().strip()).first()
        
        if not coupon:
            return CouponValidateResponse(
                is_valid=False,
                message="Invalid coupon code",
                discount_amount=0.0
            )

        if not coupon.is_active:
            return CouponValidateResponse(
                is_valid=False,
                message="This coupon is no longer active",
                discount_amount=0.0
            )

        if coupon.valid_until and coupon.valid_until < datetime.now(timezone.utc):
            return CouponValidateResponse(
                is_valid=False,
                message="This coupon has expired",
                discount_amount=0.0
            )

        if coupon.times_used >= coupon.usage_limit:
            return CouponValidateResponse(
                is_valid=False,
                message="This coupon usage limit has been reached",
                discount_amount=0.0
            )

        if float(coupon.min_order_amount) > cart_subtotal:
            return CouponValidateResponse(
                is_valid=False,
                message=f"Minimum order amount of ₹{coupon.min_order_amount} required for this coupon",
                discount_amount=0.0
            )

        # Calculate discount
        if coupon.discount_type == "percentage":
            discount = (cart_subtotal * float(coupon.discount_value)) / 100.0
            if coupon.max_discount_amount and discount > float(coupon.max_discount_amount):
                discount = float(coupon.max_discount_amount)
        else:
            discount = float(coupon.discount_value)

        # Cap discount at cart_subtotal
        if discount > cart_subtotal:
            discount = cart_subtotal

        return CouponValidateResponse(
            is_valid=True,
            message=f"Coupon applied: ₹{discount:.2f} discount!",
            discount_amount=round(discount, 2),
            coupon=coupon
        )

    @staticmethod
    def use_coupon(db: Session, code: str):
        coupon = db.query(Coupon).filter(Coupon.code == code.upper().strip()).first()
        if coupon:
            coupon.times_used += 1
            db.commit()
