import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.core.security import create_access_token, get_password_hash
from app.models.user import User

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Seed a verified test customer and test admin if not present
    customer = db.query(User).filter(User.email == "test_customer@vkbathouse.com").first()
    if not customer:
        customer = User(
            id=str(uuid.uuid4()),
            email="test_customer@vkbathouse.com",
            full_name="Test Customer Batsman",
            hashed_password=get_password_hash("TestPass123!"),
            role="customer",
            is_active=True
        )
        db.add(customer)

    admin = db.query(User).filter(User.email == "test_admin@vkbathouse.com").first()
    if not admin:
        admin = User(
            id=str(uuid.uuid4()),
            email="test_admin@vkbathouse.com",
            full_name="Test Admin Master",
            hashed_password=get_password_hash("AdminPass123!"),
            role="admin",
            is_active=True
        )
        db.add(admin)

    db.commit()
    db.close()
    yield

# 1. Test Security Headers
def test_security_headers_present():
    response = client.get("/")
    assert response.status_code == 200
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "SAMEORIGIN"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"

# 2. Test Unauthenticated Access to Admin Endpoints is Blocked (401 Unauthorized)
def test_unauthenticated_cannot_access_admin_dashboard():
    response = client.get("/api/v1/admin/dashboard")
    assert response.status_code == 401

def test_unauthenticated_cannot_access_admin_inventory():
    response = client.get("/api/v1/admin/inventory")
    assert response.status_code == 401

def test_unauthenticated_cannot_access_admin_users():
    response = client.get("/api/v1/admin/users")
    assert response.status_code == 401

# 3. Test Customer Role Cannot Access Admin Endpoints (403 Forbidden)
def test_customer_role_forbidden_from_admin_endpoints():
    db = SessionLocal()
    customer = db.query(User).filter(User.email == "test_customer@vkbathouse.com").first()
    db.close()
    
    customer_token = create_access_token(subject=customer.id, role=customer.role)
    headers = {"Authorization": f"Bearer {customer_token}"}
    
    response = client.get("/api/v1/admin/dashboard", headers=headers)
    assert response.status_code == 403

# 4. Test File Upload Security Rejects Insecure File Types
def test_file_upload_rejects_executable_and_dangerous_types():
    db = SessionLocal()
    admin = db.query(User).filter(User.email == "test_admin@vkbathouse.com").first()
    db.close()
    
    admin_token = create_access_token(subject=admin.id, role=admin.role)
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Attempt to upload dangerous executable file
    files = {"file": ("malicious.exe", b"MZ\x90\x00\x03\x00\x00\x00", "application/x-msdownload")}
    response = client.post("/api/v1/upload", files=files, headers=headers)
    assert response.status_code == 400

    # Attempt to upload Python script
    files = {"file": ("hack.py", b"import os; os.system('ls')", "text/x-python")}
    response = client.post("/api/v1/upload", files=files, headers=headers)
    assert response.status_code == 400

# 5. Test Rate Limiting on Brute Force Login
def test_rate_limiting_on_auth_endpoint():
    hit_limit = False
    for _ in range(25):
        resp = client.post("/api/v1/auth/login", json={"email": "spam@test.com", "password": "wrongpassword"})
        if resp.status_code == 429:
            hit_limit = True
            break
    assert hit_limit is True, "Rate limiter should trigger HTTP 429 after excessive rapid requests"

# 6. Test Health Endpoint
def test_health_check_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "vkbathouse-backend"}
