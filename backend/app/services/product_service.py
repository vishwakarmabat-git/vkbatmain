import uuid
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc
from fastapi import HTTPException, status
from app.models.product import Product, ProductImage, InventoryVariant
from app.models.category import Category
from app.models.review import Review
from app.models.order import OrderItem
from app.schemas.product import ProductCreate, ProductUpdate

class ProductService:
    @staticmethod
    def get_products(
        db: Session,
        category_slug: Optional[str] = None,
        search: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        willow_grade: Optional[str] = None,
        pressing_type: Optional[str] = None,
        blade_architecture: Optional[str] = None,
        is_featured: Optional[bool] = None,
        is_bestseller: Optional[bool] = None,
        status_filter: Optional[str] = "active",
        sort_by: Optional[str] = "featured",  # "price_asc", "price_desc", "newest", "bestseller", "featured", "rating"
        page: int = 1,
        limit: int = 12
    ):
        query = db.query(Product).options(
            joinedload(Product.images),
            joinedload(Product.variants),
            joinedload(Product.category)
        )

        if status_filter and status_filter != "all":
            query = query.filter(Product.status == status_filter)

        if category_slug:
            category = db.query(Category).filter(Category.slug == category_slug).first()
            if category:
                query = query.filter(Product.category_id == category.id)

        if search:
            s = f"%{search.strip()}%"
            query = query.filter(
                or_(
                    Product.name.ilike(s),
                    Product.short_description.ilike(s),
                    Product.willow_grade.ilike(s),
                    Product.sku.ilike(s)
                )
            )

        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        if willow_grade:
            query = query.filter(Product.willow_grade.ilike(f"%{willow_grade}%"))
        if pressing_type:
            query = query.filter(Product.pressing_type.ilike(f"%{pressing_type}%"))
        if blade_architecture:
            query = query.filter(Product.blade_architecture.ilike(f"%{blade_architecture}%"))
        if is_featured is not None:
            query = query.filter(Product.is_featured == is_featured)
        if is_bestseller is not None:
            query = query.filter(Product.is_bestseller == is_bestseller)

        # Sorting
        if sort_by == "price_asc":
            query = query.order_by(asc(Product.price))
        elif sort_by == "price_desc":
            query = query.order_by(desc(Product.price))
        elif sort_by == "newest":
            query = query.order_by(desc(Product.created_at))
        elif sort_by == "bestseller":
            query = query.order_by(desc(Product.is_bestseller), desc(Product.rating_avg))
        elif sort_by == "rating":
            query = query.order_by(desc(Product.rating_avg))
        else:  # "featured"
            query = query.order_by(desc(Product.is_featured), desc(Product.created_at))

        total = query.count()
        offset = (page - 1) * limit
        items = query.offset(offset).limit(limit).all()

        # Format items to populate category_name
        result_items = []
        for p in items:
            p.category_name = p.category.name if p.category else None
            result_items.append(p)

        pages = (total + limit - 1) // limit if limit > 0 else 1

        return {
            "items": result_items,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": pages
        }

    @staticmethod
    def get_product_by_slug(db: Session, slug: str) -> Product:
        product = db.query(Product).options(
            joinedload(Product.images),
            joinedload(Product.variants),
            joinedload(Product.category)
        ).filter(Product.slug == slug).first()
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product.category_name = product.category.name if product.category else None
        return product

    @staticmethod
    def get_product_by_id(db: Session, product_id: str) -> Product:
        product = db.query(Product).options(
            joinedload(Product.images),
            joinedload(Product.variants),
            joinedload(Product.category)
        ).filter(Product.id == product_id).first()
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
            
        product.category_name = product.category.name if product.category else None
        return product

    @staticmethod
    def create_product(db: Session, data: ProductCreate) -> Product:
        # 1. Handle slug uniqueness: if archived product has this slug, release it!
        existing_slug = db.query(Product).filter(Product.slug == data.slug).first()
        if existing_slug:
            if existing_slug.status == "archived":
                existing_slug.slug = f"{existing_slug.slug}-archived-{uuid.uuid4().hex[:6]}"
                db.commit()
            else:
                raise HTTPException(status_code=400, detail="Product slug already exists. Please choose a different model name or slug.")

        # 2. Handle SKU uniqueness: if archived product has this SKU, release it!
        existing_sku = db.query(Product).filter(Product.sku == data.sku).first()
        if existing_sku:
            if existing_sku.status == "archived":
                existing_sku.sku = f"{existing_sku.sku}-archived-{uuid.uuid4().hex[:6]}"
                db.commit()
            else:
                raise HTTPException(status_code=400, detail="Product SKU already exists. Please use a unique SKU.")

        product = Product(
            name=data.name,
            slug=data.slug,
            sku=data.sku,
            category_id=data.category_id,
            short_description=data.short_description,
            full_description=data.full_description,
            price=data.price,
            compare_price=data.compare_price,
            discount_percent=data.discount_percent,
            willow_grade=data.willow_grade,
            blade_architecture=data.blade_architecture,
            pressing_type=data.pressing_type,
            edge_thickness=data.edge_thickness,
            spine_height=data.spine_height,
            sweet_spot=data.sweet_spot,
            handle_cane=data.handle_cane,
            toe_profile=data.toe_profile,
            grain_count=data.grain_count,
            bow_profile=data.bow_profile,
            stock_quantity=data.stock_quantity,
            is_featured=data.is_featured,
            is_bestseller=data.is_bestseller,
            status=data.status,
            seo_title=data.seo_title,
            seo_description=data.seo_description
        )
        db.add(product)
        db.flush()

        if data.images:
            for idx, img in enumerate(data.images):
                img_obj = ProductImage(
                    product_id=product.id,
                    image_url=img.image_url,
                    alt_text=img.alt_text or product.name,
                    display_order=img.display_order if img.display_order is not None else idx,
                    is_primary=img.is_primary if img.is_primary is not None else (idx == 0)
                )
                db.add(img_obj)

        if data.variants:
            for v in data.variants:
                var_obj = InventoryVariant(
                    product_id=product.id,
                    sku=v.sku,
                    weight_option=v.weight_option,
                    handle_shape=v.handle_shape,
                    stock_quantity=v.stock_quantity,
                    low_stock_threshold=v.low_stock_threshold,
                    is_active=v.is_active
                )
                db.add(var_obj)

        db.commit()
        db.refresh(product)
        created_product = ProductService.get_product_by_id(db, product.id)
        from app.utils.realtime import emit_realtime_event
        emit_realtime_event("public", "PRODUCT_CREATED", "product", {
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "price": float(product.price),
            "stock_quantity": product.stock_quantity
        })
        return created_product

    @staticmethod
    def update_product(db: Session, product_id: str, data: ProductUpdate) -> Product:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        update_data = data.model_dump(exclude_unset=True)
        
        # Check slug conflict if slug is changing
        if "slug" in update_data and update_data["slug"] != product.slug:
            conflict = db.query(Product).filter(
                Product.slug == update_data["slug"],
                Product.id != product_id,
                Product.status != "archived"
            ).first()
            if conflict:
                raise HTTPException(status_code=400, detail="Product slug already in use by another bat model")

        # Handle images if provided
        if "images" in update_data and update_data["images"] is not None:
            db.query(ProductImage).filter(ProductImage.product_id == product.id).delete()
            for idx, img in enumerate(data.images):
                db.add(ProductImage(
                    product_id=product.id,
                    image_url=img.image_url,
                    alt_text=img.alt_text or product.name,
                    display_order=img.display_order if img.display_order is not None else idx,
                    is_primary=img.is_primary if img.is_primary is not None else (idx == 0)
                ))
            del update_data["images"]

        # Handle variants if provided
        if "variants" in update_data and update_data["variants"] is not None:
            db.query(InventoryVariant).filter(InventoryVariant.product_id == product.id).delete()
            for v in data.variants:
                db.add(InventoryVariant(
                    product_id=product.id,
                    sku=v.sku,
                    weight_option=v.weight_option,
                    handle_shape=v.handle_shape,
                    stock_quantity=v.stock_quantity,
                    low_stock_threshold=v.low_stock_threshold,
                    is_active=v.is_active
                ))
            del update_data["variants"]

        for key, val in update_data.items():
            setattr(product, key, val)

        db.commit()
        updated_product = ProductService.get_product_by_id(db, product.id)
        from app.utils.realtime import emit_realtime_event
        emit_realtime_event("public", "PRODUCT_UPDATED", "product", {
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "price": float(product.price),
            "stock_quantity": product.stock_quantity
        })
        return updated_product

    @staticmethod
    def delete_product(db: Session, product_id: str):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        from app.utils.realtime import emit_realtime_event
        try:
            # Delete child images & variants
            db.query(ProductImage).filter(ProductImage.product_id == product.id).delete()
            db.query(InventoryVariant).filter(InventoryVariant.product_id == product.id).delete()
            db.query(Review).filter(Review.product_id == product.id).delete()
            
            # Detach order items
            db.query(OrderItem).filter(OrderItem.product_id == product.id).update({OrderItem.product_id: None})
            
            # Hard delete the product to completely free its slug and SKU
            db.delete(product)
            db.commit()
            emit_realtime_event("public", "PRODUCT_DELETED", "product", {"id": product_id})
            return {"success": True, "message": "Product deleted successfully and slug released"}
        except Exception as e:
            db.rollback()
            # Fallback: rename slug/sku so original names are released immediately
            product.slug = f"{product.slug}-deleted-{uuid.uuid4().hex[:6]}"
            product.sku = f"{product.sku}-deleted-{uuid.uuid4().hex[:6]}"
            product.status = "archived"
            db.commit()
            emit_realtime_event("public", "PRODUCT_DELETED", "product", {"id": product_id})
            return {"success": True, "message": "Product archived and slug released"}
