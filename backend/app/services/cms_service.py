from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.cms import CMSBanner, Testimonial, FAQ, GalleryItem
from app.schemas.cms import (
    CMSBannerCreate, CMSBannerUpdate,
    TestimonialCreate,
    FAQCreate,
    GalleryItemCreate
)

class CMSService:
    @staticmethod
    def get_banners(db: Session, active_only: bool = True):
        query = db.query(CMSBanner)
        if active_only:
            query = query.filter(CMSBanner.is_active == True)
        return query.order_by(CMSBanner.display_order.asc()).all()

    @staticmethod
    def get_testimonials(db: Session, active_only: bool = True):
        query = db.query(Testimonial)
        if active_only:
            query = query.filter(Testimonial.is_active == True)
        return query.order_by(Testimonial.display_order.asc()).all()

    @staticmethod
    def get_faqs(db: Session, active_only: bool = True):
        query = db.query(FAQ)
        if active_only:
            query = query.filter(FAQ.is_active == True)
        return query.order_by(FAQ.display_order.asc()).all()

    @staticmethod
    def get_gallery(db: Session, category: str = None, active_only: bool = True):
        query = db.query(GalleryItem)
        if active_only:
            query = query.filter(GalleryItem.is_active == True)
        if category:
            query = query.filter(GalleryItem.category == category)
        return query.order_by(GalleryItem.display_order.asc()).all()
