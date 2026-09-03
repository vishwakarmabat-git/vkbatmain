from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

class LegalDocumentResponse(BaseModel):
    id: str
    slug: str
    title: str
    category: str
    content: str
    version: str
    effective_date: str
    requires_reconsent: bool
    is_active: bool
    updated_at: datetime

    class Config:
        from_attributes = True

class LegalDocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    version: Optional[str] = None
    effective_date: Optional[str] = None
    requires_reconsent: Optional[bool] = None
    is_active: Optional[bool] = None

class ConsentRecordCreate(BaseModel):
    consent_type: str = Field(..., description="e.g. TERMS_AND_PRIVACY, TERMS_OF_SALE, COOKIE_PREFERENCES, MARKETING_PROMOTIONS")
    document_type: str = Field(..., description="e.g. privacy-policy, terms-and-conditions, terms-of-sale, cookies")
    document_version: str = Field("1.0", description="Version of document acknowledged")
    consent_status: str = Field("ACCEPTED", description="ACCEPTED, REJECTED, or REVOKED")
    source: str = Field("web", description="e.g. registration, checkout, cookie_banner, profile")
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class ConsentRecordResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    consent_type: str
    document_type: str
    document_version: str
    consent_status: str
    source: str
    created_at: datetime

    class Config:
        from_attributes = True

class MarketingPreferenceUpdate(BaseModel):
    email_marketing: bool = False
    sms_marketing: bool = False
    whatsapp_marketing: bool = False

class MarketingPreferenceResponse(BaseModel):
    email_marketing: bool
    sms_marketing: bool
    whatsapp_marketing: bool
    updated_at: datetime

    class Config:
        from_attributes = True

class PrivacyRequestCreate(BaseModel):
    request_type: str = Field("ACCOUNT_DELETION", description="ACCOUNT_DELETION, DATA_ACCESS, or GRIEVANCE")
    reason: Optional[str] = None
    current_password: Optional[str] = None

class PrivacyRequestResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    customer_email: str
    customer_name: str
    request_type: str
    status: str
    reason: Optional[str] = None
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PrivacyRequestStatusUpdate(BaseModel):
    status: str = Field(..., description="PENDING, IN_REVIEW, COMPLETED, or REJECTED")
    admin_notes: Optional[str] = None

class ReconsentStatusResponse(BaseModel):
    requires_reconsent: bool
    pending_documents: List[dict] = []
