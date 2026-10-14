import json
import logging
from typing import Optional
from fastapi import APIRouter, Request, Header, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.services.courier_uncle import courier_uncle_client
from app.services.shipment_service import ShipmentService

logger = logging.getLogger("vkbathouse.webhooks")

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

@router.post("/courier-uncle")
async def handle_courier_uncle_webhook(
    request: Request,
    x_cu_signature: Optional[str] = Header(None, alias="X-CU-Signature"),
    db: Session = Depends(get_db)
):
    """
    Courier Uncle Webhook receiver.
    Verifies HMAC-SHA256 signature using COURIER_UNCLE_WEBHOOK_SECRET.
    Processes status changes:
    - shipment.created, shipment.picked_up, shipment.in_transit, shipment.out_for_delivery,
    - shipment.delivered, shipment.ndr, shipment.rto, shipment.cancelled
    """
    raw_body = await request.body()

    # Authenticate signature if secret is configured
    if settings.COURIER_UNCLE_WEBHOOK_SECRET:
        if not x_cu_signature:
            logger.warning("Courier Uncle webhook rejected: missing X-CU-Signature header")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing X-CU-Signature header"
            )
        
        is_valid = courier_uncle_client.verify_webhook_signature(raw_body, x_cu_signature)
        if not is_valid:
            logger.warning("Courier Uncle webhook rejected: invalid signature")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid webhook signature"
            )

    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except Exception as e:
        logger.error(f"Malformed webhook JSON payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    logger.info(f"Received Courier Uncle webhook event: {payload.get('event')} for AWB {payload.get('awb_number')}")
    result = await ShipmentService.process_webhook(db, payload)
    return {"status": "ok", "result": result}
