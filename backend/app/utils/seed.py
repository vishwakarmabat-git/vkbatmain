import json
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.models.user import User, Address
from app.models.category import Category
from app.models.product import Product, ProductImage, InventoryVariant
from app.models.coupon import Coupon
from app.models.cms import CMSBanner, Testimonial, FAQ, GalleryItem
from app.models.setting import Setting
from app.models.review import Review
from app.core.security import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. SEED ADMIN USER
        admin_email = "admin@vkbathouse.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                full_name="Vishwakarma Master Craftsman",
                phone="+919876543210",
                hashed_password=get_password_hash("Admin@123456"),
                role="superadmin",
                is_active=True
            )
            db.add(admin)
            print("[OK] Seeded Admin: admin@vkbathouse.com / Admin@123456")

        # 2. SEED CUSTOMER USER
        customer_email = "cricketfan@vkbathouse.com"
        customer = db.query(User).filter(User.email == customer_email).first()
        if not customer:
            customer = User(
                email=customer_email,
                full_name="Rohit Sharma Fan",
                phone="+919812345678",
                hashed_password=get_password_hash("Player@123456"),
                role="customer",
                is_active=True
            )
            db.add(customer)
            db.flush()
            # Add sample address
            addr = Address(
                user_id=customer.id,
                full_name="Rohit Sharma Fan",
                phone="+919812345678",
                address_line1="Flat 402, Pavilion Heights",
                address_line2="Near Cricket Stadium Road",
                landmark="Opposite Sports Club",
                city="Mumbai",
                state="Maharashtra",
                pincode="400001",
                is_default=True
            )
            db.add(addr)
            print("[OK] Seeded Customer: cricketfan@vkbathouse.com / Player@123456")

        # 3. SEED 6 CATEGORIES
        categories_data = [
            {
                "name": "Single Blade",
                "slug": "single-blade",
                "blade_type": "Single Blade",
                "description": "Pure single cleft craftsmanship engineered for immaculate balance, effortless pickup, and classical strokeplay.",
                "image_url": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1000&q=80",
                "starting_price": 14999.00,
                "display_order": 1
            },
            {
                "name": "Double Blade",
                "slug": "double-blade",
                "blade_type": "Double Blade",
                "description": "Dual power-core engineering with reinforced driving zone for unmatched rebound response and explosive hitting.",
                "image_url": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80",
                "starting_price": 19999.00,
                "display_order": 2
            },
            {
                "name": "Triple Blade",
                "slug": "triple-blade",
                "blade_type": "Triple Blade",
                "description": "Tri-laminated precision blade distributing mass across three distinct flex vectors for maximum sweet spot amplification.",
                "image_url": "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=1000&q=80",
                "starting_price": 24999.00,
                "display_order": 3
            },
            {
                "name": "Triple Blade Hard Pressed",
                "slug": "triple-blade-hard-pressed",
                "blade_type": "Triple Blade Hard Pressed",
                "description": "Triple blade architecture cold-pressed under 4-ton hydraulic density for instant ping, zero denting, and prolonged durability.",
                "image_url": "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=1000&q=80",
                "starting_price": 29999.00,
                "display_order": 4
            },
            {
                "name": "Triple X2",
                "slug": "triple-x2",
                "blade_type": "Triple X2",
                "description": "Dual-spine structural chassis fused with triple blade willow matrix. The pinnacle of power-to-weight ratio in world cricket.",
                "image_url": "https://images.unsplash.com/photo-1512719994953-eabf50895df7?auto=format&fit=crop&w=1000&q=80",
                "starting_price": 36999.00,
                "display_order": 5
            },
            {
                "name": "Triple X2 Hard Pressed",
                "slug": "triple-x2-hard-pressed",
                "blade_type": "Triple X2 Hard Pressed",
                "description": "The Masterpiece. Samurai-grade hand selected Grade 1 Reserve English Willow, dual hydraulic pressed for ultimate boundary dominance.",
                "image_url": "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=1000&q=80",
                "starting_price": 44999.00,
                "display_order": 6
            }
        ]

        cat_map = {}
        for cdata in categories_data:
            cat = db.query(Category).filter(Category.slug == cdata["slug"]).first()
            if not cat:
                cat = Category(**cdata)
                db.add(cat)
                db.flush()
            cat_map[cdata["slug"]] = cat.id

        print(f"[OK] Seeded {len(categories_data)} Blade Categories")

        # 4. SEED 6 MASTERCRAFT PRODUCTS
        products_data = [
            {
                "name": "VK Platinum Single Blade",
                "slug": "vk-platinum-single-blade",
                "sku": "VK-BAT-001-SB",
                "category_id": cat_map.get("single-blade"),
                "short_description": "Grade 1+ Handcrafted English Willow bat designed for sublime touch, feather pickup, and effortless drives.",
                "full_description": "The VK Platinum Single Blade represents centuries of Vishwakarma artisan tradition. Handcrafted from unbleached Grade 1+ English Willow with 7 to 9 laser straight grains. Perfectly balanced for cricketers who value technical finesse, crisp timing, and seamless stroke acceleration.",
                "price": 16499.00,
                "compare_price": 19999.00,
                "discount_percent": 18,
                "willow_grade": "Grade 1+ English Willow",
                "blade_architecture": "Single Blade",
                "pressing_type": "Precision Hand Pressed",
                "edge_thickness": "38–40mm",
                "spine_height": "63–65mm",
                "sweet_spot": "Mid Sweet Spot (Classical all-round)",
                "handle_cane": "9-Piece Premium Sarawak Cane with 3 Rubber Dampers",
                "toe_profile": "Square Toe with Fitted Rubber Guard",
                "grain_count": "7–9 Laser Straight Grains",
                "bow_profile": "Subtle Sub-Continental Pro Bow",
                "stock_quantity": 14,
                "is_featured": True,
                "is_bestseller": False,
                "rating_avg": 4.9,
                "reviews_count": 28,
                "images": [
                    {"image_url": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1000&q=80", "is_primary": True, "display_order": 0},
                    {"image_url": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80", "is_primary": False, "display_order": 1}
                ]
            },
            {
                "name": "VK Elite Double Blade",
                "slug": "vk-elite-double-blade",
                "sku": "VK-BAT-002-DB",
                "category_id": cat_map.get("double-blade"),
                "short_description": "Dual Power-Core laminated willow engineered for maximum rebound energy transfer across modern power formats.",
                "full_description": "The VK Elite Double Blade integrates dual power-core willow segments bonded under high-temperature natural resin. Features 40mm thick edges and a pronounced spine that delivers crushing power without compromising balance or swing speed.",
                "price": 21999.00,
                "compare_price": 26999.00,
                "discount_percent": 19,
                "willow_grade": "Grade 1 English Willow",
                "blade_architecture": "Double Blade",
                "pressing_type": "High Dynamic Pressure",
                "edge_thickness": "40–42mm",
                "spine_height": "65–67mm",
                "sweet_spot": "Mid-to-Low Power Bulge",
                "handle_cane": "12-Piece Sarawak Cane with Dual Rubber Strips",
                "toe_profile": "Duckbill Power Toe Profile",
                "grain_count": "8–10 Straight Grains",
                "bow_profile": "Dynamic Power Bow",
                "stock_quantity": 12,
                "is_featured": True,
                "is_bestseller": True,
                "rating_avg": 5.0,
                "reviews_count": 42,
                "images": [
                    {"image_url": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80", "is_primary": True, "display_order": 0},
                    {"image_url": "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=1000&q=80", "is_primary": False, "display_order": 1}
                ]
            },
            {
                "name": "VK Pro Triple Blade",
                "slug": "vk-pro-triple-blade",
                "sku": "VK-BAT-003-TB",
                "category_id": cat_map.get("triple-blade"),
                "short_description": "Tri-Vector bonded cleft system delivering unmatched sweet spot extension and spine rigidity for clean lofted shots.",
                "full_description": "Engineered for elite batsmen who punish loose deliveries. The VK Pro Triple Blade incorporates three distinct grain-matched cleft segments, expanding the effective hitting zone by 35% compared to standard profiles.",
                "price": 27499.00,
                "compare_price": 32999.00,
                "discount_percent": 17,
                "willow_grade": "Grade 1 Reserve English Willow",
                "blade_architecture": "Triple Blade",
                "pressing_type": "Progressive Density Pressing",
                "edge_thickness": "41–43mm",
                "spine_height": "66–68mm",
                "sweet_spot": "Extended Full-Face Sweet Spot",
                "handle_cane": "12-Piece Pro Multi-Flex Cane",
                "toe_profile": "Reinforced Square Toe with Toe Armor",
                "grain_count": "9–11 Laser Straight Grains",
                "bow_profile": "Aggressive Sub-Continental Bow",
                "stock_quantity": 9,
                "is_featured": False,
                "is_bestseller": True,
                "rating_avg": 4.9,
                "reviews_count": 35,
                "images": [
                    {"image_url": "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=1000&q=80", "is_primary": True, "display_order": 0},
                    {"image_url": "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=1000&q=80", "is_primary": False, "display_order": 1}
                ]
            },
            {
                "name": "VK Gold Triple Blade Hard Pressed",
                "slug": "vk-gold-triple-blade-hard-pressed",
                "sku": "VK-BAT-004-TBHP",
                "category_id": cat_map.get("triple-blade-hard-pressed"),
                "short_description": "Hydraulic cold-pressed under 4-tons of compression. Instant match-ready ping and extreme leather ball repulsion.",
                "full_description": "The VK Gold Triple Blade Hard Pressed undergoes our proprietary 4-ton hydraulic cold-pressing technique, eliminating soft spots and hardening the outer fibre density for blistering ping right out of the box.",
                "price": 32999.00,
                "compare_price": 38999.00,
                "discount_percent": 15,
                "willow_grade": "Grade 1 Reserve English Willow",
                "blade_architecture": "Triple Blade Hard Pressed",
                "pressing_type": "4-Ton Hydraulic Cold Pressed",
                "edge_thickness": "42–44mm",
                "spine_height": "67–69mm",
                "sweet_spot": "High-Density Mid Power Zone",
                "handle_cane": "12-Piece Pro Sarawak Cane with Quad Cork Dampers",
                "toe_profile": "Full Contoured Power Toe",
                "grain_count": "10–12 Straight Grains",
                "bow_profile": "Pro Match Bow",
                "stock_quantity": 8,
                "is_featured": True,
                "is_bestseller": False,
                "rating_avg": 5.0,
                "reviews_count": 19,
                "images": [
                    {"image_url": "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=1000&q=80", "is_primary": True, "display_order": 0},
                    {"image_url": "https://images.unsplash.com/photo-1512719994953-eabf50895df7?auto=format&fit=crop&w=1000&q=80", "is_primary": False, "display_order": 1}
                ]
            },
            {
                "name": "VK Signature Triple X2",
                "slug": "vk-signature-triple-x2",
                "sku": "VK-BAT-005-TX2",
                "category_id": cat_map.get("triple-x2"),
                "short_description": "Dual-spine structural spine architecture fused with triple core willow. Featherweight pickup with monster 44mm edges.",
                "full_description": "A marvel of modern sports engineering. The VK Signature Triple X2 features a dual-spine structural ribbing system that scoops weight from non-impact zones and redistributes it behind the central driving node.",
                "price": 39999.00,
                "compare_price": 46999.00,
                "discount_percent": 15,
                "willow_grade": "Grade 1 Limited Edition English Willow",
                "blade_architecture": "Triple X2",
                "pressing_type": "Dual Density Pressed",
                "edge_thickness": "43–45mm",
                "spine_height": "68–70mm",
                "sweet_spot": "Massive Supercharged Sweet Spot",
                "handle_cane": "12-Piece Counter-Balanced Pro Cane",
                "toe_profile": "Tapered Pro Duckbill Toe",
                "grain_count": "11–13 Laser Straight Grains",
                "bow_profile": "Steep Launch Bow",
                "stock_quantity": 6,
                "is_featured": True,
                "is_bestseller": True,
                "rating_avg": 5.0,
                "reviews_count": 51,
                "images": [
                    {"image_url": "https://images.unsplash.com/photo-1512719994953-eabf50895df7?auto=format&fit=crop&w=1000&q=80", "is_primary": True, "display_order": 0},
                    {"image_url": "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=1000&q=80", "is_primary": False, "display_order": 1}
                ]
            },
            {
                "name": "VK Limited Edition Triple X2 Hard Pressed",
                "slug": "vk-limited-edition-triple-x2-hard-pressed",
                "sku": "VK-BAT-006-TX2HP",
                "category_id": cat_map.get("triple-x2-hard-pressed"),
                "short_description": "The Mastercraft Pinnacle. Hand-selected top 0.1% English Willow, 45mm massive edges, samurai-precision balance.",
                "full_description": "Strictly limited to 50 pieces per harvest season. The VK Limited Edition Triple X2 Hard Pressed is personally graded and hand-planed by our master craftsmen. Dual hydraulic cold-pressed with gold laser decals and bespoke laser engraved numbering.",
                "price": 48999.00,
                "compare_price": 58000.00,
                "discount_percent": 16,
                "willow_grade": "Top 0.1% Hand-Selected Grade 1 English Willow",
                "blade_architecture": "Triple X2 Hard Pressed",
                "pressing_type": "Master Ultra-Hydraulic Pressed",
                "edge_thickness": "44–46mm",
                "spine_height": "69–72mm",
                "sweet_spot": "Full-Length Extended Samurai Power Zone",
                "handle_cane": "12-Piece Pro Multi-Density Cane with Quad Damper Inlays",
                "toe_profile": "Curved Power Toe with Integrated Armour Guard",
                "grain_count": "12–15 Laser Straight Grains",
                "bow_profile": "Master Tour Grade Sub-Continental Bow",
                "stock_quantity": 5,
                "is_featured": True,
                "is_bestseller": True,
                "rating_avg": 5.0,
                "reviews_count": 64,
                "images": [
                    {"image_url": "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=1000&q=80", "is_primary": True, "display_order": 0},
                    {"image_url": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1000&q=80", "is_primary": False, "display_order": 1}
                ]
            }
        ]

        for pdata in products_data:
            existing_p = db.query(Product).filter(Product.slug == pdata["slug"]).first()
            if not existing_p:
                images = pdata.pop("images", [])
                p = Product(**pdata)
                db.add(p)
                db.flush()

                for img in images:
                    db.add(ProductImage(
                        product_id=p.id,
                        image_url=img["image_url"],
                        alt_text=p.name,
                        display_order=img["display_order"],
                        is_primary=img["is_primary"]
                    ))

                # Add standard weight variants for each product
                weights = ["1120–1150g", "1150–1180g", "1180–1210g", "1210–1240g", "1240–1280g"]
                for w in weights:
                    db.add(InventoryVariant(
                        product_id=p.id,
                        sku=f"{p.sku}-{w[:4]}",
                        weight_option=w,
                        handle_shape="Round",
                        stock_quantity=3,
                        low_stock_threshold=1
                    ))

                # Add initial high-praise reviews
                sample_reviews = [
                    {
                        "reviewer_name": "Karan Singhania",
                        "rating": 5,
                        "title": "Unbelievable balance and devastating ping!",
                        "comment": f"I played my first league match with the {p.name}. The pickup feels like 1140g even though the bat is 1180g. Scored 84 off 48 balls with 6 massive sixes. The craftsmanship is pure luxury!",
                        "is_verified_purchase": True,
                        "status": "approved",
                        "is_featured": True
                    },
                    {
                        "reviewer_name": "David Miller Fan",
                        "rating": 5,
                        "title": "Top-tier English Willow craftsmanship",
                        "comment": "The grains are razor straight and the edge thickness is immense. The pre-knocking service made it match ready in 2 days. Highly recommended for serious cricketers.",
                        "is_verified_purchase": True,
                        "status": "approved",
                        "is_featured": False
                    }
                ]
                for r in sample_reviews:
                    db.add(Review(product_id=p.id, **r))

        print(f"[OK] Seeded {len(products_data)} Mastercraft Products with Images & Variants")

        # 5. SEED COUPONS
        coupons = [
            {
                "code": "VKCHAMP10",
                "description": "10% Instant Discount on First Handcrafted Bat Order",
                "discount_type": "percentage",
                "discount_value": 10.0,
                "min_order_amount": 10000.0,
                "max_discount_amount": 3000.0,
                "usage_limit": 500,
                "is_active": True
            },
            {
                "code": "VKLIMITED",
                "description": "Flat ₹2,000 Off on Premium Triple X2 Series",
                "discount_type": "fixed",
                "discount_value": 2000.0,
                "min_order_amount": 25000.0,
                "usage_limit": 100,
                "is_active": True
            }
        ]
        for c in coupons:
            if not db.query(Coupon).filter(Coupon.code == c["code"]).first():
                db.add(Coupon(**c))

        print("[OK] Seeded Discount Coupons")

        # 6. SEED CMS BANNERS
        banners = [
            {
                "title": "CRAFTED FOR THE CRICKET YOU PLAY.",
                "subtitle": "SAMURAI-PRECISION HANDCRAFTED ENGLISH WILLOW BATS",
                "tagline": "ENGINEERED FOR POWER, BALANCE & PINPOINT PRECISION",
                "cta_text": "EXPLORE BATS",
                "cta_link": "/products",
                "secondary_cta_text": "CUSTOMIZE YOUR BAT",
                "secondary_cta_link": "/products",
                "image_url": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1600&q=85",
                "position": "hero",
                "display_order": 1,
                "is_active": True
            }
        ]
        for b in banners:
            if not db.query(CMSBanner).filter(CMSBanner.title == b["title"]).first():
                db.add(CMSBanner(**b))

        # 7. SEED TESTIMONIALS
        testimonials = [
            {
                "name": "Arjun Deshmukh",
                "role_or_club": "First-Class Cricketer, Ranji Trophy",
                "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
                "content": "The ping on the VK Limited Edition Triple X2 is unlike anything I have used in 12 years of professional cricket. The balance allows fast bat speed through the line against 140kmph bowling.",
                "bat_model": "VK Limited Edition Triple X2 Hard Pressed",
                "rating": 5,
                "display_order": 1
            },
            {
                "name": "Vikramaditya Roy",
                "role_or_club": "Captain, MCC Club London",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
                "content": "Ordered the VK Gold Triple Blade with 10,000 machine knocks and custom engraving. The bat arrived in London within a week, perfectly oiled and balanced to the exact gram requested.",
                "bat_model": "VK Gold Triple Blade Hard Pressed",
                "rating": 5,
                "display_order": 2
            },
            {
                "name": "Manpreet Singh",
                "role_or_club": "Punjab Premier League MVP",
                "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
                "content": "Massive 44mm edges but picks up lighter than a standard featherweight. Vishwakarma craftsmen are true masters of wood and dynamics.",
                "bat_model": "VK Signature Triple X2",
                "rating": 5,
                "display_order": 3
            }
        ]
        for t in testimonials:
            if not db.query(Testimonial).filter(Testimonial.name == t["name"]).first():
                db.add(Testimonial(**t))

        # 8. SEED FAQS
        faqs = [
            {
                "question": "What makes VK Bat House blades different from factory mass-produced bats?",
                "answer": "Every single VK bat is individually cleft-selected from hand-graded English Willow and hand-shaped by generational Vishwakarma artisans. We tune the spine and sweet spot to match individual batting styles, ensuring unrivaled weight distribution and rebound dynamics.",
                "category": "Craftsmanship",
                "display_order": 1
            },
            {
                "question": "What is the difference between Single Blade, Double Blade, and Triple X2?",
                "answer": "Single Blade uses a monolithic cleft for classic strokeplay and delicate touch. Double Blade incorporates dual power-core lamination for enhanced driving response. Triple X2 uses dual structural spines with multi-vector bonding for massive 45mm edges and maximum boundary clearing power.",
                "category": "Customization",
                "display_order": 2
            },
            {
                "question": "Do I need to knock in my VK Cricket Bat before match play?",
                "answer": "We offer full 5,000 and 10,000 Machine Knocking services with edge rounding and double linseed oiling at checkout. If you choose our 10,000 Knock service, your bat will arrive 100% Match Ready for leather balls.",
                "category": "Maintenance",
                "display_order": 3
            },
            {
                "question": "What is your shipping and warranty policy across India and worldwide?",
                "answer": "We ship across India with express insured courier (free for orders above ₹15,000). Every Grade 1 bat comes with a 12-month manufacturer handle and structural replacement warranty against defective cleft delamination.",
                "category": "Shipping",
                "display_order": 4
            }
        ]
        for f in faqs:
            if not db.query(FAQ).filter(FAQ.question == f["question"]).first():
                db.add(FAQ(**f))

        # 9. SEED GALLERY ITEMS
        gallery = [
            {
                "title": "Selection of Reserve Grade 1 Clefts",
                "caption": "Inspecting density, moisture levels, and laser-straight grain structures in the curing chamber.",
                "image_url": "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1000&q=80",
                "category": "Raw Willow",
                "display_order": 1
            },
            {
                "title": "Precision 4-Ton Hydraulic Pressing",
                "caption": "Achieving the optimal structural density and high-ping resilience.",
                "image_url": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80",
                "category": "Pressing",
                "display_order": 2
            },
            {
                "title": "Master Hand-Shaping & Spine Contouring",
                "caption": "Hand-planing the featherweight pickup curve with traditional drawknives.",
                "image_url": "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?auto=format&fit=crop&w=1000&q=80",
                "category": "Workshop",
                "display_order": 3
            },
            {
                "title": "12-Piece Sarawak Cane Handle Fitting",
                "caption": "Joining handle and blade with natural glue and precision angling for power transfer.",
                "image_url": "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&w=1000&q=80",
                "category": "Workshop",
                "display_order": 4
            },
            {
                "title": "Laser Foil 3D Decal & Laser Engraving",
                "caption": "Applying the prestigious gold emblem and bespoke player personalization.",
                "image_url": "https://images.unsplash.com/photo-1512719994953-eabf50895df7?auto=format&fit=crop&w=1000&q=80",
                "category": "Finished Bats",
                "display_order": 5
            },
            {
                "title": "Match Day Boundary Power",
                "caption": "Unleashing explosive ping under stadium floodlights.",
                "image_url": "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=1000&q=80",
                "category": "Match Day",
                "display_order": 6
            }
        ]
        for g in gallery:
            if not db.query(GalleryItem).filter(GalleryItem.title == g["title"]).first():
                db.add(GalleryItem(**g))

        # 10. SEED SETTINGS
        settings_defaults = [
            ("gst_percentage", "12.0", "Goods and Services Tax percentage"),
            ("default_shipping_fee", "150.0", "Default flat shipping fee in INR"),
            ("free_shipping_threshold", "15000.0", "Minimum order value for free shipping"),
            ("whatsapp_number", "919876543210", "Business WhatsApp support number"),
            ("contact_email", "support@vkbathouse.com", "Customer support email"),
            ("contact_phone", "+91 98765 43210", "Customer support phone"),
            ("announcement_bar", "⚡ FREE SHIPPING ACROSS INDIA ON ORDERS ABOVE ₹15,000 | 100% GENUINE ENGLISH WILLOW WITH WARRANTY", "Top banner text")
        ]
        for key, val, desc in settings_defaults:
            if not db.query(Setting).filter(Setting.key == key).first():
                db.add(Setting(key=key, value=val, description=desc))

        db.commit()
        print("[OK] All Seed Data Created Successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
