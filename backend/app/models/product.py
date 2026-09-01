import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, Text, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    short_description = Column(Text, nullable=True)
    full_description = Column(Text, nullable=True)
    
    price = Column(Numeric(10, 2), nullable=False)
    compare_price = Column(Numeric(10, 2), nullable=True)
    discount_percent = Column(Integer, default=0)
    
    # Cricket Bat Specific Attributes
    willow_grade = Column(String(100), nullable=True)  # Grade 1+ English Willow, etc.
    blade_architecture = Column(String(100), nullable=True)  # Single Blade, Double Blade, Triple Blade Hard Pressed, etc.
    pressing_type = Column(String(100), nullable=True)  # Standard, High-Density Hard Pressed, Dual Cold Pressed
    edge_thickness = Column(String(50), nullable=True)  # 38-40mm, 42-45mm
    spine_height = Column(String(50), nullable=True)  # 64-67mm
    sweet_spot = Column(String(100), nullable=True)  # Mid, Mid-to-Low, High-Power Extended
    handle_cane = Column(String(100), nullable=True)  # 12-Piece Multi-Piece Sarawak Cane with Rubber Inserts
    toe_profile = Column(String(100), nullable=True)  # Duckbill with Pro Toe Guard
    grain_count = Column(String(50), nullable=True)  # 8-12 Laser Straight Grains
    bow_profile = Column(String(100), nullable=True)  # Subtle Pro Sub-Continental Bow
    
    stock_quantity = Column(Integer, default=10, nullable=False)
    is_featured = Column(Boolean, default=False)
    is_bestseller = Column(Boolean, default=False)
    status = Column(String(50), default="active")  # "active", "draft", "archived"
    
    rating_avg = Column(Float, default=5.0)
    reviews_count = Column(Integer, default=0)
    
    # SEO
    seo_title = Column(String(255), nullable=True)
    seo_description = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.display_order")
    variants = relationship("InventoryVariant", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")
    wishlist_items = relationship("WishlistItem", back_populates="product", cascade="all, delete-orphan")

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(1000), nullable=False)
    alt_text = Column(String(255), nullable=True)
    display_order = Column(Integer, default=0)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    product = relationship("Product", back_populates="images")

class InventoryVariant(Base):
    __tablename__ = "inventory_variants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    weight_option = Column(String(50), nullable=False)  # 1120-1150g, 1150-1180g, etc.
    handle_shape = Column(String(50), default="Round")  # Round, Oval, Semi-Oval
    stock_quantity = Column(Integer, default=5, nullable=False)
    low_stock_threshold = Column(Integer, default=2)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    product = relationship("Product", back_populates="variants")
