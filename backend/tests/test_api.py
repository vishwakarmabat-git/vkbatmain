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
    else:
        cust.hashed_password = get_password_hash("Player@123456")
        db.commit()


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
            stock_quantity=15,
            status="active",
            is_featured=True,
            willow_grade="Grade 1+ English Willow",
            blade_architecture="Single Blade",
            pressing_type="Triple Pressed",
            grain_count="10",
            rating_average=5.0,
            rating_count=12
        )
        db.add(prod)
    else:
        prod.stock_quantity = 15
        prod.status = "active"
        db.commit()

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

def test_order_creation():
    # Fetch first product
    prod_res = client.get("/api/v1/products")
    product = prod_res.json()["items"][0]

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

def test_forgot_and_reset_password_flow():
    # 1. Request forgot password for existing user
    res = client.post("/api/v1/auth/forgot-password", json={"email": "cricketfan@vkbathouse.com"})
    assert res.status_code == 200
    assert "message" in res.json()

    # 2. Request forgot password for non-existent email (should still return 200 for security)
    res_unknown = client.post("/api/v1/auth/forgot-password", json={"email": "nonexistent_player_xyz@domain.com"})
    assert res_unknown.status_code == 200

    # 3. Generate a valid test reset token using security helper
    from app.core.security import create_password_reset_token
    token = create_password_reset_token("cricketfan@vkbathouse.com")

    # 4. Attempt reset with invalid token
    res_bad = client.post("/api/v1/auth/reset-password", json={"token": "invalid_token_123", "new_password": "NewSecretPassword@123"})
    assert res_bad.status_code == 400

    # 5. Reset password with valid token
    res_ok = client.post("/api/v1/auth/reset-password", json={"token": token, "new_password": "NewSecretPassword@123"})
    assert res_ok.status_code == 200
    assert "successfully reset" in res_ok.json()["message"]

    # 6. Verify user can now log in with the new password
    login_res = client.post("/api/v1/auth/login", json={"email": "cricketfan@vkbathouse.com", "password": "NewSecretPassword@123"})
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # Reset password back for subsequent tests
    client.post("/api/v1/auth/reset-password", json={"token": create_password_reset_token("cricketfan@vkbathouse.com"), "new_password": "Player@123456"})

def test_submit_bulk_order_public_and_admin_workflow():
    # 0. Log in as admin
    login_res = client.post("/api/v1/auth/login", json={"email": "admin@vkbathouse.com", "password": "Admin@123456"})
    assert login_res.status_code == 200
    admin_token = login_res.json()["access_token"]

    # 1. Submit a bulk order inquiry as a public customer/academy
    payload = {
        "inquiry_type": "bulk_order",
        "name": "Rohit Cricket Academy",
        "phone": "+91 9876543210",
        "email": "coach@rohitacademy.com",
        "club_name": "Rohit Cricket Academy",
        "order_quantity": "25 - 50 Bats",
        "bat_models": "Triple Cane Pro, Samurai Blade",
        "details": "Custom academy branding required on all bats. Need 1150g weight with round handles."
    }
    submit_res = client.post("/api/v1/bulk-orders", json=payload)
    assert submit_res.status_code == 201
    inquiry_data = submit_res.json()
    assert inquiry_data["name"] == "Rohit Cricket Academy"
    assert inquiry_data["order_quantity"] == "25 - 50 Bats"
    assert inquiry_data["status"] == "PENDING"
    inquiry_id = inquiry_data["id"]

    # 2. Non-admin should be denied access to admin bulk orders list
    unauth_res = client.get("/api/v1/admin/bulk-orders")
    assert unauth_res.status_code in [401, 403]

    # 3. Admin can list all bulk orders and find this inquiry
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    list_res = client.get("/api/v1/admin/bulk-orders", headers=admin_headers)
    assert list_res.status_code == 200
    inquiries = list_res.json()
    assert any(i["id"] == inquiry_id for i in inquiries)

    # 4. Admin can update inquiry status to QUOTED and add internal admin notes
    update_res = client.put(
        f"/api/v1/admin/bulk-orders/{inquiry_id}/status",
        headers=admin_headers,
        json={"status": "QUOTED", "admin_notes": "Offered 15% academy discount via WhatsApp."}
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["status"] == "QUOTED"
    assert "academy discount" in updated_data["admin_notes"]

    # 5. Filter by status returns the quoted inquiry
    filter_res = client.get("/api/v1/admin/bulk-orders?status_filter=QUOTED", headers=admin_headers)
    assert filter_res.status_code == 200
    assert any(i["id"] == inquiry_id for i in filter_res.json())

def test_why_vk_cms_endpoints():
    # 1. Public GET returns default or saved Why VK section
    res = client.get("/api/v1/cms/why-vk")
    assert res.status_code == 200
    data = res.json()
    assert "badge" in data
    assert "features" in data
    assert len(data["features"]) >= 1

    # 2. Non-admin cannot update Why VK section
    unauth_res = client.put("/api/v1/cms/why-vk", json=data)
    assert unauth_res.status_code in [401, 403]

    # 3. Admin can update Why VK section
    login_res = client.post("/api/v1/auth/login", json={"email": "admin@vkbathouse.com", "password": "Admin@123456"})
    admin_token = login_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    updated_payload = {
        "badge": "WHY CHOOSE VK?",
        "title": "Built Different.\nPerforms Different.",
        "image_url": "/standing_bat_hero.jpg",
        "image_badge": "CUSTOM PRO RESERVE",
        "features": [
            {
                "number": "01",
                "title": "CHAKLASI HERITAGE",
                "description": "Hand-carved with traditional drawknives by 3rd-generation craftsmen."
            }
        ]
    }

    put_res = client.put("/api/v1/cms/why-vk", json=updated_payload, headers=admin_headers)
    assert put_res.status_code == 200
    saved = put_res.json()
    assert saved["badge"] == "WHY CHOOSE VK?"
    assert saved["image_badge"] == "CUSTOM PRO RESERVE"
    assert saved["features"][0]["title"] == "CHAKLASI HERITAGE"

    # 4. Public GET now returns updated data
    get_res = client.get("/api/v1/cms/why-vk")
    assert get_res.status_code == 200
    assert get_res.json()["badge"] == "WHY CHOOSE VK?"



