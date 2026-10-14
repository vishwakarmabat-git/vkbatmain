import pytest
import hmac
import hashlib
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.user import User
from app.models.order import Order
from app.models.product import Product
from app.models.shipment import Shipment
from app.services.shipping_service import ShippingService

client = TestClient(app)

@pytest.fixture
def auth_tokens():
    from app.core.security import create_access_token
    db = SessionLocal()
    admin = db.query(User).filter(User.role.in_(["admin", "superadmin"])).first()
    customer = db.query(User).filter(User.role == "customer").first()
    db.close()

    admin_token = create_access_token(admin.id, role="admin")
    cust_token = create_access_token(customer.id, role="customer")

    return {
        "admin_token": admin_token,
        "cust_token": cust_token,
        "admin_id": admin.id,
        "customer_id": customer.id
    }

# --- 1. PINCODE LOOKUP & SERVICEABILITY TESTS ---

def test_pincode_lookup_valid():
    res = client.get("/api/v1/shipping/pincode/110001")
    assert res.status_code == 200
    data = res.json()
    assert data["pincode"] == "110001"
    assert "city" in data
    assert "state" in data

def test_pincode_lookup_invalid():
    res = client.get("/api/v1/shipping/pincode/123")
    assert res.status_code == 400

def test_serviceability_check():
    payload = {
        "destination_pincode": "400001",
        "origin_pincode": "122001",
        "payment_mode": "PREPAID"
    }
    res = client.post("/api/v1/shipping/serviceability", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["serviceable"] is True
    assert data["destination"] == "400001"
    assert len(data["couriers"]) > 0

def test_serviceability_cod():
    payload = {
        "destination_pincode": "400001",
        "origin_pincode": "122001",
        "payment_mode": "COD"
    }
    res = client.post("/api/v1/shipping/serviceability", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["cod_available"] is True

# --- 2. CRICKET BAT PACKAGING & SHIPPING RATES TESTS ---

def test_cricket_bat_parcel_calculation():
    db = SessionLocal()
    product = db.query(Product).first()
    db.close()

    # Single bat
    specs_1 = ShippingService.calculate_cricket_bat_parcel([(product, 1)])
    assert specs_1["length_cm"] >= 90.0
    assert specs_1["chargeable_weight_kg"] >= 1.5

    # Multi-bat (3 bats)
    specs_3 = ShippingService.calculate_cricket_bat_parcel([(product, 3)])
    assert specs_3["length_cm"] >= 90.0
    assert specs_3["chargeable_weight_kg"] > specs_1["chargeable_weight_kg"]
    assert specs_3["width_cm"] > specs_1["width_cm"]

def test_rate_calculation_prepaid_and_cod():
    db = SessionLocal()
    product = db.query(Product).first()
    db.close()

    # Prepaid
    payload = {
        "destination_pincode": "400001",
        "items": [{"product_id": product.id, "quantity": 1}],
        "payment_mode": "PREPAID"
    }
    res = client.post("/api/v1/shipping/rates", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["serviceable"] is True
    assert len(data["couriers"]) > 0
    # Verified fields from Courier Uncle API contract
    first_courier = data["couriers"][0]
    assert "freight" in first_courier
    assert "total_with_gst" in first_courier
    assert first_courier["total_with_gst"] > 0

    # COD includes COD charge
    payload_cod = {
        "destination_pincode": "400001",
        "items": [{"product_id": product.id, "quantity": 1}],
        "payment_mode": "COD",
        "cod_amount": 4500.0
    }
    res_cod = client.post("/api/v1/shipping/rates", json=payload_cod)
    assert res_cod.status_code == 200
    data_cod = res_cod.json()
    first_cod = data_cod["couriers"][0]
    assert first_cod["cod_charge"] > 0

# --- 3. SHIPMENT BOOKING & DUPLICATE PROTECTION TESTS ---

def test_shipment_booking_and_duplicate_protection(auth_tokens):
    import traceback
    try:
        db = SessionLocal()
        product = db.query(Product).first()
        db.close()

        # Create an order
        order_payload = {
            "shipping_address": {
                "full_name": "Test Customer",
                "email": "customer@vkbathouse.in",
                "phone": "9876543210",
                "address_line1": "Flat 4B, Sports Enclave",
                "city": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001"
            },
            "items": [{"product_id": product.id, "quantity": 1}],
            "payment_method": "cod",
            "shipping_fee": 115.0,
            "shipping_carrier": "Ekart"
        }

        create_res = client.post(
            "/api/v1/orders",
            json=order_payload,
            headers={"Authorization": f"Bearer {auth_tokens['cust_token']}"}
        )
        assert create_res.status_code == 201
        order_data = create_res.json()
        order_id = order_data["id"]
        assert order_data["shipping_fee"] == 115.0

        # Customer CANNOT book shipment (Admin authorization required)
        cust_book_res = client.post(
            f"/api/v1/admin/orders/{order_id}/book-shipment",
            json={"courier_code": "ekart"},
            headers={"Authorization": f"Bearer {auth_tokens['cust_token']}"}
        )
        assert cust_book_res.status_code == 403

        # Admin books shipment successfully
        admin_book_res = client.post(
            f"/api/v1/admin/orders/{order_id}/book-shipment",
            json={"courier_code": "ekart", "courier_service": "SURFACE"},
            headers={"Authorization": f"Bearer {auth_tokens['admin_token']}"}
        )
        assert admin_book_res.status_code == 201
        shipment_data = admin_book_res.json()
        assert shipment_data["tracking_id"].startswith("CU")
        assert shipment_data["shipment_status"] == "CREATED"
        shipment_id = shipment_data["id"]

        # Duplicate Booking Attempt MUST be blocked (HTTP 409 Conflict)
        duplicate_res = client.post(
            f"/api/v1/admin/orders/{order_id}/book-shipment",
            json={"courier_code": "ekart"},
            headers={"Authorization": f"Bearer {auth_tokens['admin_token']}"}
        )
        assert duplicate_res.status_code == 409

        # Admin downloads label PDF
        label_res = client.get(
            f"/api/v1/admin/shipments/{shipment_id}/label",
            headers={"Authorization": f"Bearer {auth_tokens['admin_token']}"}
        )
        assert label_res.status_code == 200
        assert label_res.headers["Content-Type"] == "application/pdf"
        assert len(label_res.content) > 0

        # Customer tracks their own shipment
        track_res = client.get(
            f"/api/v1/orders/{order_id}/tracking",
            headers={"Authorization": f"Bearer {auth_tokens['cust_token']}"}
        )
        assert track_res.status_code == 200
        tracking_info = track_res.json()
        assert tracking_info["tracking_id"] == shipment_data["tracking_id"]
        assert len(tracking_info["timeline"]) > 0

        # Public tracking by AWB
        pub_track_res = client.get(f"/api/v1/track/{shipment_data['tracking_id']}")
        assert pub_track_res.status_code == 200
        assert pub_track_res.json()["tracking_id"] == shipment_data["tracking_id"]

        # Cancel Shipment
        cancel_res = client.post(
            f"/api/v1/admin/shipments/{shipment_id}/cancel",
            json={"reason": "Customer called to adjust bat weight"},
            headers={"Authorization": f"Bearer {auth_tokens['admin_token']}"}
        )
        assert cancel_res.status_code == 200
        assert cancel_res.json()["shipment_status"] == "CANCELLED"
    except Exception as e:
        print("\n\n>>> BOOKING TEST FAILED WITH:", repr(e))
        traceback.print_exc()
        raise

# --- 4. WEBHOOK VERIFICATION TESTS ---

def test_webhook_processing():
    db = SessionLocal()
    shipment = db.query(Shipment).first()
    db.close()

    if not shipment:
        pytest.skip("No shipment found for webhook test")

    webhook_payload = {
        "event": "shipment.in_transit",
        "event_id": "evt_test_999",
        "order_id": shipment.order_id,
        "awb_number": shipment.tracking_id,
        "carrier": "Ekart",
        "courier_code": "ekart",
        "courier_service": "SURFACE",
        "current_status": "IN_TRANSIT",
        "status_time": "2026-10-13 14:00:00",
        "notes": "Departed Northern Hub",
        "location": "Delhi Sorting Facility"
    }

    import json
    import hmac
    import hashlib
    body_bytes = json.dumps(webhook_payload).encode("utf-8")
    headers = {"Content-Type": "application/json"}
    if settings.COURIER_UNCLE_WEBHOOK_SECRET:
        sig = hmac.new(settings.COURIER_UNCLE_WEBHOOK_SECRET.encode("utf-8"), body_bytes, hashlib.sha256).hexdigest()
        headers["X-CU-Signature"] = f"sha256={sig}"

    wh_res = client.post("/api/v1/webhooks/courier-uncle", content=body_bytes, headers=headers)
    assert wh_res.status_code == 200
    assert wh_res.json()["status"] == "ok"
