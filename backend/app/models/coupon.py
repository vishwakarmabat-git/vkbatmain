import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Numeric, Text
from app.core.database import Base

class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    discount_type = Column(String(20), default="percentage", nullable=False)  # "percentage" or "fixed"
    discount_value = Column(Numeric(10, 2), nullable=False)  # e.g. 10.0 for 10% or 1000.0 for ₹1000
    min_order_amount = Column(Numeric(10, 2), default=0.0, nullable=False)
    max_discount_amount = Column(Numeric(10, 2), nullable=True)  # for percentage cap
    usage_limit = Column(Integer, default=100)
    times_used = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    valid_from = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    valid_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
