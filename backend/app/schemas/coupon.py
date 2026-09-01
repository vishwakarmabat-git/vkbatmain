from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class CouponBase(BaseModel):
    code: str
    description: Optional[str] = None
    discount_type: str = "percentage"  # "percentage" or "fixed"
    discount_value: float
    min_order_amount: float = 0.0
    max_discount_amount: Optional[float] = None
    usage_limit: int = 100
    is_active: bool = True
    valid_until: Optional[datetime] = None

class CouponCreate(CouponBase):
    pass

class CouponUpdate(BaseModel):
    description: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    min_order_amount: Optional[float] = None
    max_discount_amount: Optional[float] = None
    usage_limit: Optional[int] = None
    is_active: Optional[bool] = None
    valid_until: Optional[datetime] = None

class CouponResponse(CouponBase):
    id: str
    times_used: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CouponValidateRequest(BaseModel):
    code: str
    cart_subtotal: float

class CouponValidateResponse(BaseModel):
    is_valid: bool
    message: str
    discount_amount: float
    coupon: Optional[CouponResponse] = None
