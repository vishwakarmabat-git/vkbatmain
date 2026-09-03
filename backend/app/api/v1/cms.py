from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.cms import CMSBanner, Testimonial, FAQ, GalleryItem
from app.schemas.cms import (
    CMSBannerCreate, CMSBannerUpdate, CMSBannerResponse,
    TestimonialCreate, TestimonialResponse,
    FAQCreate, FAQResponse,
    GalleryItemCreate, GalleryItemUpdate, GalleryItemResponse,
    WhyVKSectionSchema
)
from app.models.setting import Setting
import json
from app.services.cms_service import CMSService
from app.dependencies.auth import get_current_active_admin
from app.models.user import User

router = APIRouter(prefix="/cms", tags=["CMS Content"])

# --- BANNERS ---
@router.get("/banners", response_model=List[CMSBannerResponse])
def get_banners(db: Session = Depends(get_db)):
    return CMSService.get_banners(db, active_only=True)

@router.get("/admin/banners", response_model=List[CMSBannerResponse])
def get_all_banners_admin(db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    return CMSService.get_banners(db, active_only=False)

@router.post("/banners", response_model=CMSBannerResponse, status_code=status.HTTP_201_CREATED)
def create_banner(data: CMSBannerCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    banner = CMSBanner(**data.model_dump())
    db.add(banner)
    db.commit()
    db.refresh(banner)
    from app.utils.realtime import emit_realtime_event
    emit_realtime_event("public", "BANNER_UPDATED", "banner", {"id": banner.id})
    return banner

@router.put("/banners/{banner_id}", response_model=CMSBannerResponse)
def update_banner(banner_id: str, data: CMSBannerUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    banner = db.query(CMSBanner).filter(CMSBanner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(banner, k, v)
    db.commit()
    db.refresh(banner)
    from app.utils.realtime import emit_realtime_event
    emit_realtime_event("public", "BANNER_UPDATED", "banner", {"id": banner.id})
    return banner

@router.delete("/banners/{banner_id}")
def delete_banner(banner_id: str, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    banner = db.query(CMSBanner).filter(CMSBanner.id == banner_id).first()
    if not banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    db.delete(banner)
    db.commit()
    from app.utils.realtime import emit_realtime_event
    emit_realtime_event("public", "BANNER_UPDATED", "banner", {"id": banner_id})
    return {"success": True, "message": "Banner deleted"}

# --- TESTIMONIALS ---
@router.get("/testimonials", response_model=List[TestimonialResponse])
def get_testimonials(db: Session = Depends(get_db)):
    return CMSService.get_testimonials(db, active_only=True)

@router.post("/testimonials", response_model=TestimonialResponse, status_code=status.HTTP_201_CREATED)
def create_testimonial(data: TestimonialCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    item = Testimonial(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/testimonials/{item_id}")
def delete_testimonial(item_id: str, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    item = db.query(Testimonial).filter(Testimonial.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    db.delete(item)
    db.commit()
    return {"success": True, "message": "Testimonial deleted"}

# --- FAQS ---
@router.get("/faqs", response_model=List[FAQResponse])
def get_faqs(db: Session = Depends(get_db)):
    return CMSService.get_faqs(db, active_only=True)

@router.post("/faqs", response_model=FAQResponse, status_code=status.HTTP_201_CREATED)
def create_faq(data: FAQCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    item = FAQ(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/faqs/{item_id}")
def delete_faq(item_id: str, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    item = db.query(FAQ).filter(FAQ.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="FAQ not found")
    db.delete(item)
    db.commit()
    return {"success": True, "message": "FAQ deleted"}

# --- GALLERY ---
@router.get("/gallery", response_model=List[GalleryItemResponse])
def get_gallery(category: Optional[str] = Query(None), db: Session = Depends(get_db)):
    return CMSService.get_gallery(db, category=category, active_only=True)

@router.get("/admin/gallery", response_model=List[GalleryItemResponse])
def get_all_gallery_admin(category: Optional[str] = Query(None), db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    return CMSService.get_gallery(db, category=category, active_only=False)

@router.post("/gallery", response_model=GalleryItemResponse, status_code=status.HTTP_201_CREATED)
def create_gallery_item(data: GalleryItemCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    item = GalleryItem(**data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    from app.utils.realtime import emit_realtime_event
    emit_realtime_event("public", "GALLERY_UPDATED", "gallery", {"id": item.id})
    return item

@router.put("/gallery/{item_id}", response_model=GalleryItemResponse)
def update_gallery_item(item_id: str, data: GalleryItemUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    from app.utils.realtime import emit_realtime_event
    emit_realtime_event("public", "GALLERY_UPDATED", "gallery", {"id": item.id})
    return item

@router.delete("/gallery/{item_id}")
def delete_gallery_item(item_id: str, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    db.delete(item)
    db.commit()
    from app.utils.realtime import emit_realtime_event
    emit_realtime_event("public", "GALLERY_UPDATED", "gallery", {"id": item_id})
    return {"success": True, "message": "Gallery item deleted"}

# --- WHY VK SECTION ---
DEFAULT_WHY_VK = {
    "badge": "WHY VK?",
    "title": "Built\nDifferent.\nPerforms\nDifferent.",
    "image_url": "/standing_bat_hero.jpg",
    "image_badge": "PREMIUM GRADE-A WILLOW",
    "features": [
        {
            "number": "01",
            "title": "ARTISAN HANDCRAFTED",
            "description": "Shaped manually by third-generation batmakers in Chaklasi. We refine the curvature of every blade to guarantee the perfect aerodynamic pickup and sweep."
        },
        {
            "number": "02",
            "title": "5-TON PRESSING",
            "description": "Pressed under 5-ton setups to compact the willow cells, assuring extreme durability and an explosive ping response straight out of the box."
        },
        {
            "number": "03",
            "title": "OPTIMAL POWER-TO-WEIGHT",
            "description": "Thick profiles (40mm+ edges, 60mm+ spine) paired with balanced weight distribution, offering massive power without sacrificing hand speed."
        },
        {
            "number": "04",
            "title": "SINGAPORE CANE HANDLES",
            "description": "Built with premium multi-piece cane handles wrapped in high-tension thread and epoxy to absorb heavy impacts and reduce sting vibrations."
        }
    ]
}

@router.get("/why-vk", response_model=WhyVKSectionSchema)
def get_why_vk_section(db: Session = Depends(get_db)):
    setting = db.query(Setting).filter(Setting.key == "why_vk_section").first()
    if setting and setting.value:
        try:
            return json.loads(setting.value)
        except Exception:
            pass
    return DEFAULT_WHY_VK

@router.put("/why-vk", response_model=WhyVKSectionSchema)
def update_why_vk_section(
    data: WhyVKSectionSchema,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    setting = db.query(Setting).filter(Setting.key == "why_vk_section").first()
    json_val = json.dumps(data.model_dump())
    if setting:
        setting.value = json_val
    else:
        setting = Setting(key="why_vk_section", value=json_val, description="Homepage Why VK Showcase section content")
        db.add(setting)
    db.commit()
    db.refresh(setting)

    try:
        from app.utils.realtime import emit_realtime_event
        emit_realtime_event("public", "WHY_VK_UPDATED", "cms", data.model_dump())
        emit_realtime_event("public", "CMS_UPDATED", "cms", data.model_dump())
    except Exception:
        pass

    return data
