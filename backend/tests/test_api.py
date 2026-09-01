import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.product import Product
from app.models.category import Category
from app.models.coupon import Coupon
from app.utils.calculations import calculate_order_totals

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_api_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 1. Test Customer
    cust = db.query(User).filter(User.email == "cricketfan@vkbathouse.com").first()
    if not cust:
        cust = User(
            id="test-customer-api-uuid",
            email="cricketfan@vkbathouse.com",
            full_name="Sunil Gavaskar",
            hashed_password=get_password_hash("Player@123456"),
            role="customer",
            is_active=True
        )
        db.add(cust)

    # 2. Test Admin
    adm = db.query(User).filter(User.email == "admin@vkbathouse.com").first()
    if not adm:
        adm = User(
            id="test-admin-api-uuid",
            email="admin@vkbathouse.com",
            full_name="Vishwakarma Admin",
            hashed_password=get_password_hash("Admin@123456"),
            role="admin",
            is_active=True
        )
        db.add(adm)

    # 3. Test Category
    cat = db.query(Category).filter(Category.slug == "english-willow").first()
    if not cat:
        cat = Category(
            id="test-cat-api-uuid",
            name="English Willow Masterpieces",
            slug="english-willow",
            description="Grade 1+ handcrafted English Willow",
            is_active=True
        )
        db.add(cat)
        db.flush()

    # 4. Test Product
    prod = db.query(Product).filter(Product.slug == "vk-kohinoor-reserve").first()
    if not prod:
        prod = Product(
            id="test-prod-api-uuid",
            category_id=cat.id,
            name="VK Kohinoor Reserve",
            slug="vk-kohinoor-reserve",
            sku="VK-KOH-001",
            price=24999.0,
            compare_price=29999.0,
            stock_quantity=10,
            status="active",
            is_featured=True,
            willow_grade="Grade 1+ English Willow",
            blade_architecture="Single Blade",
            pressing_type="Triple Pressed",
            grain_count="10"
        )
        db.add(prod)

    # 5. Test Coupon
    coupon = db.query(Coupon).filter(Coupon.code == "VKCHAMP10").first()
    if not coupon:
        coupon = Coupon(
            id="test-coupon-api-uuid",
            code="VKCHAMP10",
            description="10% discount on championship bats",
            discount_type="percentage",
            discount_value=10.0,
            min_order_amount=5000.0,
            max_discount_amount=3000.0,
            is_active=True
        )
        db.add(coupon)

    db.commit()
    db.close()
    yield

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_root_health_check():
    # GET /health returns HTTP 200 and status ok without auth
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response.json()["status"] == "ok"

    # HEAD /health is supported for monitoring tools like UptimeRobot
    head_resp = client.head("/health")
    assert head_resp.status_code == 200

    # GET /health/ trailing slash is supported without redirect error
    slash_resp = client.get("/health/")
    assert slash_resp.status_code == 200
    assert slash_resp.json() == {"status": "ok"}

    # POST /health is not allowed (HTTP 405)
    post_resp = client.post("/health")
    assert post_resp.status_code == 405

def test_financial_calculations():
    # All-inclusive pricing: Subtotal ₹10,000 with 10% coupon = ₹9,000 grand total (zero hidden taxes/shipping)
    sub, gst, ship, disc, grand = calculate_order_totals(
        subtotal=10000.0,
        discount_amount=1000.0,
        gst_percentage=0.0,
        shipping_fee=0.0,
        free_shipping_threshold=0.0
    )
    assert sub == 10000.0
    assert disc == 1000.0
    assert gst == 0.0
    assert ship == 0.0
    assert grand == 9000.0

def test_get_categories():
    response = client.get("/api/v1/categories")
    assert response.status_code == 200
    cats = response.json()
    assert len(cats) >= 1

def test_get_products():
    response = client.get("/api/v1/products")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) >= 1

def test_customer_login():
    response = client.post("/api/v1/auth/login", json={
        "email": "cricketfan@vkbathouse.com",
        "password": "Player@123456"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_admin_login():
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@vkbathouse.com",
        "password": "Admin@123456"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] in ["admin", "superadmin"]

def test_coupon_validation():
    response = client.post("/api/v1/coupons/validate", json={
        "code": "VKCHAMP10",
        "cart_subtotal": 20000.0
    })
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["discount_amount"] == 2000.0  # 10% of 20000

def test_order_creation_and_inventory():
    # Fetch first product
    prod_res = client.get("/api/v1/products")
    product = prod_res.json()["items"][0]
    initial_stock = product["stock_quantity"]

    order_payload = {
        "shipping_address": {
            "full_name": "Sunil Gavaskar",
            "email": "sunil@cricket.in",
            "phone": "+919876543210",
            "address_line1": "Wankhede Pavilion 101",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400020"
        },
        "items": [
            {
                "product_id": product["id"],
                "quantity": 1,
                "customization": {
                    "weight": "1150–1180g",
                    "handle_shape": "Semi-Oval",
                    "handle_size": "SH",
                    "grip_pattern": "Chevron",
                    "grip_color": "Metallic Gold",
                    "grip_count": "Double",
                    "sticker_finish": "Laser Gold",
                    "pre_knocking": "10,000 Machine Knocks",
                    "custom_engraving": "SUNIL 100",
                    "extra_cost": 1449.0
                }
            }
        ],
        "coupon_code": "VKCHAMP10",
        "payment_method": "cod",
        "customer_notes": "Please select 1160g cleft with straight grains"
    }

    order_res = client.post("/api/v1/orders", json=order_payload)
    assert order_res.status_code == 201
    order_data = order_res.json()
    assert "order_number" in order_data
    assert order_data["order_number"].startswith("VK-")

    # Verify inventory was decremented
    updated_prod = client.get(f"/api/v1/products/{product['id']}").json()
    assert updated_prod["stock_quantity"] == initial_stock - 1
