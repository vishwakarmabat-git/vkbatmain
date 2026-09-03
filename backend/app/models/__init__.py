from app.core.database import Base
from app.models.user import User, Address
from app.models.category import Category
from app.models.product import Product, ProductImage, InventoryVariant
from app.models.order import Order, OrderItem, Payment
from app.models.review import Review
from app.models.coupon import Coupon
from app.models.wishlist import Wishlist, WishlistItem
from app.models.cms import CMSBanner, Testimonial, FAQ, GalleryItem
from app.models.setting import Setting
from app.models.activity_log import AdminActivityLog
from app.models.bulk_order import BulkOrder
from app.models.legal import LegalDocument, ConsentRecord, MarketingPreference, PrivacyRequest

__all__ = [
    "Base",
    "User",
    "Address",
    "Category",
    "Product",
    "ProductImage",
    "InventoryVariant",
    "Order",
    "OrderItem",
    "Payment",
    "Review",
    "Coupon",
    "Wishlist",
    "WishlistItem",
    "CMSBanner",
    "Testimonial",
    "FAQ",
    "GalleryItem",
    "Setting",
    "AdminActivityLog",
    "BulkOrder",
    "LegalDocument",
    "ConsentRecord",
    "MarketingPreference",
    "PrivacyRequest",
]
