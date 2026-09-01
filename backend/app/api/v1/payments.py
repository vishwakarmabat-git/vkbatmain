import hmac
import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.schemas.order import PaymentVerifyRequest
from app.models.order import Order, Payment

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/create-razorpay-order/{order_id}")
def create_razorpay_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    amount_in_paise = int(round(float(order.grand_total) * 100))

    # Check if real keys are configured
    if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
        import httpx
        auth = (settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        payload = {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": order.order_number,
            "notes": {"order_id": order.id, "order_number": order.order_number}
        }
        try:
            res = httpx.post("https://api.razorpay.com/v1/orders", json=payload, auth=auth, timeout=10.0)
            if res.status_code == 200:
                rp_order = res.json()
                return {
                    "razorpay_order_id": rp_order["id"],
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "key_id": settings.RAZORPAY_KEY_ID
                }
        except Exception as e:
            pass

    # Mock order ID for sandbox / zero-config testing
    mock_rp_id = f"order_mock_{order.order_number}"
    return {
        "razorpay_order_id": mock_rp_id,
        "amount": amount_in_paise,
        "currency": "INR",
        "key_id": settings.RAZORPAY_KEY_ID or "rzp_test_mock_key"
    }

@router.post("/verify")
def verify_payment(data: PaymentVerifyRequest, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == data.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    is_valid = False
    if settings.RAZORPAY_KEY_SECRET:
        generated_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            f"{data.razorpay_order_id}|{data.razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()
        is_valid = hmac.compare_digest(generated_signature, data.razorpay_signature)
    else:
        # Development mock verification
        is_valid = True

    if is_valid:
        order.payment_status = "paid"
        order.order_status = "processing"
        
        # Record payment
        payment = db.query(Payment).filter(Payment.order_id == order.id).first()
        if not payment:
            payment = Payment(order_id=order.id, payment_method="razorpay", amount=order.grand_total)
            db.add(payment)
        
        payment.razorpay_order_id = data.razorpay_order_id
        payment.razorpay_payment_id = data.razorpay_payment_id
        payment.razorpay_signature = data.razorpay_signature
        payment.status = "success"
        
        db.commit()
        return {"success": True, "message": "Payment verified successfully", "order_number": order.order_number}
    else:
        raise HTTPException(status_code=400, detail="Invalid payment signature")
