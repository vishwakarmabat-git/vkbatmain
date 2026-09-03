import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text
from app.core.database import Base

class BulkOrder(Base):
    __tablename__ = "bulk_orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    inquiry_type = Column(String(50), default="bulk_order", nullable=False)  # "bulk_order", "custom_requirement"
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=True)
    club_name = Column(String(255), nullable=True)
    order_quantity = Column(String(100), nullable=True)
    bat_models = Column(String(255), nullable=True)
    details = Column(Text, nullable=False)
    status = Column(String(50), default="PENDING", nullable=False)  # "PENDING", "CONTACTED", "QUOTED", "COMPLETED", "ARCHIVED"
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
