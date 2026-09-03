import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)

def test_public_legal_documents():
    """Verify all 10 legal and support documents are seeded and accessible."""
    response = client.get("/api/v1/legal/documents")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 10
    
    slugs = [d["slug"] for d in data]
    required_slugs = [
        "privacy-policy",
        "terms-and-conditions",
        "terms-of-sale",
        "shipping-policy",
        "cancellation-policy",
        "return-refund-policy",
        "payment-policy",
        "cookie-policy",
        "contact-us",
        "grievance-redressal",
    ]
    for slug in required_slugs:
        assert slug in slugs

    # Fetch single document
    doc_res = client.get("/api/v1/legal/documents/privacy-policy")
    assert doc_res.status_code == 200
    doc = doc_res.json()
    assert doc["title"] == "Privacy Policy"
    assert "Vishwakarma Bat House" in doc["content"]
    assert "Razorpay" in doc["content"]

def test_registration_consent_enforcement():
    """Registration without mandatory consent must fail with 400."""
    import uuid
    uid = str(uuid.uuid4())[:8]
    
    # 1. Unchecked required consent
    fail_res = client.post("/api/v1/auth/register", json={
        "email": f"unconsenting_{uid}@test.com",
        "password": "Password123!",
        "full_name": "Unconsenting Player",
        "accept_terms_and_privacy": False,
        "marketing_opt_in": False
    })
    assert fail_res.status_code == 400
    assert "Terms & Conditions" in fail_res.json()["detail"]

    # 2. Checked required consent + optional marketing
    succ_res = client.post("/api/v1/auth/register", json={
        "email": f"consenting_{uid}@test.com",
        "password": "Password123!",
        "full_name": "Consenting Player",
        "accept_terms_and_privacy": True,
        "marketing_opt_in": True
    })
    assert succ_res.status_code == 201
    token = succ_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Verify marketing preferences were stored
    pref_res = client.get("/api/v1/legal/marketing-preferences", headers=headers)
    assert pref_res.status_code == 200
    prefs = pref_res.json()
    assert prefs["email_marketing"] is True
    assert prefs["sms_marketing"] is True

    # Verify consent history
    consent_res = client.get("/api/v1/legal/my-consent", headers=headers)
    assert consent_res.status_code == 200
    records = consent_res.json()
    consent_types = [r["consent_type"] for r in records]
    assert "TERMS_AND_PRIVACY" in consent_types
    assert "MARKETING_PROMOTIONS" in consent_types

def test_marketing_preferences_toggle():
    """Customer can change marketing preferences at any time."""
    import uuid
    uid = str(uuid.uuid4())[:8]
    
    reg_res = client.post("/api/v1/auth/register", json={
        "email": f"mkt_user_{uid}@test.com",
        "password": "Password123!",
        "full_name": "Marketing Tester",
        "accept_terms_and_privacy": True,
        "marketing_opt_in": False
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Update preferences to only Email marketing
    update_res = client.put("/api/v1/legal/marketing-preferences", json={
        "email_marketing": True,
        "sms_marketing": False,
        "whatsapp_marketing": False
    }, headers=headers)
    assert update_res.status_code == 200
    assert update_res.json()["email_marketing"] is True
    assert update_res.json()["sms_marketing"] is False

def test_account_deletion_request_requires_password():
    """Account deletion must verify user password before lodging request."""
    import uuid
    uid = str(uuid.uuid4())[:8]
    
    reg_res = client.post("/api/v1/auth/register", json={
        "email": f"deletion_{uid}@test.com",
        "password": "CorrectPassword123!",
        "full_name": "Deletion Tester",
        "accept_terms_and_privacy": True
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Missing password
    fail1 = client.post("/api/v1/legal/privacy-request", json={
        "request_type": "ACCOUNT_DELETION",
        "reason": "Retiring from league cricket"
    }, headers=headers)
    assert fail1.status_code == 400

    # 2. Wrong password
    fail2 = client.post("/api/v1/legal/privacy-request", json={
        "request_type": "ACCOUNT_DELETION",
        "current_password": "WrongPassword!",
        "reason": "Retiring from league cricket"
    }, headers=headers)
    assert fail2.status_code == 400

    # 3. Correct password
    succ = client.post("/api/v1/legal/privacy-request", json={
        "request_type": "ACCOUNT_DELETION",
        "current_password": "CorrectPassword123!",
        "reason": "Retiring from league cricket"
    }, headers=headers)
    assert succ.status_code == 201
    assert succ.json()["status"] == "PENDING"
    assert succ.json()["request_type"] == "ACCOUNT_DELETION"
