from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.setting import Setting
from app.schemas.setting import SettingSchema, SettingUpdate, BatchSettingsUpdate
from app.dependencies.auth import get_current_active_admin
from app.models.user import User
from app.core.config import settings as app_settings

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/public")
def get_public_settings(db: Session = Depends(get_db)):
    db_settings = {s.key: s.value for s in db.query(Setting).all()}
    return {
        "brand_name": "Vishwakarma Bat House",
        "tagline": "Samurai-Precision Handcrafted Cricket Bats",
        "gst_percentage": float(db_settings.get("gst_percentage", app_settings.GST_PERCENTAGE)),
        "default_shipping_fee": float(db_settings.get("default_shipping_fee", app_settings.DEFAULT_SHIPPING_FEE)),
        "free_shipping_threshold": float(db_settings.get("free_shipping_threshold", app_settings.FREE_SHIPPING_THRESHOLD)),
        "whatsapp_number": db_settings.get("whatsapp_number", app_settings.WHATSAPP_NUMBER),
        "contact_email": db_settings.get("contact_email", app_settings.CONTACT_EMAIL),
        "contact_phone": db_settings.get("contact_phone", "+91 98765 43210"),
        "workshop_address": db_settings.get("workshop_address", "VK Artisan Bat Workshop, Industrial Area, Meerut / Jalandhar, India"),
        "announcement_bar": db_settings.get("announcement_bar", "⚡ FREE SHIPPING ON ORDERS ABOVE ₹15,000 | 100% GENUINE ENGLISH WILLOW WITH WARRANTY")
    }

@router.get("", response_model=List[SettingSchema])
@router.get("/all", response_model=List[SettingSchema])
def get_all_settings(db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    return db.query(Setting).all()

@router.put("/batch")
def update_batch_settings(data: BatchSettingsUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    for key, value in data.settings.items():
        s = db.query(Setting).filter(Setting.key == key).first()
        if s:
            s.value = str(value)
        else:
            db.add(Setting(key=key, value=str(value)))
    db.commit()
    return {"success": True, "message": "Settings updated successfully"}
