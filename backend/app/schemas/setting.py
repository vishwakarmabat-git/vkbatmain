from datetime import datetime
from typing import Optional, Dict
from pydantic import BaseModel

class SettingSchema(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SettingUpdate(BaseModel):
    value: str
    description: Optional[str] = None

class BatchSettingsUpdate(BaseModel):
    settings: Dict[str, str]
