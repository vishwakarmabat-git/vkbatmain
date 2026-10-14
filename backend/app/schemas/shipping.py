from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class PincodeLookupResponse(BaseModel):
    pincode: str
    city: str
    state: str

class ServiceabilityRequest(BaseModel):
    destination_pincode: str = Field(..., min_length=6, max_length=6, description="6-digit Indian delivery pincode")
    origin_pincode: Optional[str] = Field(None, min_length=6, max_length=6, description="Optional pickup pincode")
    payment_mode: Optional[str] = Field("PREPAID", description="PREPAID or COD")

class CourierServiceInfo(BaseModel):
    code: str
    name: str
    estimated_days: Optional[int] = None
    services: List[Dict[str, Any]] = []

class ServiceabilityResponse(BaseModel):
    serviceable: bool
    origin: str
    destination: str
    zone: Optional[str] = None
    zone_name: Optional[str] = None
    payment_mode: str
    cod_available: bool = False
    prepaid_available: bool = True
    couriers: List[CourierServiceInfo] = []
    message: Optional[str] = None

class RateOrderItemInput(BaseModel):
    product_id: str
    quantity: int = 1

class RateCalculationRequest(BaseModel):
    destination_pincode: str = Field(..., min_length=6, max_length=6)
    origin_pincode: Optional[str] = None
    items: Optional[List[RateOrderItemInput]] = None
    weight_kg: Optional[float] = None
    length_cm: Optional[float] = None
    width_cm: Optional[float] = None
    height_cm: Optional[float] = None
    payment_mode: Optional[str] = "PREPAID"
    cod_amount: Optional[float] = 0.0

class CourierQuote(BaseModel):
    courier_code: str
    courier_name: str
    service: str
    service_label: str
    display_name: str
    zone: Optional[str] = None
    freight: float
    cod_charge: float
    gst_amount: float
    total: float
    total_with_gst: float
    rto_charge: Optional[float] = None
    estimated_days: Optional[int] = None
    recommended: bool = False

class RateCalculationResponse(BaseModel):
    serviceable: bool
    origin_pincode: str
    destination_pincode: str
    zone: Optional[str] = None
    zone_name: Optional[str] = None
    payment_mode: str
    chargeable_weight_kg: float
    volumetric_weight_kg: float
    dead_weight_kg: float
    length_cm: float
    width_cm: float
    height_cm: float
    gst_percent: float = 18.0
    couriers: List[CourierQuote] = []
    error: Optional[str] = None
