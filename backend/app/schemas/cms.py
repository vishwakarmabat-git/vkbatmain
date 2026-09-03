from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class CMSBannerBase(BaseModel):
    title: str
    subtitle: Optional[str] = None
    tagline: Optional[str] = None
    cta_text: str = "EXPLORE BATS"
    cta_link: str = "/products"
    secondary_cta_text: str = "CUSTOMIZE YOUR BAT"
    secondary_cta_link: str = "/products"
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    position: str = "hero"
    display_order: int = 0
    is_active: bool = True

class CMSBannerCreate(CMSBannerBase):
    pass

class CMSBannerUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    tagline: Optional[str] = None
    cta_text: Optional[str] = None
    cta_link: Optional[str] = None
    secondary_cta_text: Optional[str] = None
    secondary_cta_link: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    position: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class CMSBannerResponse(CMSBannerBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class TestimonialBase(BaseModel):
    name: str
    role_or_club: Optional[str] = None
    avatar_url: Optional[str] = None
    content: str
    bat_model: Optional[str] = None
    rating: int = 5
    display_order: int = 0
    is_active: bool = True

class TestimonialCreate(TestimonialBase):
    pass

class TestimonialResponse(TestimonialBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class FAQBase(BaseModel):
    question: str
    answer: str
    category: str = "General"
    display_order: int = 0
    is_active: bool = True

class FAQCreate(FAQBase):
    pass

class FAQResponse(FAQBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class GalleryItemBase(BaseModel):
    title: str
    caption: Optional[str] = None
    image_url: str
    category: str = "Workshop"
    display_order: int = 0
    is_active: bool = True

class GalleryItemCreate(GalleryItemBase):
    pass

class GalleryItemUpdate(BaseModel):
    title: Optional[str] = None
    caption: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class GalleryItemResponse(GalleryItemBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class WhyVKFeature(BaseModel):
    number: str
    title: str
    description: str

class WhyVKSectionSchema(BaseModel):
    badge: str = "WHY VK?"
    title: str = "Built Different. Performs Different."
    image_url: str = "/standing_bat_hero.jpg"
    image_badge: str = "PREMIUM GRADE-A WILLOW"
    features: List[WhyVKFeature] = []
