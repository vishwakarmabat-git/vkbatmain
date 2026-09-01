from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.review import Review
from app.models.product import Product
from app.schemas.review import ReviewCreate, ReviewStatusUpdate, ReviewResponse
from app.dependencies.auth import get_optional_current_user, get_current_active_admin
from app.models.user import User

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.get("/product/{product_id}", response_model=List[ReviewResponse])
def get_product_reviews(product_id: str, db: Session = Depends(get_db)):
    return db.query(Review).filter(
        Review.product_id == product_id,
        Review.status == "approved"
    ).order_by(Review.created_at.desc()).all()

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    review = Review(
        product_id=data.product_id,
        user_id=current_user.id if current_user else None,
        reviewer_name=data.reviewer_name,
        reviewer_email=data.reviewer_email,
        rating=data.rating,
        title=data.title,
        comment=data.comment,
        status="approved"  # automatically approve for fast feedback, moderation available
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Recalculate product rating average and count
    avg_rating = db.query(func.avg(Review.rating)).filter(Review.product_id == product.id, Review.status == "approved").scalar() or 5.0
    count_rating = db.query(Review).filter(Review.product_id == product.id, Review.status == "approved").count()
    
    product.rating_avg = round(float(avg_rating), 1)
    product.reviews_count = count_rating
    db.commit()

    from app.utils.realtime import emit_realtime_event
    emit_realtime_event("public", "REVIEW_CREATED", "review", {"product_id": product.id, "review_id": review.id})
    emit_realtime_event("admin", "REVIEW_CREATED", "review", {"product_id": product.id, "reviewer_name": review.reviewer_name})

    return review

@router.get("/admin/all", response_model=List[ReviewResponse])
def get_all_reviews_admin(db: Session = Depends(get_db), admin: User = Depends(get_current_active_admin)):
    reviews = db.query(Review).order_by(Review.created_at.desc()).all()
    res = []
    for r in reviews:
        r_item = ReviewResponse.model_validate(r)
        r_item.product_name = r.product.name if r.product else "Unknown Product"
        res.append(r_item)
    return res

@router.put("/admin/{review_id}/status", response_model=ReviewResponse)
def update_review_status(
    review_id: str,
    data: ReviewStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_active_admin)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.status = data.status
    if data.is_featured is not None:
        review.is_featured = data.is_featured
    db.commit()
    db.refresh(review)

    from app.utils.realtime import emit_realtime_event
    emit_realtime_event("public", "REVIEW_STATUS_UPDATED", "review", {
        "product_id": review.product_id,
        "review_id": review.id,
        "status": review.status
    })

    return review
