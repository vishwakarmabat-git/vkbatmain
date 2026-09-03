import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.dependencies.auth import get_current_user, get_current_active_admin
from app.models.user import User
from app.models.legal import LegalDocument, ConsentRecord, MarketingPreference, PrivacyRequest
from app.schemas.legal import (
    LegalDocumentResponse,
    LegalDocumentUpdate,
    ConsentRecordCreate,
    ConsentRecordResponse,
    MarketingPreferenceUpdate,
    MarketingPreferenceResponse,
    PrivacyRequestCreate,
    PrivacyRequestResponse,
    PrivacyRequestStatusUpdate,
    ReconsentStatusResponse,
)
from app.utils.legal_defaults import DEFAULT_LEGAL_DOCUMENTS
from app.core.security import verify_password

router = APIRouter(prefix="", tags=["Legal & Compliance"])

def _ensure_default_documents(db: Session):
    """Seed default legal policies if not present in the database."""
    count = db.query(LegalDocument).count()
    if count == 0:
        for doc in DEFAULT_LEGAL_DOCUMENTS:
            db_doc = LegalDocument(
                slug=doc["slug"],
                title=doc["title"],
                category=doc["category"],
                content=doc["content"],
                version=doc["version"],
                effective_date=doc["effective_date"],
                requires_reconsent=doc["requires_reconsent"],
                is_active=True,
            )
            db.add(db_doc)
        db.commit()
    else:
        # Check if any individual standard slug is missing
        existing_slugs = {d.slug for d in db.query(LegalDocument.slug).all()}
        for doc in DEFAULT_LEGAL_DOCUMENTS:
            if doc["slug"] not in existing_slugs:
                db_doc = LegalDocument(
                    slug=doc["slug"],
                    title=doc["title"],
                    category=doc["category"],
                    content=doc["content"],
                    version=doc["version"],
                    effective_date=doc["effective_date"],
                    requires_reconsent=doc["requires_reconsent"],
                    is_active=True,
                )
                db.add(db_doc)
        db.commit()

# ==============================================================================
# Public Legal Document Endpoints
# ==============================================================================

@router.get("/legal/documents", response_model=List[LegalDocumentResponse])
def get_all_legal_documents(db: Session = Depends(get_db)):
    """Retrieve all active legal policies and customer support documents."""
    _ensure_default_documents(db)
    return db.query(LegalDocument).filter(LegalDocument.is_active == True).all()

@router.get("/legal/documents/{slug}", response_model=LegalDocumentResponse)
def get_legal_document(slug: str, db: Session = Depends(get_db)):
    """Retrieve a single legal document by slug (e.g. privacy-policy, terms-and-conditions)."""
    _ensure_default_documents(db)
    doc = db.query(LegalDocument).filter(LegalDocument.slug == slug, LegalDocument.is_active == True).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Legal document '{slug}' not found."
        )
    return doc

# ==============================================================================
# Consent Management Endpoints
# ==============================================================================

@router.post("/legal/consent", response_model=ConsentRecordResponse, status_code=status.HTTP_201_CREATED)
def record_consent(
    data: ConsentRecordCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Record an auditable consent entry (e.g., checkout terms acknowledgement, cookie preferences).
    Extracts optional user token if available.
    """
    # Extract client metadata for audit verification
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    user_id = None
    # Check if authorization header is provided
    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            from app.core.security import decode_access_token
            payload = decode_access_token(token)
            if payload and payload.get("sub"):
                user_id = payload["sub"]
        except Exception:
            pass

    consent = ConsentRecord(
        user_id=user_id,
        consent_type=data.consent_type.upper(),
        document_type=data.document_type,
        document_version=data.document_version,
        consent_status=data.consent_status.upper(),
        source=data.source,
        ip_address=data.ip_address or client_ip,
        user_agent=data.user_agent or user_agent
    )
    db.add(consent)
    db.commit()
    db.refresh(consent)
    return consent

@router.get("/legal/my-consent", response_model=List[ConsentRecordResponse])
def get_my_consent_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve the authenticated user's consent audit trail."""
    return (
        db.query(ConsentRecord)
        .filter(ConsentRecord.user_id == current_user.id)
        .order_by(desc(ConsentRecord.created_at))
        .all()
    )

@router.get("/legal/check-reconsent", response_model=ReconsentStatusResponse)
def check_reconsent_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify if the logged-in user needs a one-time re-consent prompt due to material policy revisions.
    """
    _ensure_default_documents(db)
    
    # Check policies that require reconsent
    reconsent_docs = db.query(LegalDocument).filter(
        LegalDocument.requires_reconsent == True,
        LegalDocument.is_active == True
    ).all()

    if not reconsent_docs:
        return {"requires_reconsent": False, "pending_documents": []}

    pending = []
    for doc in reconsent_docs:
        # Check if user has already accepted this specific version
        accepted = db.query(ConsentRecord).filter(
            ConsentRecord.user_id == current_user.id,
            ConsentRecord.document_type == doc.slug,
            ConsentRecord.document_version == doc.version,
            ConsentRecord.consent_status == "ACCEPTED"
        ).first()

        if not accepted:
            pending.append({
                "slug": doc.slug,
                "title": doc.title,
                "version": doc.version,
                "effective_date": doc.effective_date
            })

    return {
        "requires_reconsent": len(pending) > 0,
        "pending_documents": pending
    }

# ==============================================================================
# Marketing Preferences Endpoints
# ==============================================================================

@router.get("/legal/marketing-preferences", response_model=MarketingPreferenceResponse)
def get_marketing_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve current customer's separate marketing channel preferences."""
    pref = db.query(MarketingPreference).filter(MarketingPreference.user_id == current_user.id).first()
    if not pref:
        pref = MarketingPreference(
            user_id=current_user.id,
            email_marketing=False,
            sms_marketing=False,
            whatsapp_marketing=False
        )
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

@router.put("/legal/marketing-preferences", response_model=MarketingPreferenceResponse)
def update_marketing_preferences(
    data: MarketingPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update separate marketing channels (Email, SMS, WhatsApp) without affecting account status."""
    pref = db.query(MarketingPreference).filter(MarketingPreference.user_id == current_user.id).first()
    if not pref:
        pref = MarketingPreference(user_id=current_user.id)
        db.add(pref)

    pref.email_marketing = data.email_marketing
    pref.sms_marketing = data.sms_marketing
    pref.whatsapp_marketing = data.whatsapp_marketing
    pref.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(pref)

    # Record consent change in audit log
    consent_status = "ACCEPTED" if (data.email_marketing or data.sms_marketing or data.whatsapp_marketing) else "REVOKED"
    audit = ConsentRecord(
        user_id=current_user.id,
        consent_type="MARKETING_PROMOTIONS",
        document_type="marketing",
        document_version="1.0",
        consent_status=consent_status,
        source="profile_settings"
    )
    db.add(audit)
    db.commit()

    return pref

# ==============================================================================
# Customer Data Rights & Account Deletion Requests
# ==============================================================================

@router.post("/legal/privacy-request", response_model=PrivacyRequestResponse, status_code=status.HTTP_201_CREATED)
def create_privacy_request(
    data: PrivacyRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a privacy or account deletion request.
    For ACCOUNT_DELETION: verifies user's current password to prevent unauthorized account closure.
    """
    if data.request_type == "ACCOUNT_DELETION":
        if not data.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Your current password is required to verify account deletion."
            )
        if not verify_password(data.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect password. Account deletion request could not be authenticated."
            )

    req = PrivacyRequest(
        user_id=current_user.id,
        customer_email=current_user.email,
        customer_name=current_user.full_name,
        request_type=data.request_type.upper(),
        status="PENDING",
        reason=data.reason,
        admin_notes="Request submitted via customer privacy portal. Awaiting administrative review & statutory tax record check."
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req

@router.get("/legal/my-privacy-requests", response_model=List[PrivacyRequestResponse])
def get_my_privacy_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """View customer's own submitted privacy and account deletion requests."""
    return (
        db.query(PrivacyRequest)
        .filter(PrivacyRequest.user_id == current_user.id)
        .order_by(desc(PrivacyRequest.created_at))
        .all()
    )

# ==============================================================================
# Admin Legal & Compliance Management Endpoints
# ==============================================================================

@router.get("/admin/legal/documents", response_model=List[LegalDocumentResponse])
def admin_get_all_documents(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin endpoint: Retrieve all legal documents for editing."""
    _ensure_default_documents(db)
    return db.query(LegalDocument).order_by(LegalDocument.slug).all()

@router.put("/admin/legal/documents/{slug}", response_model=LegalDocumentResponse)
def admin_update_document(
    slug: str,
    data: LegalDocumentUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin endpoint: Update policy content, version, or toggle re-consent requirement."""
    _ensure_default_documents(db)
    doc = db.query(LegalDocument).filter(LegalDocument.slug == slug).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Legal document '{slug}' not found."
        )

    if data.title is not None:
        doc.title = data.title
    if data.content is not None:
        doc.content = data.content
    if data.version is not None:
        doc.version = data.version
    if data.effective_date is not None:
        doc.effective_date = data.effective_date
    if data.requires_reconsent is not None:
        doc.requires_reconsent = data.requires_reconsent
    if data.is_active is not None:
        doc.is_active = data.is_active

    doc.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(doc)
    return doc

@router.get("/admin/legal/consent-records", response_model=List[ConsentRecordResponse])
def admin_get_consent_records(
    consent_type: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin audit trail: Search and inspect consent records."""
    query = db.query(ConsentRecord)
    if consent_type:
        query = query.filter(ConsentRecord.consent_type == consent_type.upper())
    return query.order_by(desc(ConsentRecord.created_at)).limit(limit).all()

@router.get("/admin/legal/privacy-requests", response_model=List[PrivacyRequestResponse])
def admin_get_privacy_requests(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin queue: Review account deletion and customer data requests."""
    query = db.query(PrivacyRequest)
    if status_filter:
        query = query.filter(PrivacyRequest.status == status_filter.upper())
    return query.order_by(desc(PrivacyRequest.created_at)).all()

@router.put("/admin/legal/privacy-requests/{request_id}", response_model=PrivacyRequestResponse)
def admin_update_privacy_request(
    request_id: str,
    data: PrivacyRequestStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    """Admin action: Update status of privacy request (e.g. deactivate user on COMPLETED)."""
    req = db.query(PrivacyRequest).filter(PrivacyRequest.id == request_id).first()
    if not req:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Privacy request not found."
        )

    req.status = data.status.upper()
    if data.admin_notes:
        req.admin_notes = data.admin_notes
    req.updated_at = datetime.now(timezone.utc)

    # If completed and was ACCOUNT_DELETION: deactivate the user account
    if req.status == "COMPLETED" and req.request_type == "ACCOUNT_DELETION" and req.user_id:
        user = db.query(User).filter(User.id == req.user_id).first()
        if user:
            user.is_active = False
            # Clear marketing preferences
            pref = db.query(MarketingPreference).filter(MarketingPreference.user_id == user.id).first()
            if pref:
                pref.email_marketing = False
                pref.sms_marketing = False
                pref.whatsapp_marketing = False

    db.commit()
    db.refresh(req)
    return req
