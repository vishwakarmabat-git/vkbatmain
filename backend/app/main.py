from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.auth import router as auth_router
from app.api.v1.products import router as products_router
from app.api.v1.categories import router as categories_router
from app.api.v1.orders import router as orders_router
from app.api.v1.payments import router as payments_router
from app.api.v1.coupons import router as coupons_router
from app.api.v1.reviews import router as reviews_router
from app.api.v1.cms import router as cms_router
from app.api.v1.settings import router as settings_router
from app.api.v1.admin import router as admin_router
from app.api.v1.upload import router as upload_router
from app.api.v1.ws import router as ws_router

from app.core.middleware import SecurityHeadersMiddleware, RateLimitMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables exist (schema only — NO data seeding)
    Base.metadata.create_all(bind=engine)
    os.makedirs("uploads", exist_ok=True)
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production REST API for Vishwakarma Bat House — Handcrafted Cricket Bats",
    lifespan=lifespan
)

# Attach Security Headers & Rate Limiting Middlewares
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)

# Static Files Directory for Device Uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Safe Exception Handler (Prevent internal traceback leakage to client)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import logging
    logging.getLogger("vkbathouse").error(f"Unhandled Exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"success": False, "detail": "An internal server error occurred. Please contact support if the issue persists."}
    )

# Include API v1 Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(products_router, prefix=settings.API_V1_PREFIX)
app.include_router(categories_router, prefix=settings.API_V1_PREFIX)
app.include_router(orders_router, prefix=settings.API_V1_PREFIX)
app.include_router(payments_router, prefix=settings.API_V1_PREFIX)
app.include_router(coupons_router, prefix=settings.API_V1_PREFIX)
app.include_router(reviews_router, prefix=settings.API_V1_PREFIX)
app.include_router(cms_router, prefix=settings.API_V1_PREFIX)
app.include_router(settings_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)
app.include_router(upload_router, prefix=settings.API_V1_PREFIX)
app.include_router(ws_router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "success": True,
        "message": "Welcome to VK Bat House API — Samurai-Precision Handcrafted Cricket Bats",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/api/v1/health")
def health_check():
    return {"status": "healthy", "service": "vkbathouse-backend"}

@app.get("/api/v1/health/db")
def health_check_db():
    try:
        from app.core.database import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
            return {"status": "healthy", "database": "connected"}
        finally:
            db.close()
    except Exception:
        return JSONResponse(status_code=503, content={"status": "degraded", "database": "unreachable"})
