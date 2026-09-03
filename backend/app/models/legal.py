import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class LegalDocument(Base):
    __tablename__ = "legal_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(50), default="legal")  # "legal" or "support"
    content = Column(Text, nullable=False)
    version = Column(String(20), default="1.0", nullable=False)
    effective_date = Column(String(100), default="September 2026", nullable=False)
    requires_reconsent = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    consent_type = Column(String(50), nullable=False, index=True)  # "TERMS_AND_PRIVACY", "TERMS_OF_SALE", "MARKETING_PROMOTIONS", "COOKIE_PREFERENCES"
    document_type = Column(String(100), nullable=False)  # "privacy-policy", "terms-and-conditions", "terms-of-sale", "marketing", "cookies"
    document_version = Column(String(20), default="1.0", nullable=False)
    consent_status = Column(String(20), default="ACCEPTED", nullable=False)  # "ACCEPTED", "REJECTED", "REVOKED"
    source = Column(String(50), default="web_registration", nullable=False)  # "registration", "checkout", "cookie_banner", "profile_settings", "reconsent_modal"
    ip_address = Column(String(100), nullable=True)
    user_agent = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref="consent_records")

class MarketingPreference(Base):
    __tablename__ = "marketing_preferences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    email_marketing = Column(Boolean, default=False, nullable=False)
    sms_marketing = Column(Boolean, default=False, nullable=False)
    whatsapp_marketing = Column(Boolean, default=False, nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref="marketing_preference", uselist=False)

class PrivacyRequest(Base):
    __tablename__ = "privacy_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    customer_email = Column(String(255), nullable=False)
    customer_name = Column(String(255), nullable=False)
    request_type = Column(String(50), default="ACCOUNT_DELETION", nullable=False)  # "ACCOUNT_DELETION", "DATA_ACCESS", "GRIEVANCE"
    status = Column(String(50), default="PENDING", nullable=False)  # "PENDING", "IN_REVIEW", "COMPLETED", "REJECTED"
    reason = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", backref="privacy_requests")
