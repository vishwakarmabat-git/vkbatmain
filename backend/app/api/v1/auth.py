from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import (
    UserRegister, UserLogin, GoogleAuthRequest, Token, UserResponse,
    UserUpdate, PasswordChange, AddressCreate, AddressResponse,
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.services.auth_service import AuthService
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    return AuthService.register(db, data)

@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    return AuthService.login(db, data)

@router.post("/google", response_model=Token)
def google_login(data: GoogleAuthRequest, db: Session = Depends(get_db)):
    return AuthService.google_auth(db, data)

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    return AuthService.forgot_password(db, data.email)

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    return AuthService.reset_password(db, data)

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AuthService.update_profile(db, current_user, data)

@router.post("/change-password")
def change_password(data: PasswordChange, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AuthService.change_password(db, current_user, data)

@router.post("/address", response_model=AddressResponse)
def add_address(data: AddressCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AuthService.add_address(db, current_user, data)

@router.get("/addresses", response_model=list[AddressResponse])
def get_addresses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return current_user.addresses

