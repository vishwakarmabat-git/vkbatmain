import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, Text, Numeric, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Customer Info (works for both registered & guest checkout)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(30), nullable=False)
    
    # Address JSON structured
    shipping_address = Column(JSON, nullable=False)
    
    # Money / Calculations
    subtotal = Column(Numeric(10, 2), nullable=False)
    gst_percent = Column(Float, default=12.0, nullable=False)
    gst_amount = Column(Numeric(10, 2), nullable=False)
    shipping_fee = Column(Numeric(10, 2), default=0.0, nullable=False)
    discount_amount = Column(Numeric(10, 2), default=0.0, nullable=False)
    grand_total = Column(Numeric(10, 2), nullable=False)
    coupon_code = Column(String(50), nullable=True)
    
    # Payment & Order Status
    payment_method = Column(String(50), default="cod")  # "razorpay", "cod", "whatsapp"
    payment_status = Column(String(50), default="pending")  # "pending", "paid", "failed", "refunded"
    order_status = Column(String(50), default="pending")  # "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"
    
    tracking_number = Column(String(100), nullable=True)
    shipping_carrier = Column(String(100), nullable=True)
    customer_notes = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    
    product_name = Column(String(255), nullable=False)
    product_sku = Column(String(100), nullable=False)
    product_image = Column(String(1000), nullable=True)
    
    unit_price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)
    
    # Full Bat Customization payload saved immutably with the order
    customization = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    
    payment_method = Column(String(50), nullable=False)  # "razorpay", "cod", "whatsapp"
    razorpay_order_id = Column(String(100), nullable=True)
    razorpay_payment_id = Column(String(100), nullable=True)
    razorpay_signature = Column(String(255), nullable=True)
    
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(50), default="pending")  # "pending", "success", "failed", "refunded"
    gateway_response = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    order = relationship("Order", back_populates="payments")
