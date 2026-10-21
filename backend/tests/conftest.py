import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import app.core.database as core_db
from app.core.database import Base, get_db
from app.main import app
from app.core.security import get_password_hash
from app.models.user import User
from app.models.product import Product
from app.models.category import Category
from app.models.coupon import Coupon
from app.models.setting import Setting
from app.api.v1.legal import _ensure_default_documents

# Isolated Test Database Path
TEST_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "test_isolated_suite.db"))
TEST_DB_URL = f"sqlite:///{TEST_DB_PATH}"

test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

# Monkey-patch global database bindings for the test session
core_db.engine = test_engine
core_db.SessionLocal = TestingSessionLocal

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_isolated_test_suite_db():
    """
    Creates and seeds an isolated test database so that test executions
    NEVER contaminate or insert test orders into the production/dev app.db.
    """
    # 1. Create schema
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()

    # 2. Seed default legal documents
    _ensure_default_documents(db)

    # 3. Seed Category
    cat = db.query(Category).filter(Category.slug == "Kashmir-willow").first()
    if not cat:
        cat = Category(
            id="test-cat-api-uuid",
            name="Kashmir Willow Masterpieces",
            slug="Kashmir-willow",
            description="Grade 1+ handcrafted Kashmir Willow",
            is_active=True
        )
        db.add(cat)
        db.flush()

    # 4. Seed Product
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
            willow_grade="Grade 1+ Kashmir Willow",
            blade_architecture="Single Blade",
            pressing_type="Triple Pressed",
            grain_count="10",
            rating_avg=5.0,
            reviews_count=12,
            gst_rate=0.0
        )
        db.add(prod)

    # 5. Seed Test Users
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

    rt_cust = db.query(User).filter(User.email == "rt_customer@vkbathouse.com").first()
    if not rt_cust:
        rt_cust = User(
            id="test-rt-customer-uuid",
            email="rt_customer@vkbathouse.com",
            full_name="Realtime Batsman",
            hashed_password=get_password_hash("TestPass123!"),
            role="customer",
            is_active=True
        )
        db.add(rt_cust)

    rt_adm = db.query(User).filter(User.email == "rt_admin@vkbathouse.com").first()
    if not rt_adm:
        rt_adm = User(
            id="test-rt-admin-uuid",
            email="rt_admin@vkbathouse.com",
            full_name="Realtime Admin",
            hashed_password=get_password_hash("AdminPass123!"),
            role="admin",
            is_active=True
        )
        db.add(rt_adm)

    sec_cust = db.query(User).filter(User.email == "test_customer@vkbathouse.com").first()
    if not sec_cust:
        sec_cust = User(
            id="test-sec-customer-uuid",
            email="test_customer@vkbathouse.com",
            full_name="Test Customer Batsman",
            hashed_password=get_password_hash("TestPass123!"),
            role="customer",
            is_active=True
        )
        db.add(sec_cust)

    sec_adm = db.query(User).filter(User.email == "test_admin@vkbathouse.com").first()
    if not sec_adm:
        sec_adm = User(
            id="test-sec-admin-uuid",
            email="test_admin@vkbathouse.com",
            full_name="Test Admin Master",
            hashed_password=get_password_hash("AdminPass123!"),
            role="admin",
            is_active=True
        )
        db.add(sec_adm)

    # 6. Seed Coupon
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

    # Teardown: close and clean up isolated test database
    test_engine.dispose()
    if os.path.exists(TEST_DB_PATH):
        try:
            os.remove(TEST_DB_PATH)
        except Exception:
            pass
