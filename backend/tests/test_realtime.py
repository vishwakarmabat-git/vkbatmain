import pytest
import uuid
import json
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
    
    # Create test customer
    customer = db.query(User).filter(User.email == "rt_customer@vkbathouse.com").first()
    if not customer:
        customer = User(
            id="test-rt-customer-uuid",
            email="rt_customer@vkbathouse.com",
            full_name="Realtime Batsman",
            hashed_password=get_password_hash("TestPass123!"),
            role="customer",
            is_active=True
        )
        db.add(customer)

    # Create test admin
    admin = db.query(User).filter(User.email == "rt_admin@vkbathouse.com").first()
    if not admin:
        admin = User(
            id="test-rt-admin-uuid",
            email="rt_admin@vkbathouse.com",
            full_name="Realtime Admin",
            hashed_password=get_password_hash("AdminPass123!"),
            role="admin",
            is_active=True
        )
        db.add(admin)

    db.commit()
    db.close()
    yield

# 1. Test Public Guest WebSocket Connection & Handshake
def test_websocket_guest_connection():
    with client.websocket_connect("/api/v1/ws") as websocket:
        data = websocket.receive_json()
        assert data["event"] == "CONNECTED"
        assert data["data"]["authenticated"] is False
        assert data["data"]["role"] == "guest"

# 2. Test Customer Authenticated WebSocket Connection
def test_websocket_customer_authenticated_connection():
    token = create_access_token(subject="test-rt-customer-uuid", role="customer")
    with client.websocket_connect(f"/api/v1/ws?token={token}") as websocket:
        data = websocket.receive_json()
        assert data["event"] == "CONNECTED"
        assert data["data"]["authenticated"] is True
        assert data["data"]["role"] == "customer"
        assert data["data"]["user_id"] == "test-rt-customer-uuid"

# 3. Test Admin Authenticated WebSocket Connection
def test_websocket_admin_authenticated_connection():
    token = create_access_token(subject="test-rt-admin-uuid", role="admin")
    with client.websocket_connect(f"/api/v1/ws?token={token}") as websocket:
        data = websocket.receive_json()
        assert data["event"] == "CONNECTED"
        assert data["data"]["authenticated"] is True
        assert data["data"]["role"] == "admin"
        assert data["data"]["user_id"] == "test-rt-admin-uuid"

# 4. Test WebSocket Heartbeat Ping/Pong
def test_websocket_ping_pong():
    with client.websocket_connect("/api/v1/ws") as websocket:
        # Handshake
        websocket.receive_json()
        # Send ping
        websocket.send_text(json.dumps({"type": "ping"}))
        response = websocket.receive_json()
        assert response.get("type") == "pong"
