import asyncio
import hmac
import hashlib
import logging
from typing import Optional, Dict, Any, List
import httpx
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger("vkbathouse.courier_uncle")

class CourierUncleClient:
    """
    Centralized API client for Courier Uncle Logistics.
    Documentation: https://www.courieruncle.com/api-docs
    Base URL: https://app.courieruncle.com/api/ext/v1/
    Authentication: X-API-Key: cu_test_... or cu_live_...
    """

    def __init__(self):
        self.base_url = settings.COURIER_UNCLE_BASE_URL.rstrip("/")
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def api_key(self) -> str:
        import os
        return (os.getenv("COURIER_UNCLE_API_KEY") or settings.COURIER_UNCLE_API_KEY or "").strip()

    @property
    def webhook_secret(self) -> str:
        import os
        return (os.getenv("COURIER_UNCLE_WEBHOOK_SECRET") or settings.COURIER_UNCLE_WEBHOOK_SECRET or "").strip()

    @property
    def is_sandbox(self) -> bool:
        return settings.is_courier_uncle_sandbox

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "VKBatHouse-Logistics/1.0",
        }
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        return headers

    def _ensure_trailing_slash(self, path: str) -> str:
        clean = path.strip()
        if not clean.endswith("/") and "?" not in clean:
            clean = f"{clean}/"
        elif "?" in clean:
            parts = clean.split("?", 1)
            if not parts[0].endswith("/"):
                clean = f"{parts[0]}/?{parts[1]}"
        return clean

    async def get_client(self) -> httpx.AsyncClient:
        current_loop = None
        try:
            current_loop = asyncio.get_running_loop()
        except RuntimeError:
            pass

        if (
            self._client is None
            or self._client.is_closed
            or getattr(self, "_client_loop", None) != current_loop
        ):
            if self._client and not self._client.is_closed:
                try:
                    await self._client.aclose()
                except Exception:
                    pass
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=httpx.Timeout(30.0, connect=10.0),
                headers=self._get_headers(),
                limits=httpx.Limits(max_connections=20, max_keepalive_connections=5)
            )
            self._client_loop = current_loop
        return self._client

    async def close(self):
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None

    async def _request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        json_data: Optional[Dict[str, Any]] = None,
        expected_status: int = 200
    ) -> Dict[str, Any]:
        """
        Executes an HTTP request to Courier Uncle with standardized error handling.
        """
        # If API key is not configured, supply robust development mock responses
        if not self.api_key:
            logger.info(f"Courier Uncle API key not configured. Using local sandbox mock for {endpoint}")
            return self._mock_response(endpoint, method, params, json_data)

        endpoint_with_slash = self._ensure_trailing_slash(endpoint)
        client = await self.get_client()

        try:
            response = await client.request(
                method=method,
                url=endpoint_with_slash,
                params=params,
                json=json_data,
                headers=self._get_headers()
            )

            # Handle 409 Conflict (Idempotent Shipment Booking duplicate)
            if response.status_code == 409:
                data = response.json()
                logger.info(f"Courier Uncle returned 409 (idempotent duplicate booking): {data.get('tracking_id')}")
                return data

            # Handle 429 Rate Limit
            if response.status_code == 429:
                retry_after = response.headers.get("Retry-After", "30")
                logger.warning(f"Courier Uncle rate limit exceeded. Retry after {retry_after}s")
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Courier service rate limit reached. Please retry in {retry_after} seconds."
                )

            # Handle specific client errors
            if response.status_code >= 400:
                try:
                    err_json = response.json()
                    detail_msg = (
                        err_json.get("error")
                        or err_json.get("message")
                        or err_json.get("detail")
                        or str(err_json)
                    )
                except Exception:
                    detail_msg = response.text or "Unknown Courier Uncle API error"

                logger.error(f"Courier Uncle API Error [{response.status_code}] on {endpoint}: {detail_msg}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Courier Uncle API Error: {detail_msg}"
                )

            return response.json()

        except httpx.TimeoutException:
            logger.error(f"Courier Uncle API request timed out on {endpoint}")
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail="Courier Uncle shipping gateway timed out. Please try again later."
            )
        except httpx.RequestError as exc:
            logger.error(f"Courier Uncle network error on {endpoint}: {exc}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Unable to connect to Courier Uncle shipping service: {str(exc)}"
            )

    # --- API ENDPOINTS ---

    async def get_account_index(self) -> Dict[str, Any]:
        """GET / - Verifies the key and returns mode and endpoint map."""
        return await self._request("GET", "/")

    async def get_wallet(self) -> Dict[str, Any]:
        """GET /wallet/ - Returns wallet balance, min balance required, and can_book flag."""
        return await self._request("GET", "/wallet/")

    async def get_couriers(self) -> Dict[str, Any]:
        """GET /couriers/ - Returns the list of enabled couriers and their services."""
        return await self._request("GET", "/couriers/")

    async def get_pickup_addresses(self) -> Dict[str, Any]:
        """GET /pickup-addresses/ - Returns saved pickup addresses."""
        return await self._request("GET", "/pickup-addresses/")

    async def lookup_pincode(self, pincode: str) -> Dict[str, Any]:
        """GET /pincode/{pincode}/ - Returns city, state for a six-digit pincode."""
        pincode_clean = pincode.strip()
        if not (len(pincode_clean) == 6 and pincode_clean.isdigit()):
            raise HTTPException(status_code=400, detail="Invalid Indian postal pincode. Must be 6 digits.")
        return await self._request("GET", f"/pincode/{pincode_clean}/")

    async def check_serviceability(
        self,
        origin: str,
        destination: str,
        payment_mode: str = "PREPAID"
    ) -> Dict[str, Any]:
        """GET /serviceability/?origin=&destination=&payment_mode="""
        origin_clean = origin.strip()
        dest_clean = destination.strip()
        mode_clean = payment_mode.upper() if payment_mode else "PREPAID"
        res = await self._request(
            "GET",
            "/serviceability/",
            params={"origin": origin_clean, "destination": dest_clean, "payment_mode": mode_clean}
        )
        # If sandbox account returns empty couriers (awaiting lane carrier activation), supply sandbox couriers
        if settings.is_courier_uncle_sandbox and (not res.get("couriers") or len(res.get("couriers", [])) == 0):
            mock = self._mock_response("serviceability", "GET", {"origin": origin_clean, "destination": dest_clean, "payment_mode": mode_clean}, None)
            mock["zone"] = res.get("zone", mock.get("zone", "B"))
            mock["zone_name"] = res.get("zone_name", mock.get("zone_name", "Within State"))
            return mock
        return res

    async def calculate_rates(
        self,
        origin_pincode: str,
        destination_pincode: str,
        weight_kg: float,
        length_cm: float,
        width_cm: float,
        height_cm: float,
        payment_mode: str = "PREPAID",
        cod_amount: float = 0.0
    ) -> Dict[str, Any]:
        """POST /rates/ - Compares every courier rate for the given parcel."""
        payload = {
            "origin_pincode": str(origin_pincode).strip(),
            "destination_pincode": str(destination_pincode).strip(),
            "weight_kg": round(float(weight_kg), 3),
            "length_cm": round(float(length_cm), 1),
            "width_cm": round(float(width_cm), 1),
            "height_cm": round(float(height_cm), 1),
            "payment_mode": payment_mode.upper(),
        }
        if payment_mode.upper() == "COD" and cod_amount > 0:
            payload["cod_amount"] = round(float(cod_amount), 2)

        res = await self._request("POST", "/rates/", json_data=payload)

        # In sandbox mode, if live carriers are awaiting commercial rate activation on this test account,
        # supply simulated sandbox quotes with the live zone calculation
        if settings.is_courier_uncle_sandbox and (not res.get("couriers") or len(res.get("couriers", [])) == 0):
            mock = self._mock_response("rates", "POST", None, payload)
            mock["zone"] = res.get("zone", mock.get("zone", "B"))
            mock["zone_name"] = res.get("zone_name", mock.get("zone_name", "Within State"))
            return mock

        return res

    async def create_shipment(self, shipment_data: Dict[str, Any]) -> Dict[str, Any]:
        """POST /shipments/ - Books a shipment with idempotent order_id."""
        try:
            return await self._request("POST", "/shipments/", json_data=shipment_data, expected_status=201)
        except HTTPException as exc:
            # If in sandbox mode and live carrier booking returns 503 no_courier_available or account error,
            # simulate sandbox booking response so the admin can test full lifecycle (labels, tracking, cancellations)
            if settings.is_courier_uncle_sandbox:
                logger.info(f"Courier Uncle sandbox: simulating booking response after {exc.detail}")
                return self._mock_response("shipments", "POST", None, shipment_data)
            raise

    async def get_shipment(self, tracking_id: str) -> Dict[str, Any]:
        """GET /shipments/{awb}/ - Retrieves shipment status, timeline and scans."""
        clean_id = tracking_id.strip()
        if clean_id.startswith("CU_SBX_"):
            return self._mock_response(f"shipments/{clean_id}", "GET", None, None)
        try:
            return await self._request("GET", f"/shipments/{clean_id}/")
        except HTTPException:
            if settings.is_courier_uncle_sandbox:
                return self._mock_response(f"shipments/{clean_id}", "GET", None, None)
            raise

    async def cancel_shipment(self, tracking_id: str, reason: str = "") -> Dict[str, Any]:
        """POST /shipments/{awb}/cancel/ - Cancels shipment before courier handover."""
        clean_id = tracking_id.strip()
        if clean_id.startswith("CU_SBX_"):
            return self._mock_response(f"shipments/{clean_id}/cancel", "POST", None, {"reason": reason})
        payload = {"reason": reason or "Cancelled by Merchant"}
        try:
            return await self._request("POST", f"/shipments/{clean_id}/cancel/", json_data=payload)
        except HTTPException:
            if settings.is_courier_uncle_sandbox:
                return self._mock_response(f"shipments/{clean_id}/cancel", "POST", None, {"reason": reason})
            raise

    async def get_label_pdf(self, tracking_id: str, size: str = "thermal_4x6") -> bytes:
        """GET /shipments/{awb}/label/?size=... - Returns binary PDF bytes."""
        clean_id = tracking_id.strip()
        if clean_id.startswith("CU_SBX_") or not self.api_key:
            return self._generate_mock_label_pdf(clean_id)

        client = await self.get_client()
        url = self._ensure_trailing_slash(f"/shipments/{clean_id}/label/")
        try:
            response = await client.get(url, params={"size": size}, headers=self._get_headers())
            if response.status_code >= 400:
                if settings.is_courier_uncle_sandbox:
                    return self._generate_mock_label_pdf(clean_id)
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Courier Uncle label generation failed: {response.text}"
                )
            return response.content
        except httpx.RequestError as exc:
            if settings.is_courier_uncle_sandbox:
                return self._generate_mock_label_pdf(clean_id)
            raise HTTPException(status_code=502, detail=f"Failed to fetch label: {str(exc)}")

    def verify_webhook_signature(self, raw_body: bytes, signature_header: Optional[str]) -> bool:
        """
        Verifies X-CU-Signature: sha256=... using HMAC-SHA256 with COURIER_UNCLE_WEBHOOK_SECRET.
        """
        if not self.webhook_secret:
            # If no secret configured, warn and return false in production
            logger.warning("COURIER_UNCLE_WEBHOOK_SECRET is not configured.")
            return False

        if not signature_header:
            return False

        sig = signature_header.strip()
        if sig.startswith("sha256="):
            sig = sig[len("sha256="):]

        expected = hmac.new(
            self.webhook_secret.encode("utf-8"),
            raw_body,
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(expected, sig)

    # --- DEVELOPMENT MOCK FALLBACK ---

    def _mock_response(
        self,
        endpoint: str,
        method: str,
        params: Optional[Dict[str, Any]],
        json_data: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        High-fidelity fallback simulating Courier Uncle API behavior in sandbox mode
        when live credentials are not yet configured.
        """
        clean_ep = endpoint.strip("/")

        if clean_ep == "" or clean_ep == "/":
            return {
                "name": "Courier Uncle Public API",
                "version": "v1",
                "mode": "sandbox",
                "merchant": "Vishwakarma Bat House",
                "endpoints": {},
                "docs": "https://courieruncle.com/api-docs"
            }

        if clean_ep == "wallet":
            return {
                "wallet_balance": 5000.0,
                "floor_balance": 250.0,
                "balance": 5000.0,
                "min_booking_balance": 250.0,
                "currency": "INR",
                "can_book": True
            }

        if clean_ep == "couriers":
            return {
                "couriers": [
                    {"code": "ekart", "name": "Ekart", "mode": "SURFACE", "services": [{"code": "SURFACE", "label": "Surface"}]},
                    {"code": "delhivery", "name": "Delhivery", "mode": "SURFACE_AIR", "services": [{"code": "SURFACE", "label": "Surface"}, {"code": "AIR", "label": "Air"}]},
                    {"code": "shadowfax", "name": "Shadowfax", "mode": "SURFACE", "services": [{"code": "SURFACE", "label": "Surface"}]},
                    {"code": "parcel_uncle", "name": "Parcel Uncle Express", "mode": "SURFACE", "services": [{"code": "NDD", "label": "Next Day Delivery"}]}
                ]
            }

        if clean_ep == "pickup-addresses":
            return {
                "addresses": [
                    {
                        "uid": "addr_vk_workshop_01",
                        "label": "VK Cricket Bat House Workshop",
                        "is_default": True,
                        "contact_name": "VK Master Craftsman",
                        "contact_phone": "9876543210",
                        "address_line_1": "Plot 42, Master Craftsman Lane, Cricket Cluster",
                        "address_line_2": "",
                        "city": "Gurgaon",
                        "state": "Haryana",
                        "pincode": settings.COURIER_UNCLE_DEFAULT_ORIGIN_PINCODE or "122001"
                    }
                ]
            }

        if clean_ep.startswith("pincode/"):
            parts = clean_ep.split("/")
            pincode = parts[1] if len(parts) > 1 else "110001"
            # Return known or synthetic city/state
            return {
                "pincode": pincode,
                "city": "Gurgaon" if pincode.startswith("122") else ("New Delhi" if pincode.startswith("110") else ("Mumbai" if pincode.startswith("400") else "Bengaluru")),
                "state": "Haryana" if pincode.startswith("122") else ("Delhi" if pincode.startswith("110") else ("Maharashtra" if pincode.startswith("400") else "Karnataka"))
            }

        if clean_ep.startswith("serviceability"):
            p = params or {}
            origin = p.get("origin", "122001")
            dest = p.get("destination", "400001")
            mode = p.get("payment_mode", "PREPAID")
            return {
                "origin": origin,
                "destination": dest,
                "zone": "C",
                "zone_name": "Metro to Metro",
                "payment_mode": mode,
                "serviceable": True,
                "couriers": [
                    {
                        "code": "ekart",
                        "name": "Ekart",
                        "estimated_days": 3,
                        "services": [{"code": "SURFACE", "label": "Surface", "estimated_days": 3}]
                    },
                    {
                        "code": "delhivery",
                        "name": "Delhivery",
                        "estimated_days": 2,
                        "services": [
                            {"code": "SURFACE", "label": "Surface", "estimated_days": 3},
                            {"code": "AIR", "label": "Express Air", "estimated_days": 2}
                        ]
                    },
                    {
                        "code": "parcel_uncle",
                        "name": "Parcel Uncle Express",
                        "estimated_days": 1,
                        "services": [{"code": "NDD", "label": "Next Day Delivery", "estimated_days": 1}]
                    }
                ]
            }

        if clean_ep == "rates":
            data = json_data or {}
            weight = float(data.get("weight_kg", 1.5))
            l = float(data.get("length_cm", 90))
            w = float(data.get("width_cm", 14))
            h = float(data.get("height_cm", 10))
            vol_weight = round((l * w * h) / 5000.0, 2)
            chargeable = max(weight, vol_weight)
            mode = data.get("payment_mode", "PREPAID")
            cod_val = float(data.get("cod_amount", 0.0))
            cod_fee = max(35.0, round(cod_val * 0.02, 2)) if mode == "COD" else 0.0

            # Calculate rates per courier
            couriers = [
                {
                    "courier_code": "ekart",
                    "courier_name": "Ekart Logistics",
                    "service": "SURFACE",
                    "service_label": "Surface Express",
                    "display_name": "Ekart Surface",
                    "zone": "C",
                    "freight": round(75.0 + (chargeable * 25.0), 2),
                    "cod_charge": cod_fee,
                    "gst_amount": round((75.0 + (chargeable * 25.0) + cod_fee) * 0.18, 2),
                    "total": round(75.0 + (chargeable * 25.0) + cod_fee, 2),
                    "total_with_gst": round((75.0 + (chargeable * 25.0) + cod_fee) * 1.18, 2),
                    "rto_charge": 75.0,
                    "estimated_days": 3,
                    "recommended": True
                },
                {
                    "courier_code": "delhivery",
                    "courier_name": "Delhivery Express",
                    "service": "AIR",
                    "service_label": "Priority Air",
                    "display_name": "Delhivery Priority Air",
                    "zone": "C",
                    "freight": round(140.0 + (chargeable * 45.0), 2),
                    "cod_charge": cod_fee,
                    "gst_amount": round((140.0 + (chargeable * 45.0) + cod_fee) * 0.18, 2),
                    "total": round(140.0 + (chargeable * 45.0) + cod_fee, 2),
                    "total_with_gst": round((140.0 + (chargeable * 45.0) + cod_fee) * 1.18, 2),
                    "rto_charge": 120.0,
                    "estimated_days": 2,
                    "recommended": False
                },
                {
                    "courier_code": "shadowfax",
                    "courier_name": "Shadowfax",
                    "service": "SURFACE",
                    "service_label": "Standard Surface",
                    "display_name": "Shadowfax Standard",
                    "zone": "C",
                    "freight": round(68.0 + (chargeable * 22.0), 2),
                    "cod_charge": cod_fee,
                    "gst_amount": round((68.0 + (chargeable * 22.0) + cod_fee) * 0.18, 2),
                    "total": round(68.0 + (chargeable * 22.0) + cod_fee, 2),
                    "total_with_gst": round((68.0 + (chargeable * 22.0) + cod_fee) * 1.18, 2),
                    "rto_charge": 68.0,
                    "estimated_days": 4,
                    "recommended": False
                }
            ]

            return {
                "origin_pincode": data.get("origin_pincode", "122001"),
                "destination_pincode": data.get("destination_pincode", "400001"),
                "zone": "C",
                "zone_name": "Metro to Metro",
                "payment_mode": mode,
                "chargeable_weight_kg": chargeable,
                "volumetric_weight_kg": vol_weight,
                "gst_percent": 18.0,
                "couriers": couriers
            }

        if clean_ep == "shipments":
            data = json_data or {}
            import uuid
            awb_mock = f"CUTEST{uuid.uuid4().hex[:8].upper()}"
            courier = data.get("courier_code") or "ekart"
            return {
                "sandbox": True,
                "message": "Sandbox booking simulated — no shipment created, no wallet debit",
                "tracking_id": awb_mock,
                "order_id": data.get("order_id", "VK-ORDER"),
                "courier": courier.capitalize(),
                "courier_code": courier,
                "courier_service": data.get("courier_service", "SURFACE"),
                "courier_awb": f"LEKP{uuid.uuid4().hex[:10].upper()}",
                "tracking_url": f"https://courieruncle.com/track?id={awb_mock}",
                "label_url": f"https://app.courieruncle.com/api/ext/v1/shipments/{awb_mock}/label/",
                "shipping_charge": 115.0,
                "zone": "C",
                "chargeable_weight_kg": float(data.get("weight_kg", 1.5)),
                "status": "CREATED"
            }

        if clean_ep.startswith("shipments/") and clean_ep.endswith("/cancel"):
            parts = clean_ep.split("/")
            tracking_id = parts[1]
            return {
                "message": "Shipment cancelled",
                "tracking_id": tracking_id,
                "refunded": 115.0,
                "courier_cancelled": True,
                "courier_error": None
            }

        if clean_ep.startswith("shipments/"):
            parts = clean_ep.split("/")
            tracking_id = parts[1]
            from datetime import datetime, timezone
            now_iso = datetime.now(timezone.utc).isoformat()
            return {
                "tracking_id": tracking_id,
                "order_id": "VK-ORDER",
                "status": "CREATED",
                "courier": "Ekart",
                "courier_code": "ekart",
                "courier_service": "SURFACE",
                "courier_awb": f"LEKP{tracking_id}",
                "tracking_url": f"https://courieruncle.com/track?id={tracking_id}",
                "label_url": f"https://app.courieruncle.com/api/ext/v1/shipments/{tracking_id}/label/",
                "zone": "C",
                "payment_mode": "PREPAID",
                "cod_amount": 0.0,
                "shipping_charge": 115.0,
                "created_at": now_iso,
                "delivered_at": None,
                "timeline": [
                    {"status": "CREATED", "notes": "Shipment booked via Courier Uncle", "location": "VK Workshop", "timestamp": now_iso}
                ],
                "scans": [
                    {"at": now_iso, "status": "Manifested", "description": "Shipping label generated", "location": "VK Workshop"}
                ]
            }

        return {"status": "ok", "endpoint": endpoint}

    def _generate_mock_label_pdf(self, tracking_id: str) -> bytes:
        """Generates a minimal valid PDF payload for sandbox label previews."""
        pdf_content = (
            b"%PDF-1.4\n"
            b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
            b"3 0 obj<</Type/Page/MediaBox[0 0 288 432]/Parent 2 0 R/Resources<<>>>>endobj\n"
            b"xref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\n"
            b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF\n"
        )
        return pdf_content

# Export global client instance
courier_uncle_client = CourierUncleClient()
