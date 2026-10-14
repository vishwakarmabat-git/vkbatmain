from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.shipping import (
    PincodeLookupResponse,
    ServiceabilityRequest,
    ServiceabilityResponse,
    RateCalculationRequest,
    RateCalculationResponse
)
from app.services.shipping_service import ShippingService
from app.services.courier_uncle import courier_uncle_client

router = APIRouter(prefix="/shipping", tags=["Shipping & Logistics"])

@router.get("/pincode/{pincode}", response_model=PincodeLookupResponse)
async def lookup_pincode(pincode: str):
    """
    Validates a 6-digit Indian delivery pincode and returns city/state.
    """
    return await ShippingService.lookup_pincode(pincode)

@router.post("/serviceability", response_model=ServiceabilityResponse)
async def check_serviceability(data: ServiceabilityRequest):
    """
    Checks delivery route serviceability, courier availability, and COD support.
    """
    return await ShippingService.check_serviceability(
        destination_pincode=data.destination_pincode,
        origin_pincode=data.origin_pincode,
        payment_mode=data.payment_mode or "PREPAID"
    )

@router.post("/rates", response_model=RateCalculationResponse)
async def calculate_shipping_rates(
    data: RateCalculationRequest,
    db: Session = Depends(get_db)
):
    """
    Calculates live shipping quotes across eligible Courier Uncle partners
    factoring in cricket-bat parcel weights, dimensions, and payment modes.
    """
    items_data = [item.model_dump() for item in data.items] if data.items else None
    return await ShippingService.calculate_shipping_rates(
        db=db,
        destination_pincode=data.destination_pincode,
        origin_pincode=data.origin_pincode,
        items=items_data,
        custom_weight_kg=data.weight_kg,
        custom_length_cm=data.length_cm,
        custom_width_cm=data.width_cm,
        custom_height_cm=data.height_cm,
        payment_mode=data.payment_mode or "PREPAID",
        cod_amount=data.cod_amount or 0.0
    )

@router.get("/couriers")
async def get_supported_couriers():
    """
    Lists enabled courier partners on the account.
    """
    return await courier_uncle_client.get_couriers()
