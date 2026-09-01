import uuid
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, Address
from app.schemas.auth import UserRegister, UserLogin, UserUpdate, PasswordChange, AddressCreate, GoogleAuthRequest
from app.core.security import get_password_hash, verify_password, create_access_token

class AuthService:
    @staticmethod
    def register(db: Session, data: UserRegister) -> dict:
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
