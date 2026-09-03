from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class BulkOrderCreate(BaseModel):
    inquiry_type: Optional[str] = "bulk_order"
    name: str
    phone: str
    email: Optional[str] = None
    club_name: Optional[str] = None
    order_quantity: Optional[str] = None
    bat_models: Optional[str] = None
    details: str

class BulkOrderStatusUpdate(BaseModel):
    status: str
    admin_notes: Optional[str] = None

class BulkOrderResponse(BaseModel):
    id: str
    inquiry_type: str
    name: str
    phone: str
    email: Optional[str] = None
    club_name: Optional[str] = None
    order_quantity: Optional[str] = None
    bat_models: Optional[str] = None
    details: str
    status: str
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
