import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Float, Text, Numeric, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    
    provider = Column(String(50), default="courier_uncle", nullable=False)
    provider_order_id = Column(String(100), nullable=True)
    
    # Courier Uncle primary tracking AWB identifier (e.g. CU0000000042)
    tracking_id = Column(String(100), unique=True, index=True, nullable=False)
    
    courier_name = Column(String(100), nullable=True)  # e.g. Ekart, Delhivery, Shadowfax
    courier_code = Column(String(50), nullable=True)   # e.g. ekart, delhivery
    courier_service = Column(String(50), nullable=True) # e.g. SURFACE, AIR, NDD
    courier_awb = Column(String(100), nullable=True)   # Carrier's internal barcode number
    
    shipping_charge = Column(Numeric(10, 2), default=0.0, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    payment_mode = Column(String(20), default="PREPAID", nullable=False)  # PREPAID, COD
    cod_amount = Column(Numeric(10, 2), default=0.0, nullable=False)
    
    # Normalized & Provider Status
    shipment_status = Column(String(50), default="CREATED", index=True, nullable=False)
    # Possible statuses: CREATED, PICKUP_SCHEDULED, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, DELIVERY_ATTEMPTED, FAILED, RTO_INITIATED, RETURNED, CANCELLED
    
    zone = Column(String(10), nullable=True)
    chargeable_weight_kg = Column(Float, nullable=True)
    length_cm = Column(Float, nullable=True)
    width_cm = Column(Float, nullable=True)
    height_cm = Column(Float, nullable=True)
    
    tracking_url = Column(String(1000), nullable=True)
    label_url = Column(String(1000), nullable=True)
    is_sandbox = Column(Boolean, default=False, nullable=False)
    failure_reason = Column(Text, nullable=True)
    
    booked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    picked_up_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    
    timeline_data = Column(JSON, nullable=True)
    scans_data = Column(JSON, nullable=True)
    raw_response = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    order = relationship("Order", back_populates="shipments")
