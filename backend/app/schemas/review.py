from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class ReviewCreate(BaseModel):
    product_id: str
    reviewer_name: str
    reviewer_email: Optional[EmailStr] = None
    rating: int = Field(ge=1, le=5)
    title: str = Field(min_length=2)
    comment: str = Field(min_length=5)

class ReviewStatusUpdate(BaseModel):
    status: str  # "pending", "approved", "rejected"
    is_featured: Optional[bool] = None

class ReviewResponse(BaseModel):
    id: str
    product_id: str
    user_id: Optional[str] = None
    reviewer_name: str
    rating: int
    title: str
    comment: str
    is_verified_purchase: bool
    status: str
    is_featured: bool
    created_at: datetime
    product_name: Optional[str] = None

    class Config:
        from_attributes = True
