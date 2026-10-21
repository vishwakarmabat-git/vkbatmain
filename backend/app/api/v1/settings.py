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
    
    # Support both gst_rate (from admin) and gst_percentage (legacy)
    raw_gst = db_settings.get("gst_rate") or db_settings.get("gst_percentage") or app_settings.GST_PERCENTAGE
    try:
        gst_val = float(raw_gst)
    except (ValueError, TypeError):
        gst_val = 0.0

    raw_shipping = db_settings.get("shipping_fee") or db_settings.get("default_shipping_fee") or app_settings.DEFAULT_SHIPPING_FEE
    try:
        shipping_val = float(raw_shipping)
    except (ValueError, TypeError):
        shipping_val = 0.0

    raw_free_threshold = db_settings.get("free_shipping_threshold") or app_settings.FREE_SHIPPING_THRESHOLD
    try:
        free_thresh_val = float(raw_free_threshold)
    except (ValueError, TypeError):
        free_thresh_val = 0.0

    return {
        "brand_name": "Vishwakarma Bat House",
        "tagline": "Samurai-Precision Handcrafted Cricket Bats",
        "gst_percentage": gst_val,
        "gst_rate": gst_val,
        "default_shipping_fee": shipping_val,
        "shipping_fee": shipping_val,
        "free_shipping_threshold": free_thresh_val,
        "whatsapp_number": db_settings.get("whatsapp_number", app_settings.WHATSAPP_NUMBER),
        "contact_email": db_settings.get("contact_email", app_settings.CONTACT_EMAIL),
        "contact_phone": db_settings.get("contact_phone", "+91 98765 43210"),
        "workshop_address": db_settings.get("workshop_address", "VK Artisan Bat Workshop, Industrial Area, Meerut / Jalandhar, India"),
        "announcement_bar": db_settings.get("announcement_bar", "⚡ FREE SHIPPING ON ORDERS ABOVE ₹15,000 | 100% GENUINE Kashmir WILLOW WITH WARRANTY")
    }

@router.get("", response_model=List[SettingSchema])
@router.get("/all", response_model=List[SettingSchema])
def get_all_settings(db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    return db.query(Setting).all()

@router.put("/batch")
def update_batch_settings(data: BatchSettingsUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    settings_dict = dict(data.settings)
    # Mirror gst_rate and gst_percentage
    if "gst_rate" in settings_dict and "gst_percentage" not in settings_dict:
        settings_dict["gst_percentage"] = settings_dict["gst_rate"]
    elif "gst_percentage" in settings_dict and "gst_rate" not in settings_dict:
        settings_dict["gst_rate"] = settings_dict["gst_percentage"]

    if "shipping_fee" in settings_dict and "default_shipping_fee" not in settings_dict:
        settings_dict["default_shipping_fee"] = settings_dict["shipping_fee"]
    elif "default_shipping_fee" in settings_dict and "shipping_fee" not in settings_dict:
        settings_dict["shipping_fee"] = settings_dict["default_shipping_fee"]

    for key, value in settings_dict.items():
        s = db.query(Setting).filter(Setting.key == key).first()
        if s:
            s.value = str(value)
        else:
            db.add(Setting(key=key, value=str(value)))
    db.commit()
    return {"success": True, "message": "Settings updated successfully"}
