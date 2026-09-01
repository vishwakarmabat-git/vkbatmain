import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from app.dependencies.auth import get_current_active_admin
from app.models.user import User

router = APIRouter(prefix="/upload", tags=["Upload"])

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("", response_model=dict)
async def upload_file(
    file: UploadFile = File(...),
    admin: User = Depends(get_current_active_admin)
):
    # 1. Validate MIME type
    content_type = (file.content_type or "").lower().strip()
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Allowed formats: JPEG, PNG, WebP, GIF, SVG."
        )

    # 2. Validate file extension
    ext = os.path.splitext(file.filename or "")[1].lower().strip()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file extension. Allowed extensions: .jpg, .jpeg, .png, .webp, .gif, .svg"
        )

    # 3. Read content and validate file size
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum allowed limit of 10MB"
        )

    # 4. Save with cryptographically random UUID filename
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, unique_filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    return {
        "url": f"/uploads/{unique_filename}",
        "filename": unique_filename,
        "size_bytes": len(contents)
    }
