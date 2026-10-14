from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class ShipmentBookingRequest(BaseModel):
    courier_code: Optional[str] = Field(None, description="Target courier, e.g. 'ekart', 'delhivery'")
    courier_service: Optional[str] = Field(None, description="Target service, e.g. 'SURFACE', 'AIR', 'NDD'")
    pickup_address_uid: Optional[str] = Field(None, description="Saved warehouse address UID")
    custom_weight_kg: Optional[float] = None
    custom_length_cm: Optional[float] = None
    custom_width_cm: Optional[float] = None
    custom_height_cm: Optional[float] = None

class ShipmentResponse(BaseModel):
    id: str
    order_id: str
    order_number: Optional[str] = None
    provider: str
    tracking_id: str
    courier_name: Optional[str] = None
    courier_code: Optional[str] = None
    courier_service: Optional[str] = None
    courier_awb: Optional[str] = None
    shipping_charge: float
    currency: str = "INR"
    payment_mode: str
    cod_amount: float
    shipment_status: str
    zone: Optional[str] = None
    chargeable_weight_kg: Optional[float] = None
    tracking_url: Optional[str] = None
    label_url: Optional[str] = None
    is_sandbox: bool
    failure_reason: Optional[str] = None
    booked_at: datetime
    picked_up_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    timeline_data: Optional[List[Dict[str, Any]]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ShipmentTrackingTimelineItem(BaseModel):
    status: str
    notes: Optional[str] = None
    location: Optional[str] = None
    timestamp: Optional[str] = None

class ShipmentTrackingScanItem(BaseModel):
    at: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None

class ShipmentTrackingResponse(BaseModel):
    tracking_id: str
    order_id: str
    order_number: str
    carrier: str
    service: str
    courier_awb: Optional[str] = None
    status: str
    status_label: str
    payment_mode: str
    cod_amount: float
    shipping_charge: float
    zone: Optional[str] = None
    booked_at: Optional[str] = None
    delivered_at: Optional[str] = None
    tracking_url: Optional[str] = None
    timeline: List[ShipmentTrackingTimelineItem] = []
    scans: List[ShipmentTrackingScanItem] = []

class CancelShipmentRequest(BaseModel):
    reason: Optional[str] = "Customer requested cancellation"

class ShipmentListResponse(BaseModel):
    count: int
    shipments: List[ShipmentResponse]
    items: Optional[List[ShipmentResponse]] = None
    total: Optional[int] = None
    page: Optional[int] = 1
    limit: Optional[int] = 15
    pages: Optional[int] = 1

