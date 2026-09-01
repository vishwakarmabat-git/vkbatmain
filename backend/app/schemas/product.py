from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class ProductImageSchema(BaseModel):
    id: Optional[str] = None
    image_url: str
    alt_text: Optional[str] = None
    display_order: int = 0
    is_primary: bool = False

    class Config:
        from_attributes = True

class VariantSchema(BaseModel):
    id: Optional[str] = None
    sku: str
    weight_option: str
    handle_shape: str = "Round"
    stock_quantity: int = 5
    low_stock_threshold: int = 2
    is_active: bool = True

    class Config:
        from_attributes = True

class ProductBase(BaseModel):
    name: str
    slug: str
    sku: str
    category_id: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    price: float
    compare_price: Optional[float] = None
    discount_percent: int = 0
    
    willow_grade: Optional[str] = None
    blade_architecture: Optional[str] = None
    pressing_type: Optional[str] = None
    edge_thickness: Optional[str] = None
    spine_height: Optional[str] = None
    sweet_spot: Optional[str] = None
    handle_cane: Optional[str] = None
    toe_profile: Optional[str] = None
    grain_count: Optional[str] = None
    bow_profile: Optional[str] = None
    
    stock_quantity: int = 10
    is_featured: bool = False
    is_bestseller: bool = False
    status: str = "active"
    
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None

class ProductCreate(ProductBase):
    images: Optional[List[ProductImageSchema]] = []
    variants: Optional[List[VariantSchema]] = []

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    sku: Optional[str] = None
    category_id: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    price: Optional[float] = None
    compare_price: Optional[float] = None
    discount_percent: Optional[int] = None
    
    willow_grade: Optional[str] = None
    blade_architecture: Optional[str] = None
    pressing_type: Optional[str] = None
    edge_thickness: Optional[str] = None
    spine_height: Optional[str] = None
    sweet_spot: Optional[str] = None
    handle_cane: Optional[str] = None
    toe_profile: Optional[str] = None
    grain_count: Optional[str] = None
    bow_profile: Optional[str] = None
    
    stock_quantity: Optional[int] = None
    is_featured: Optional[bool] = None
    is_bestseller: Optional[bool] = None
    status: Optional[str] = None
    
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    images: Optional[List[ProductImageSchema]] = None
    variants: Optional[List[VariantSchema]] = None

class ProductResponse(ProductBase):
    id: str
    rating_avg: float
    reviews_count: int
    created_at: datetime
    images: List[ProductImageSchema] = []
    variants: List[VariantSchema] = []
    category_name: Optional[str] = None

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    limit: int
    pages: int
