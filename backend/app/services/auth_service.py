import uuid
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, Address
from app.schemas.auth import (
    UserRegister, UserLogin, UserUpdate, PasswordChange, AddressCreate,
    GoogleAuthRequest, ResetPasswordRequest
)
from app.core.security import (
    get_password_hash, verify_password, create_access_token,
    create_password_reset_token, verify_password_reset_token
)
from app.services.email_service import EmailService

class AuthService:
    @staticmethod
    def register(db: Session, data: UserRegister) -> dict:
        if not data.accept_terms_and_privacy:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must agree to the Terms & Conditions and acknowledge the Privacy Policy to create an account."
            )

        existing = db.query(User).filter(User.email == data.email.lower()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists"
            )
        
        user = User(
            email=data.email.lower(),
            full_name=data.full_name,
            phone=data.phone,
            hashed_password=get_password_hash(data.password),
            role="customer",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Record legally auditable consent record for Terms & Privacy
        try:
            from app.models.legal import ConsentRecord, MarketingPreference, LegalDocument
            
            # Fetch active versions if present
            terms_doc = db.query(LegalDocument).filter(LegalDocument.slug == "terms-and-conditions").first()
            current_ver = terms_doc.version if terms_doc else "1.0"

            consent = ConsentRecord(
                user_id=user.id,
                consent_type="TERMS_AND_PRIVACY",
                document_type="terms-and-conditions",
                document_version=current_ver,
                consent_status="ACCEPTED",
                source="registration"
            )
            db.add(consent)

            # Store explicit, separate marketing preferences
            marketing_opt = bool(data.marketing_opt_in)
            pref = MarketingPreference(
                user_id=user.id,
                email_marketing=marketing_opt,
                sms_marketing=marketing_opt,
                whatsapp_marketing=marketing_opt
            )
            db.add(pref)

            if marketing_opt:
                mkt_consent = ConsentRecord(
                    user_id=user.id,
                    consent_type="MARKETING_PROMOTIONS",
                    document_type="marketing",
                    document_version="1.0",
                    consent_status="ACCEPTED",
                    source="registration"
                )
                db.add(mkt_consent)

            db.commit()
        except Exception as e:
            # Do not block registration if logging fails, but log trace
            print(f"[AuthService] Consent logging error: {e}")

        # Send welcome email asynchronously
        EmailService.send_welcome_email(user.email, user.full_name)

        token = create_access_token(subject=user.id, role=user.role)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user
        }

    @staticmethod
    def login(db: Session, data: UserLogin) -> dict:
        user = db.query(User).filter(User.email == data.email.lower()).first()
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated"
            )

        token = create_access_token(subject=user.id, role=user.role)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user
        }

    @staticmethod
    def google_auth(db: Session, data: GoogleAuthRequest) -> dict:
        email = data.email.lower() if data.email else f"google_user_{uuid.uuid4().hex[:8]}@gmail.com"
        full_name = data.name or "Cricket Player"

        user = db.query(User).filter(User.email == email).first()
        is_new_user = False
        if not user:
            user = User(
                email=email,
                full_name=full_name,
                hashed_password=get_password_hash(uuid.uuid4().hex),
                role="customer",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            is_new_user = True

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated"
            )

        if is_new_user:
            EmailService.send_welcome_email(user.email, user.full_name)

        token = create_access_token(subject=user.id, role=user.role)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user
        }

    @staticmethod
    def forgot_password(db: Session, email: str) -> dict:
        user = db.query(User).filter(User.email == email.lower()).first()
        if user and user.is_active:
            reset_token = create_password_reset_token(user.email)
            EmailService.send_password_reset_email(user.email, user.full_name, reset_token)

        # Always return generic success message to prevent user enumeration attacks
        return {
            "success": True,
            "message": "If an account with that email exists, a password reset link has been sent to your inbox."
        }

    @staticmethod
    def reset_password(db: Session, data: ResetPasswordRequest) -> dict:
        user_email = verify_password_reset_token(data.token)
        if not user_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired password reset link. Please request a new one."
            )

        user = db.query(User).filter(User.email == user_email.lower()).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found."
            )

        user.hashed_password = get_password_hash(data.new_password)
        db.commit()

        return {
            "success": True,
            "message": "Your password has been successfully reset. You can now sign in with your new password."
        }

    @staticmethod
    def update_profile(db: Session, user: User, data: UserUpdate) -> User:
        if data.full_name is not None:
            user.full_name = data.full_name
        if data.phone is not None:
            user.phone = data.phone
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def change_password(db: Session, user: User, data: PasswordChange):
        if not verify_password(data.current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password"
            )
        user.hashed_password = get_password_hash(data.new_password)
        db.commit()
        return {"success": True, "message": "Password updated successfully"}

    @staticmethod
    def add_address(db: Session, user: User, data: AddressCreate) -> Address:
        if data.is_default:
            db.query(Address).filter(Address.user_id == user.id).update({"is_default": False})
        
        address = Address(
            user_id=user.id,
            full_name=data.full_name,
            phone=data.phone,
            address_line1=data.address_line1,
            address_line2=data.address_line2,
            landmark=data.landmark,
            city=data.city,
            state=data.state,
            pincode=data.pincode,
            is_default=data.is_default
        )
        db.add(address)
        db.commit()
        db.refresh(address)
        return address

