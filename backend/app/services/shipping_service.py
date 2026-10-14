import math
import time
import logging
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.core.config import settings
from app.models.product import Product
from app.models.order import Order
from app.services.courier_uncle import courier_uncle_client
from app.schemas.shipping import (
    PincodeLookupResponse,
    ServiceabilityResponse,
    CourierServiceInfo,
    RateCalculationResponse,
    CourierQuote
)

logger = logging.getLogger("vkbathouse.shipping_service")

# Simple memory cache for serviceability and pincode lookups (TTL: 10 minutes)
_CACHE: Dict[str, Tuple[float, Any]] = {}
CACHE_TTL_SECONDS = 600

def _get_from_cache(key: str) -> Optional[Any]:
    if key in _CACHE:
        expire_at, val = _CACHE[key]
        if time.time() < expire_at:
            return val
        del _CACHE[key]
    return None

def _save_to_cache(key: str, val: Any, ttl: int = CACHE_TTL_SECONDS):
    _CACHE[key] = (time.time() + ttl, val)

class ShippingService:
    """
    Business logic service for cricket-bat e-commerce shipping, serviceability,
    parcel packaging calculations, and real-time carrier rates.
    """

    @staticmethod
    def calculate_cricket_bat_parcel(
        items: List[Tuple[Product, int]]
    ) -> Dict[str, float]:
        """
        Specialized cricket-bat parcel calculation adhering to industry packaging standards.
        - Length remains the length of the longest bat box (default ~90.0 cm).
        - Multi-bat shipments pack in a structured rectangular master carton.
        - Volumetric weight calculated according to courier rule: (L x W x H) / 5000.
        """
        if not items:
            # Safe cricket single-bat fallback
            return {
                "dead_weight_kg": 1.5,
                "length_cm": 90.0,
                "width_cm": 14.0,
                "height_cm": 10.0,
                "volumetric_weight_kg": round((90.0 * 14.0 * 10.0) / 5000.0, 3),
                "chargeable_weight_kg": max(1.5, round((90.0 * 14.0 * 10.0) / 5000.0, 3)),
            }

        total_bats = 0
        total_dead_weight = 0.0
        max_length = 90.0

        for product, qty in items:
            p_qty = max(1, qty)
            total_bats += p_qty
            
            # Product-level packed specs or high-precision defaults
            p_weight = getattr(product, "package_weight_kg", None) or 1.5
            p_length = getattr(product, "package_length_cm", None) or 90.0
            
            total_dead_weight += float(p_weight) * p_qty
            if float(p_length) > max_length:
                max_length = float(p_length)

        # Multi-bat packaging arrangement
        # Bats are packed side-by-side and stacked in corrugated master carton
        cols = math.ceil(math.sqrt(total_bats))
        rows = math.ceil(total_bats / cols)

        width_cm = min(60.0, 14.0 * cols)
        height_cm = min(50.0, 10.0 * rows)
        length_cm = max_length

        # Packaging tare weight: 0.15kg for 1 bat box, 0.35kg for master carton
        tare_weight = 0.15 if total_bats <= 1 else 0.35
        final_dead_weight = round(total_dead_weight + tare_weight, 3)

        volumetric_weight = round((length_cm * width_cm * height_cm) / 5000.0, 3)
        chargeable_weight = round(max(final_dead_weight, volumetric_weight), 3)

        return {
            "dead_weight_kg": final_dead_weight,
            "length_cm": length_cm,
            "width_cm": width_cm,
            "height_cm": height_cm,
            "volumetric_weight_kg": volumetric_weight,
            "chargeable_weight_kg": chargeable_weight,
        }

    @staticmethod
    async def lookup_pincode(pincode: str) -> PincodeLookupResponse:
        """Validates 6-digit Indian postal code and returns city & state."""
        clean = pincode.strip()
        if len(clean) != 6 or not clean.isdigit():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Pincode must be exactly 6 digits."
            )

        cache_key = f"pincode:{clean}"
        cached = _get_from_cache(cache_key)
        if cached:
            return PincodeLookupResponse(**cached)

        data = await courier_uncle_client.lookup_pincode(clean)
        res = PincodeLookupResponse(
            pincode=clean,
            city=data.get("city", "Unknown City"),
            state=data.get("state", "Unknown State")
        )
        _save_to_cache(cache_key, res.model_dump())
        return res

    @staticmethod
    async def check_serviceability(
        destination_pincode: str,
        origin_pincode: Optional[str] = None,
        payment_mode: str = "PREPAID"
    ) -> ServiceabilityResponse:
        """
        Determines whether Courier Uncle carriers serve the route,
        and distinguishes between prepaid vs COD delivery capabilities.
        """
        dest_clean = destination_pincode.strip()
        if len(dest_clean) != 6 or not dest_clean.isdigit():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Destination pincode must be a 6-digit number."
            )

        origin_clean = (origin_pincode or settings.COURIER_UNCLE_DEFAULT_ORIGIN_PINCODE or "122001").strip()
        mode_clean = payment_mode.upper() if payment_mode else "PREPAID"

        cache_key = f"serv:{origin_clean}:{dest_clean}:{mode_clean}"
        cached = _get_from_cache(cache_key)
        if cached:
            return ServiceabilityResponse(**cached)

        try:
            data = await courier_uncle_client.check_serviceability(
                origin=origin_clean,
                destination=dest_clean,
                payment_mode=mode_clean
            )
        except Exception as e:
            logger.error(f"Error checking serviceability for {dest_clean}: {e}")
            return ServiceabilityResponse(
                serviceable=False,
                origin=origin_clean,
                destination=dest_clean,
                payment_mode=mode_clean,
                cod_available=False,
                prepaid_available=False,
                couriers=[],
                message="Unable to verify courier serviceability at this moment."
            )

        raw_couriers = data.get("couriers", [])
        is_serviceable = bool(data.get("serviceable", False)) and len(raw_couriers) > 0
        
        # Check if at least one courier supports COD
        has_cod = is_serviceable and mode_clean == "COD"

        courier_list = []
        for c in raw_couriers:
            courier_list.append(CourierServiceInfo(
                code=c.get("code", ""),
                name=c.get("name", ""),
                estimated_days=c.get("estimated_days"),
                services=c.get("services", [])
            ))

        response = ServiceabilityResponse(
            serviceable=is_serviceable,
            origin=data.get("origin", origin_clean),
            destination=data.get("destination", dest_clean),
            zone=data.get("zone"),
            zone_name=data.get("zone_name"),
            payment_mode=mode_clean,
            cod_available=has_cod,
            prepaid_available=is_serviceable,
            couriers=courier_list,
            message="Delivery is serviceable to this address." if is_serviceable else "This postal pincode is currently not serviceable by our courier network."
        )

        _save_to_cache(cache_key, response.model_dump(), ttl=600)
        return response

    @staticmethod
    async def calculate_shipping_rates(
        db: Session,
        destination_pincode: str,
        origin_pincode: Optional[str] = None,
        items: Optional[List[Dict[str, Any]]] = None,
        custom_weight_kg: Optional[float] = None,
        custom_length_cm: Optional[float] = None,
        custom_width_cm: Optional[float] = None,
        custom_height_cm: Optional[float] = None,
        payment_mode: str = "PREPAID",
        cod_amount: float = 0.0
    ) -> RateCalculationResponse:
        """
        Calculates live courier rates from Courier Uncle for cricket bat parcels.
        Pulls actual product dimensions from database whenever product items are provided.
        """
        origin_clean = (origin_pincode or settings.COURIER_UNCLE_DEFAULT_ORIGIN_PINCODE or "122001").strip()
        dest_clean = destination_pincode.strip()

        if len(dest_clean) != 6 or not dest_clean.isdigit():
            raise HTTPException(status_code=400, detail="Destination pincode must be 6 digits.")

        # Determine parcel packaging parameters
        if items:
            resolved_items = []
            for item_in in items:
                p_id = item_in.get("product_id")
                qty = int(item_in.get("quantity", 1))
                prod = db.query(Product).filter(Product.id == p_id).first()
                if prod:
                    resolved_items.append((prod, qty))
            
            parcel_specs = ShippingService.calculate_cricket_bat_parcel(resolved_items)
            dead_weight = parcel_specs["dead_weight_kg"]
            length_cm = parcel_specs["length_cm"]
            width_cm = parcel_specs["width_cm"]
            height_cm = parcel_specs["height_cm"]
            vol_weight = parcel_specs["volumetric_weight_kg"]
            chargeable_weight = parcel_specs["chargeable_weight_kg"]
        else:
            dead_weight = float(custom_weight_kg or 1.5)
            length_cm = float(custom_length_cm or 90.0)
            width_cm = float(custom_width_cm or 14.0)
            height_cm = float(custom_height_cm or 10.0)
            vol_weight = round((length_cm * width_cm * height_cm) / 5000.0, 3)
            chargeable_weight = max(dead_weight, vol_weight)

        mode_clean = payment_mode.upper() if payment_mode else "PREPAID"

        data = await courier_uncle_client.calculate_rates(
            origin_pincode=origin_clean,
            destination_pincode=dest_clean,
            weight_kg=chargeable_weight,
            length_cm=length_cm,
            width_cm=width_cm,
            height_cm=height_cm,
            payment_mode=mode_clean,
            cod_amount=cod_amount if mode_clean == "COD" else 0.0
        )

        couriers_data = data.get("couriers", [])
        courier_quotes: List[CourierQuote] = []

        for c in couriers_data:
            courier_quotes.append(CourierQuote(
                courier_code=c.get("courier_code", ""),
                courier_name=c.get("courier_name", ""),
                service=c.get("service", "SURFACE"),
                service_label=c.get("service_label", "Surface"),
                display_name=c.get("display_name", f"{c.get('courier_name')} {c.get('service_label')}"),
                zone=c.get("zone"),
                freight=float(c.get("freight", 0.0)),
                cod_charge=float(c.get("cod_charge", 0.0)),
                gst_amount=float(c.get("gst_amount", 0.0)),
                total=float(c.get("total", 0.0)),
                total_with_gst=float(c.get("total_with_gst", 0.0)),
                rto_charge=float(c.get("rto_charge", 0.0)) if c.get("rto_charge") is not None else None,
                estimated_days=c.get("estimated_days"),
                recommended=bool(c.get("recommended", False))
            ))

        # Sort: recommended first, then by total_with_gst ascending
        courier_quotes.sort(key=lambda x: (not x.recommended, x.total_with_gst))

        return RateCalculationResponse(
            serviceable=len(courier_quotes) > 0,
            origin_pincode=origin_clean,
            destination_pincode=dest_clean,
            zone=data.get("zone"),
            zone_name=data.get("zone_name"),
            payment_mode=mode_clean,
            chargeable_weight_kg=chargeable_weight,
            volumetric_weight_kg=vol_weight,
            dead_weight_kg=dead_weight,
            length_cm=length_cm,
            width_cm=width_cm,
            height_cm=height_cm,
            gst_percent=float(data.get("gst_percent", 18.0)),
            couriers=courier_quotes,
            error=None if courier_quotes else "No courier partners available for this lane and weight configuration."
        )
