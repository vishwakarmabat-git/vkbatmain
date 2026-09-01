import os
import uuid
import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status

try:
    import cloudinary
    import cloudinary.uploader
    HAS_CLOUDINARY = True
except ImportError:
    HAS_CLOUDINARY = False

from app.core.config import settings
from app.dependencies.auth import get_current_active_admin
from app.models.user import User

logger = logging.getLogger("app.upload")

router = APIRouter(prefix="/upload", tags=["Upload"])

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Allowed media formats (photos + videos)
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".webm", ".avi", ".mkv"}
ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS

ALLOWED_MIME_TYPES = {
    # Images
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
    # Videos
    "video/mp4", "video/quicktime", "video/webm", "video/x-msvideo", "video/x-matroska", "application/octet-stream"
}

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

def _is_cloudinary_configured() -> bool:
    if not HAS_CLOUDINARY:
        return False
    if settings.CLOUDINARY_URL:
        return True
    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
        return True
    return False

def _init_cloudinary():
    if not HAS_CLOUDINARY:
        return
    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:

        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )
    elif settings.CLOUDINARY_URL:
        cloudinary.config(cloudinary_url=settings.CLOUDINARY_URL)


@router.post("", response_model=dict)
async def upload_file(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_active_admin)
):
    # 1. Validate MIME type
    content_type = (file.content_type or "").lower().strip()
    ext = os.path.splitext(file.filename or "")[1].lower().strip()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension. Allowed formats: Photos ({', '.join(sorted(ALLOWED_IMAGE_EXTENSIONS))}) and Videos ({', '.join(sorted(ALLOWED_VIDEO_EXTENSIONS))})"
        )

    # 2. Read content and validate file size
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size ({len(contents) // (1024*1024)}MB) exceeds maximum allowed limit of 50MB"
        )

    is_video = ext in ALLOWED_VIDEO_EXTENSIONS or content_type.startswith("video/")
    resource_type = "video" if is_video else "auto"
    unique_filename = f"{uuid.uuid4().hex}{ext}"

    # 3. If Cloudinary is configured, upload directly to Cloudinary CDN
    if _is_cloudinary_configured():
        try:
            _init_cloudinary()
            upload_result = cloudinary.uploader.upload(
                contents,
                folder="vkbathouse",
                resource_type=resource_type,
                use_filename=True,
                unique_filename=True
            )
            secure_url = upload_result.get("secure_url") or upload_result.get("url")
            public_id = upload_result.get("public_id")
            format_type = upload_result.get("format")

            logger.info(f"File uploaded to Cloudinary: {secure_url}")
            return {
                "url": secure_url,
                "filename": f"{public_id}.{format_type}" if format_type else unique_filename,
                "size_bytes": len(contents),
                "resource_type": resource_type,
                "provider": "cloudinary"
            }
        except Exception as e:
            logger.error(f"Cloudinary upload failed: {e}. Falling back to local disk storage.")

    # 4. Fallback: Save to local disk directory
    filepath = os.path.join(UPLOAD_DIR, unique_filename)
    with open(filepath, "wb") as f:
        f.write(contents)

    return {
        "url": f"/uploads/{unique_filename}",
        "filename": unique_filename,
        "size_bytes": len(contents),
        "resource_type": resource_type,
        "provider": "local"
    }
