from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
)
from app.services.product_service import ProductService
from app.dependencies.auth import get_current_active_admin
from app.models.user import User

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=ProductListResponse)
def list_products(
    category_slug: Optional[str] = Query(None, description="Category slug filter"),
    search: Optional[str] = Query(None, description="Search term across name/specs"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    willow_grade: Optional[str] = Query(None, description="Willow grade filter"),
    pressing_type: Optional[str] = Query(None, description="Pressing type filter"),
    blade_architecture: Optional[str] = Query(None, description="Blade architecture filter"),
    is_featured: Optional[bool] = Query(None, description="Featured bats filter"),
    is_bestseller: Optional[bool] = Query(None, description="Bestseller bats filter"),
    sort_by: Optional[str] = Query("featured", description="Sort criteria (price_asc, price_desc, newest, bestseller, featured, rating)"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db)
):
    return ProductService.get_products(
        db=db,
        category_slug=category_slug,
        search=search,
        min_price=min_price,
        max_price=max_price,
        willow_grade=willow_grade,
        pressing_type=pressing_type,
        blade_architecture=blade_architecture,
        is_featured=is_featured,
        is_bestseller=is_bestseller,
        status_filter="active",
        sort_by=sort_by,
        page=page,
        limit=limit
    )

@router.get("/slug/{slug}", response_model=ProductResponse)
def get_product_by_slug(slug: str, db: Session = Depends(get_db)):
    return ProductService.get_product_by_slug(db, slug)

@router.get("/{product_id}", response_model=ProductResponse)
def get_product_by_id(product_id: str, db: Session = Depends(get_db)):
    return ProductService.get_product_by_id(db, product_id)

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    return ProductService.create_product(db, data)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    return ProductService.update_product(db, product_id, data)

@router.delete("/{product_id}")
def delete_product(
    product_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    return ProductService.delete_product(db, product_id)
