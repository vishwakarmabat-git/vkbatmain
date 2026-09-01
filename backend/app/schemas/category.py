from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    blade_type: Optional[str] = None
    image_url: Optional[str] = None
    starting_price: float = 0.0
    display_order: int = 0
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    blade_type: Optional[str] = None
    image_url: Optional[str] = None
    starting_price: Optional[float] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    id: str
    created_at: datetime
    products_count: Optional[int] = 0

    class Config:
        from_attributes = True
