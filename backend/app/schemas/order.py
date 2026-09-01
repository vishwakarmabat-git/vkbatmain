from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr

class CustomizationSchema(BaseModel):
    weight: Optional[str] = "1150–1180g"
    handle_shape: Optional[str] = "Round"
    handle_size: Optional[str] = "SH"
    grip_pattern: Optional[str] = "Chevron"
    grip_color: Optional[str] = "Metallic Gold"
    grip_count: Optional[str] = "Single"
    sticker_finish: Optional[str] = "Laser Gold"
    pre_knocking: Optional[str] = "Raw"
    oiling: Optional[str] = "None"
    face_protection: Optional[str] = "None"
    custom_engraving: Optional[str] = None
    extra_cost: Optional[float] = 0.0

class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int = 1
    customization: Optional[CustomizationSchema] = None

class ShippingAddressSchema(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    address_line1: str
    address_line2: Optional[str] = None
    landmark: Optional[str] = None
    city: str
    state: str
    pincode: str

class OrderCreate(BaseModel):
    shipping_address: ShippingAddressSchema
    items: List[OrderItemCreate]
    coupon_code: Optional[str] = None
    payment_method: str = "cod"  # "razorpay", "cod", "whatsapp"
    customer_notes: Optional[str] = None

class OrderItemResponse(BaseModel):
    id: str
    product_id: Optional[str] = None
    product_name: str
    product_sku: str
    product_image: Optional[str] = None
    unit_price: float
    quantity: int
    total_price: float
    customization: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: str
    order_number: str
    user_id: Optional[str] = None
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: Dict[str, Any]
    subtotal: float
    gst_percent: float
    gst_amount: float
    shipping_fee: float
    discount_amount: float
    grand_total: float
    coupon_code: Optional[str] = None
    payment_method: str
    payment_status: str
    order_status: str
    tracking_number: Optional[str] = None
    shipping_carrier: Optional[str] = None
    customer_notes: Optional[str] = None
    admin_notes: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    order_status: Optional[str] = None
    payment_status: Optional[str] = None
    tracking_number: Optional[str] = None
    shipping_carrier: Optional[str] = None
    admin_notes: Optional[str] = None

class PaymentVerifyRequest(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class WhatsAppOrderRequest(BaseModel):
    items: List[OrderItemCreate]
    customer_name: str
    customer_phone: str
    city: str
    notes: Optional[str] = None
