from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.dependencies.auth import get_current_active_admin
from app.models.user import User

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).filter(Category.is_active == True).order_by(Category.display_order.asc()).all()
    results = []
    for c in categories:
        p_count = db.query(Product).filter(Product.category_id == c.id, Product.status == "active").count()
        c_dict = CategoryResponse.model_validate(c)
        c_dict.products_count = p_count
        results.append(c_dict)
    return results

@router.get("/{slug}", response_model=CategoryResponse)
def get_category_by_slug(slug: str, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.slug == slug, Category.is_active == True).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    p_count = db.query(Product).filter(Product.category_id == category.id, Product.status == "active").count()
    res = CategoryResponse.model_validate(category)
    res.products_count = p_count
    return res

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    existing = db.query(Category).filter(Category.slug == data.slug).first()
    if existing:
        if not existing.is_active:
            # Reactivate previously deleted/inactive category with new data
            for k, v in data.model_dump().items():
                setattr(existing, k, v)
            existing.is_active = True
            db.commit()
            db.refresh(existing)
            res = CategoryResponse.model_validate(existing)
            res.products_count = db.query(Product).filter(Product.category_id == existing.id, Product.status == "active").count()
            return res
        else:
            raise HTTPException(status_code=400, detail="Category slug already exists. Please use a unique name or slug.")
            
    cat = Category(**data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    from app.utils.realtime import emit_realtime_event
    emit_realtime_event("public", "CATEGORY_CREATED", "category", {"id": cat.id, "name": cat.name, "slug": cat.slug})
    res = CategoryResponse.model_validate(cat)
    res.products_count = 0
    return res

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: str, data: CategoryUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
        
    # Check if new slug conflicts with another category
    if data.slug and data.slug != cat.slug:
        slug_conflict = db.query(Category).filter(Category.slug == data.slug, Category.id != category_id, Category.is_active == True).first()
        if slug_conflict:
            raise HTTPException(status_code=400, detail="Category slug already in use by another edition")
            
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(cat, k, v)
    db.commit()
    db.refresh(cat)
    from app.utils.realtime import emit_realtime_event
    emit_realtime_event("public", "CATEGORY_UPDATED", "category", {"id": cat.id, "name": cat.name, "slug": cat.slug})
    p_count = db.query(Product).filter(Product.category_id == cat.id).count()
    res = CategoryResponse.model_validate(cat)
    res.products_count = p_count
    return res

@router.delete("/{category_id}")
def delete_category(category_id: str, db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
        
    # Detach products from this category before deleting
    db.query(Product).filter(Product.category_id == cat.id).update({Product.category_id: None})
    
    # Delete the category completely from DB so the slug can be reused in future
    db.delete(cat)
    db.commit()
    from app.utils.realtime import emit_realtime_event
    emit_realtime_event("public", "CATEGORY_DELETED", "category", {"id": category_id})
    return {"success": True, "message": "Category deleted and slug released for future use"}
