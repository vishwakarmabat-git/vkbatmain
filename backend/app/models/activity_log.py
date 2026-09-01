import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from app.core.database import Base

class AdminActivityLog(Base):
    __tablename__ = "admin_activity_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    admin_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    admin_name = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)  # e.g. "CREATE_PRODUCT", "UPDATE_ORDER_STATUS", "CHANGE_STOCK"
    entity_type = Column(String(100), nullable=True)  # "product", "order", "setting", "coupon"
    entity_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
