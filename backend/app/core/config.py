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

    # JWT Authentication
    JWT_SECRET_KEY: str = "vk_bathouse_super_secret_jwt_key_development_change_in_production_9837429873498"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Business & Financial Defaults
    GST_PERCENTAGE: float = 0.0
    DEFAULT_SHIPPING_FEE: float = 0.0
    FREE_SHIPPING_THRESHOLD: float = 0.0
    WHATSAPP_NUMBER: str = "919876543210"
    CONTACT_EMAIL: str = "support@vkbathouse.com"

    # Payment Gateway (Razorpay)
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
