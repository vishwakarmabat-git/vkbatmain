import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    PROJECT_NAME: str = "VK Bat House API"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = Field(default="sqlite:///./vkbathouse.db")
    DIRECT_URL: str = ""

    # Supabase (Optional for cloud media & production)
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_BUCKET_NAME: str = "vkbathouse-media"

    # Cloudinary Cloud Storage (Photos & Videos)
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    CLOUDINARY_URL: str = ""


    # JWT Authentication
    JWT_SECRET_KEY: str = "vk_bathouse_super_secret_jwt_key_development_change_in_production_9837429873498"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Contact & Notifications
    WHATSAPP_NUMBER: str = "919876543210"
    CONTACT_EMAIL: str = "support@vkbathouse.com"
    FRONTEND_URL: str = "http://localhost:5173"

    # Brevo (Sendinblue) Email Configuration
    BREVO_API_KEY: str = ""
    BREVO_SENDER_EMAIL: str = "vishwakarmabat@gmail.com"
    BREVO_SENDER_NAME: str = "Vishwakarma Bat House"

    # SMTP Mail Server Configuration (Fallback / Alternative)
    SMTP_HOST: str = "smtp-relay.brevo.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "vishwakarmabat@gmail.com"
    SMTP_FROM_NAME: str = "Vishwakarma Bat House"
    SMTP_TLS: bool = True


    # Payment Gateway (Razorpay)
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://vkbatmain.vercel.app"

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

