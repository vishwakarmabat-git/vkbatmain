# Courier Uncle Shipping & Logistics Integration Guide
## Vishwakarma Bat House — Handcrafted Cricket Bats E-Commerce

---

### 1. Architectural Overview

This document provides complete technical documentation for the Courier Uncle Shipping & Logistics API integration into the **Vishwakarma Bat House** platform.

```
                      +---------------------------------------+
                      |       Customer Checkout Page          |
                      |  - 6-digit Pincode Auto-Lookup        |
                      |  - Route Serviceability Verification  |
                      |  - Multi-Courier Comparison Quotes    |
                      +-------------------+-------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |    FastAPI Shipping Router (/api/v1)   |
                      |  - Pincode Serviceability & Cache     |
                      |  - Cricket Bat Volumetric Calculator  |
                      |  - Server-Authoritative Totals        |
                      +-------------------+-------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------+
|                      Centralized Courier Uncle Client                       |
|   (app/services/courier_uncle.py & app/services/shipping_service.py)        |
|  - Persistent HTTPX Async Connection Pool                                   |
|  - Strictly Enforces Trailing Slashes (`/rates/`, `/shipments/`)            |
|  - `X-API-Key` Authentication & Timeout Handling                            |
|  - Idempotent 409 Conflict Duplicate Resolution                             |
|  - Automatic Retry & 429 Rate-Limit Exponential Backoff                     |
+-----------------------------------------------------------------------------+
               |                                            |
               v                                            v
+-----------------------------+             +-------------------------------+
|   Courier Uncle Live API    |             |    PostgreSQL / MySQL / DB    |
|  - Rate Engine & Quotes     |             |  - `shipments` Table          |
|  - Consignment Dispatch     |             |  - `products` Packaging Specs |
|  - Webhook Events           |             |  - Activity Logs & Audit      |
+-----------------------------+             +-------------------------------+
               |
               v
+-----------------------------------------------------------------------------+
|               Admin Shipping Console & Customer Tracking Portal             |
|  - Dispatch Booking Modal with Cricket Bat Dimension Tuner                  |
|  - Thermal 4x6 / A4 Shipping Label PDF Proxy Generator                     |
|  - In-Transit Status Sync & IDOR-Protected Customer Order Tracking          |
|  - HMAC-SHA256 Signed Webhook Ingestion Engine (`/api/v1/webhooks/courier-uncle`)|
+-----------------------------------------------------------------------------+
```

---

### 2. Environment Variables & Secure Configuration

Credentials and environment variables must be stored exclusively on the server in `.env` (never exposed to React or public frontend bundles).

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `COURIER_UNCLE_API_KEY` | String | `""` | Private API key generated from Courier Uncle Merchant Dashboard. |
| `COURIER_UNCLE_BASE_URL` | String | `https://app.courieruncle.com/api/ext/v1` | Official base URL for external API endpoints. |
| `COURIER_UNCLE_ENVIRONMENT` | String | `sandbox` | `sandbox` (for test simulation) or `production` (for live shipments). |
| `COURIER_UNCLE_WEBHOOK_SECRET` | String | `""` | Secret key used to verify incoming `X-CU-Signature` HMAC-SHA256 headers. |
| `COURIER_UNCLE_DEFAULT_ORIGIN_PINCODE` | String | `122001` | Default pickup warehouse postal pincode (Gurgaon, Haryana Workshop). |
| `COURIER_UNCLE_AUTO_BOOK` | Boolean | `false` | Explicit flag: `false` requires admin manual review before dispatching. |

#### Backend Setup in `.env`:
```env
# Courier Uncle Logistics Integration
COURIER_UNCLE_API_KEY=your_sandbox_or_live_api_key_here
COURIER_UNCLE_BASE_URL=https://app.courieruncle.com/api/ext/v1
COURIER_UNCLE_ENVIRONMENT=sandbox
COURIER_UNCLE_WEBHOOK_SECRET=your_webhook_hmac_secret_here
COURIER_UNCLE_DEFAULT_ORIGIN_PINCODE=122001
COURIER_UNCLE_AUTO_BOOK=false
```

---

### 3. Courier Uncle API Contracts & Verified Endpoints

Per official Courier Uncle documentation (`https://www.courieruncle.com/api-docs`), **every endpoint strictly requires a trailing slash (`/`)**. Omitting the trailing slash causes a 301/302 redirect that strips the POST JSON request body.

| Operation | Method | Endpoint | Required Headers | Description |
| :--- | :--- | :--- | :--- | :--- |
| Verify Account & Key | `GET` | `/` | `X-API-Key` | Validates API key, account name, active tier, and endpoint directory. |
| Check Wallet Balance | `GET` | `/wallet/` | `X-API-Key` | Returns `wallet_balance`, `floor_balance`, currency, and `can_book` flag. |
| Enabled Couriers | `GET` | `/couriers/` | `X-API-Key` | Lists active courier partners (Ekart, Delhivery, DTDC, Bluedart, Shadowfax). |
| Pickup Addresses | `GET` | `/pickup-addresses/` | `X-API-Key` | Retrieves merchant registered pickup hub locations. |
| Pincode Lookup | `GET` | `/pincode/{pincode}/` | `X-API-Key` | Returns `city` and `state` for a 6-digit Indian PIN. |
| Route Serviceability | `GET` | `/serviceability/?origin=&destination=&payment_mode=` | `X-API-Key` | Verifies whether the route is serviceable, along with COD/Prepaid eligibility. |
| Calculate Shipping Rates | `POST` | `/rates/` | `X-API-Key`, `Content-Type: application/json` | Computes volumetric & dead weight rates across all eligible couriers. |
| Book Shipment | `POST` | `/shipments/` | `X-API-Key`, `Content-Type: application/json` | Manifests shipment with selected courier, reserves AWB, debits wallet. |
| Shipment Status & Scans | `GET` | `/shipments/{tracking_id}/` | `X-API-Key` | Fetches live tracking milestones, hub scans, and current status. |
| Download Label PDF | `GET` | `/shipments/{tracking_id}/label/?size=thermal_4x6` | `X-API-Key` | Streams thermal 4x6 or A4 PDF label binary stream. |
| Cancel Shipment | `POST` | `/shipments/{tracking_id}/cancel/` | `X-API-Key`, `Content-Type: application/json` | Cancels shipment before carrier handover and triggers wallet credit. |

---

### 4. Cricket Bat Shipping & Master Packaging Strategy

Handcrafted cricket bats have unique physical dimensions. While a typical senior bat weighs **1.15 kg – 1.25 kg**, its packaged box measures **~90 cm (length) × 14 cm (width) × 10 cm (height)**.

#### Volumetric Weight Formula:
$$\text{Volumetric Weight (kg)} = \frac{\text{Length (cm)} \times \text{Width (cm)} \times \text{Height (cm)}}{5000}$$

$$\text{Single Bat Volumetric Weight} = \frac{90 \times 14 \times 10}{5000} = \frac{12,600}{5000} = 2.52\text{ kg}$$

#### Packaging Rules Implemented:
1. **Dead Weight vs. Volumetric Weight**: The courier charges based on $\max(\text{Dead Weight}, \text{Volumetric Weight})$. For cricket bats, the volumetric weight is almost always higher than dead weight ($2.52\text{ kg} > 1.35\text{ kg}$).
2. **Multi-Item Master Carton Packaging**:
   - Single Bat: $90 \times 14 \times 10\text{ cm}$, Volumetric: $2.52\text{ kg}$.
   - 2 Bats: $90 \times 28 \times 10\text{ cm}$, Volumetric: $5.04\text{ kg}$.
   - 3–4 Bats: $90 \times 32 \times 12\text{ cm}$, Volumetric: $6.91\text{ kg}$.
   - Multi-bat boxes are packed side-by-side in custom workshop cartons to avoid volumetric overcharges.
3. **Database Specifications**:
   - Added `package_weight_kg`, `package_length_cm`, `package_width_cm`, `package_height_cm`, `shipping_category`, and `packaging_type` to the `products` table so each bat model has configurable dimensions.

---

### 5. Application Routes Implemented

#### Customer-Facing API Routes:
- `GET /api/v1/shipping/pincode/{pincode}`: Instant postal pincode city/state lookup with in-memory TTL caching.
- `POST /api/v1/shipping/serviceability`: Validates delivery route and COD availability.
- `POST /api/v1/shipping/rates`: Calculates authoritative multi-carrier quotes for the cart.
- `GET /api/v1/orders/{order_id}/tracking`: IDOR-protected tracking route for authenticated customers.
- `GET /api/v1/track/{tracking_id}`: Public parcel tracking route by AWB without leaking customer PII.

#### Admin API Routes:
- `GET /api/v1/admin/shipments`: Filtered list of all shipments (with pagination, status pills, courier filter, and search).
- `GET /api/v1/admin/shipments/{shipment_id}`: Detailed shipment record with raw API response and scans.
- `POST /api/v1/admin/orders/{order_id}/book-shipment`: Books shipment for an order with duplicate-booking protection.
- `POST /api/v1/admin/shipments/{shipment_id}/cancel`: Cancels shipment before carrier handover.
- `GET /api/v1/admin/shipments/{shipment_id}/label?size=thermal_4x6`: Proxied PDF label download.
- `GET /api/v1/admin/shipping/wallet`: Returns real-time wallet balance and dispatch capability.

#### Webhook Route:
- `POST /api/v1/webhooks/courier-uncle`: Ingests tracking status updates with HMAC-SHA256 signature verification.

---

### 6. Database Schema & Migration

Database migration `e7f1b2c3d4e5` was applied via Alembic:

```sql
-- Shipments Table
CREATE TABLE shipments (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider VARCHAR(50) DEFAULT 'courier_uncle' NOT NULL,
    provider_order_id VARCHAR(100),
    tracking_id VARCHAR(100) UNIQUE NOT NULL,
    courier_name VARCHAR(100) NOT NULL,
    courier_code VARCHAR(50) NOT NULL,
    courier_service VARCHAR(50) DEFAULT 'SURFACE' NOT NULL,
    courier_awb VARCHAR(100),
    tracking_url VARCHAR(500),
    label_url VARCHAR(500),
    shipping_charge NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    payment_mode VARCHAR(20) DEFAULT 'PREPAID' NOT NULL,
    cod_amount NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    zone VARCHAR(10),
    chargeable_weight_kg FLOAT DEFAULT 1.5 NOT NULL,
    package_length_cm FLOAT DEFAULT 90.0 NOT NULL,
    package_width_cm FLOAT DEFAULT 14.0 NOT NULL,
    package_height_cm FLOAT DEFAULT 10.0 NOT NULL,
    shipment_status VARCHAR(50) DEFAULT 'CREATED' NOT NULL,
    booked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    picked_up_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancel_reason TEXT,
    timeline_data JSON,
    scans_data JSON,
    raw_response JSON,
    is_sandbox BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indices for Fast Querying
CREATE INDEX ix_shipments_order_id ON shipments(order_id);
CREATE INDEX ix_shipments_tracking_id ON shipments(tracking_id);
CREATE INDEX ix_shipments_shipment_status ON shipments(shipment_status);

-- Product Table Additions
ALTER TABLE products ADD COLUMN package_weight_kg FLOAT DEFAULT 1.5 NOT NULL;
ALTER TABLE products ADD COLUMN package_length_cm FLOAT DEFAULT 90.0 NOT NULL;
ALTER TABLE products ADD COLUMN package_width_cm FLOAT DEFAULT 14.0 NOT NULL;
ALTER TABLE products ADD COLUMN package_height_cm FLOAT DEFAULT 10.0 NOT NULL;
ALTER TABLE products ADD COLUMN shipping_category VARCHAR(50) DEFAULT 'cricket_bat' NOT NULL;
ALTER TABLE products ADD COLUMN packaging_type VARCHAR(50) DEFAULT 'heavy_duty_box' NOT NULL;
```

---

### 7. Webhook Configuration & Security

1. In the Courier Uncle Merchant Dashboard:
   - Go to **Settings > Webhooks**.
   - Set **Webhook URL**: `https://your-domain.com/api/v1/webhooks/courier-uncle`
   - Copy the Webhook Secret into your backend `.env`:
     ```env
     COURIER_UNCLE_WEBHOOK_SECRET=cu_sec_99a8b7c6d5e4f3a2b1
     ```
2. **Signature Verification**:
   - Header: `X-CU-Signature: sha256={hmac_digest}`
   - The backend computes the HMAC-SHA256 hash of the raw HTTP request body against `COURIER_UNCLE_WEBHOOK_SECRET` and verifies it using constant-time comparison (`hmac.compare_digest`).
   - Unauthenticated or forged webhooks are rejected with `401 Unauthorized`.
3. **Idempotent Handling**:
   - If an event with the same status was already recorded, it updates timeline scans without duplicate processing.

---

### 8. Testing in Sandbox Mode

The integration includes a built-in sandbox mock engine when `COURIER_UNCLE_API_KEY` is empty or when `COURIER_UNCLE_ENVIRONMENT=sandbox`.

#### Run Automated Test Suite:
```bash
# Backend pytest tests (20/20 passing)
cd backend
venv\Scripts\pytest tests/test_shipping_courier_uncle.py tests/test_api.py -v

# Frontend type check & production build (0 errors)
cd ../frontend
npm run build
```

#### Step-by-Step Sandbox Walkthrough in Browser:
1. **Pincode Lookup & Rates in Checkout**:
   - Add a cricket bat to cart.
   - Proceed to Checkout (`/checkout`).
   - Enter `400001` (Mumbai) or `110001` (Delhi) in the PIN Code field.
   - City and State auto-fill, and live courier quotes (Ekart Surface, Delhivery Air, Bluedart Express) render with dynamic delivery estimates.
   - Select a courier; the order summary updates with the authoritative shipping charge.
2. **Order Placement**:
   - Place the order (Prepaid or COD).
3. **Admin Dispatch Console**:
   - Log in as Admin and navigate to **Shipping & Logistics** (`/admin/shipments`).
   - View KPI metric cards and Courier Uncle wallet balance.
   - Click **Dispatch New Order** or open an order in `/admin/orders/:id`.
   - Click **Dispatch via Courier Uncle** to open the booking modal with cricket bat dimensions.
   - Confirm booking: AWB is generated, order status transitions to `shipped`, and duplicate dispatch protection is enforced.
4. **Thermal Label Download**:
   - In `/admin/shipments`, click the **Download** button on the booked shipment. A valid thermal PDF label streams directly to your browser.
5. **Customer Tracking**:
   - Visit `/orders` and click **Track** to view the live timeline modal.
   - Or open `/track` and search for any AWB consignment number to verify public tracking.

---

### 9. Production Activation Checklist

When ready to switch to live production dispatching:

- [ ] Sign in to Courier Uncle Merchant Portal at `https://app.courieruncle.com`.
- [ ] Ensure KYC verification is completed.
- [ ] Recharge your Courier Uncle prepaid wallet (minimum recommended: ₹2,000).
- [ ] Go to **Developer > API Keys** and generate a production `X-API-Key`.
- [ ] In production server `.env`, update:
  ```env
  COURIER_UNCLE_API_KEY=live_cu_key_...
  COURIER_UNCLE_ENVIRONMENT=production
  COURIER_UNCLE_BASE_URL=https://app.courieruncle.com/api/ext/v1
  COURIER_UNCLE_WEBHOOK_SECRET=your_live_webhook_secret
  COURIER_UNCLE_DEFAULT_ORIGIN_PINCODE=122001
  ```
- [ ] Verify registered warehouse pickup address matches `COURIER_UNCLE_DEFAULT_ORIGIN_PINCODE`.
- [ ] Run a test dispatch on a staging order to verify courier pickup allocation.
