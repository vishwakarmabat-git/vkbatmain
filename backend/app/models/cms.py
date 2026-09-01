import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text
from app.core.database import Base

class CMSBanner(Base):
    __tablename__ = "cms_banners"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    subtitle = Column(String(255), nullable=True)
    tagline = Column(String(255), nullable=True)
    cta_text = Column(String(100), default="EXPLORE BATS")
    cta_link = Column(String(255), default="/products")
    secondary_cta_text = Column(String(100), default="CUSTOMIZE YOUR BAT")
    secondary_cta_link = Column(String(255), default="/products")
    image_url = Column(Text, nullable=True)
    video_url = Column(Text, nullable=True)
    position = Column(String(50), default="hero")  # "hero", "craftsmanship", "announcement"
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    role_or_club = Column(String(255), nullable=True)  # e.g., "Ranji Trophy Player", "First Class Cricketer"
    avatar_url = Column(String(1000), nullable=True)
    content = Column(Text, nullable=False)
    bat_model = Column(String(255), nullable=True)  # e.g., "VK Limited Edition Triple X2"
    rating = Column(Integer, default=5)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class FAQ(Base):
    __tablename__ = "faqs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    question = Column(String(500), nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String(100), default="General")  # "General", "Customization", "Shipping", "Maintenance"
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class GalleryItem(Base):
    __tablename__ = "gallery_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    caption = Column(Text, nullable=True)
    image_url = Column(Text, nullable=False)
    category = Column(String(100), default="Workshop")  # "Workshop", "Raw Willow", "Pressing", "Match Day"
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
