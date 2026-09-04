# 🏏 Vishwakarma Bat House — E-Commerce Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791.svg?style=flat&logo=postgresql)](https://supabase.com)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB.svg?style=flat&logo=python)](https://www.python.org/)

---

## 1. Project Overview

**Vishwakarma Bat House** is a production-grade, full-stack e-commerce platform engineered specifically for bespoke, handcrafted Grade 1+ Kashmir Willow cricket bats. It solves the fragmentation of custom sports equipment commerce by combining an ultra-fast catalog with precision bat specification configuration, atomic inventory management, automated Razorpay payment verification, and a live dynamic CMS admin portal.

---

## 2. Features

### 🛒 Customer Storefront
- **Dynamic 3-Second Hero Carousel**: Auto-rotating hero slider with ambient golden lighting, dynamic headline highlighting, and direct device upload management.
- **Mastercraft Bat Catalog**: Complete filterable catalog by pressing type, willow grade, blade architecture, and price brackets.
- **Product Details & Technical Matrix**: Detailed dimensional specifications (edges, spine, sweet spot, cane matrix, grain count, toe profile) with customer reviews and match ratings.
- **Seamless 1-Click Purchasing**: Instant `ADD TO CART` drawer integration and direct `BUY NOW` checkout flow.
- **Discount Engine**: Real-time coupon validation with minimum cart value and usage threshold enforcement.
- **Payment Processing**: Integrated Razorpay modal (100% exact bat pricing without hidden fees) and Cash on Delivery (COD) workflows with HMAC-SHA256 signature verification.
- **Order Tracking & Management**: Unique cryptographic order tracking numbers (`VK-YYYYMMDD-XXXXX`) with live progress statuses.
- **Authentication**: Email/password authentication, Google OAuth 2.0 One-Click Login, and customer profile/address book.
- **Workshop Gallery Showcase**: High-resolution gallery displaying artisan bat pressing, carving, and binding.

### 🛡️ Admin Management Console
- **Analytics & Revenue Dashboard**: Real-time revenue summaries, order status breakdowns, 7-day sales charts, and low-stock alerts.
- **Bat Catalog Management**: Complete CRUD operations for cricket bats, images, editions, and technical specifications.
- **Inventory & Stock Audit**: Live stock adjustments (`set`, `add`, `subtract`) with automated audit log history.
- **Order Processing Workflow**: Full lifecycle tracking (`pending` → `confirmed` → `processing` → `shipped` → `delivered` / `cancelled`).
- **Promotional Coupon Management**: Create percentage-based or flat discount codes with customizable expiration and usage limits.
- **Customer Security & Access Control**: Customer directory with 1-click account blocking/unblocking for spam prevention.
- **Dynamic CMS & Banners Slider**: Complete device file upload capabilities for hero carousel slides, testimonials, and FAQs with PostgreSQL persistence.
- **Zero Horizontal Scrolling Mobile UI**: Responsive card-stack layouts tailored for smartphone administrative usage without breaking desktop data tables.

---

## 3. Tech Stack

| Layer | Technology | Role & Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19 & TypeScript** | Component-driven UI architecture with static type safety and concurrent rendering. |
| **Styling & Design System**| **Tailwind CSS v4 & Vanilla CSS** | Custom obsidian/gold theme tokens, Harrison Rough + Work Sans typography pairings. |
| **State Management** | **Zustand & Persist** | Lightweight reactive state for authentication tokens, shopping cart, and wishlist. |
| **Server State & Cache** | **TanStack Query (React Query)** | Client-side caching, background fetching, and mutation invalidation. |
| **HTTP Client** | **Axios** | Centralized API client with JWT bearer interceptors and automated 401 token cleanup. |
| **Backend Framework** | **FastAPI (Python 3.11)** | High-throughput asynchronous REST API gateway with automatic OpenAPI documentation. |
| **ORM & Database Engine**| **SQLAlchemy 2.0 & Alembic** | Parameterized relational modeling, relationship joins, and schema migrations. |
| **Database** | **Supabase PostgreSQL** | Cloud PostgreSQL instance with connection pooling on AWS Mumbai region. |
| **Security & Auth** | **Bcrypt & Python-Jose (JWT)** | Safe 72-byte password hashing and stateless HS256 authentication tokens. |
| **Payments** | **Razorpay Python SDK & JS Modal** | Server-side verified order creation and cryptographic webhook signature validation. |

---

## 4. System Architecture

```mermaid
graph TD
    Client["📱 Web & Mobile Client (React 19 + TypeScript)"]
    
    subgraph FastAPI Gateway
        Middleware["🛡️ Security Middleware\n(Rate Limiter, Security Headers, CORS, Error Shield)"]
        AuthModule["🔐 Auth & RBAC Guard\n(JWT Decoder, get_current_active_admin)"]
        APIRouters["⚡ API v1 Routers\n(/products, /orders, /payments, /cms, /admin)"]
    end
    
    subgraph Services Layer
        OrderService["📦 Order & Calculation Service"]
        ProductService["🏏 Product & Stock Service"]
        PaymentService["💳 Razorpay Signature Service"]
        CMSService["🖼️ CMS & Upload Service"]
    end
    
    subgraph Storage & External
        Postgres[("🐘 Supabase PostgreSQL\n(Orders, Products, Users, CMS)")]
        DiskStorage["📁 Uploads Directory / Media Storage"]
        RazorpayGateway["💳 Razorpay Payment Gateway API"]
    end

    Client -->|HTTPS / JSON| Middleware
    Middleware --> AuthModule
    AuthModule --> APIRouters
    APIRouters --> ServicesLayer
    
    OrderService --> Postgres
    ProductService --> Postgres
    CMSService --> Postgres
    CMSService --> DiskStorage
    PaymentService --> RazorpayGateway
```

---

## 5. Project Structure

```text
vkbathouse/
├── backend/
│   ├── app/
│   │   ├── api/v1/             # REST API Endpoint Routers
│   │   │   ├── admin.py        # Admin operations & user management
│   │   │   ├── auth.py         # Customer registration, login & profile
│   │   │   ├── categories.py   # Blade editions and series CRUD
│   │   │   ├── cms.py          # Banners, FAQs, Testimonials, Gallery
│   │   │   ├── coupons.py      # Promo coupon validation & management
│   │   │   ├── orders.py       # Customer orders & tracking
│   │   │   ├── payments.py     # Razorpay order generation & signature verify
│   │   │   ├── products.py     # Cricket bat catalog & specifications
│   │   │   ├── reviews.py      # Product review moderation
│   │   │   ├── settings.py     # Storefront configuration & financial defaults
│   │   │   └── upload.py       # Validated device image upload handler
│   │   ├── core/               # Configuration, Database Engine, Security & Middleware
│   │   │   ├── config.py       # Pydantic Settings & environment loader
│   │   │   ├── database.py     # SQLAlchemy session factory & connection pool
│   │   │   ├── middleware.py   # Security headers, rate limiting & error handling
│   │   │   └── security.py     # Bcrypt hashing & JWT token encoding
│   │   ├── dependencies/       # FastAPI dependency injection (Auth & Admin guards)
│   │   ├── models/             # SQLAlchemy ORM Database Models
│   │   ├── schemas/            # Pydantic V2 Request/Response Validation Schemas
│   │   ├── services/           # Core business logic & financial calculation services
│   │   ├── utils/              # Decimal-accurate pricing & GST calculators
│   │   └── main.py             # FastAPI application entrypoint & static mount
│   ├── tests/                  # Automated pytest security & unit test suites
│   ├── requirements.txt        # Python dependency manifest
│   └── .env.example            # Backend environment template
│
├── frontend/
│   ├── src/
│   │   ├── api/                # Centralized Axios client & request interceptors
│   │   ├── components/         # Modular React UI Components
│   │   │   ├── common/         # Navbar, Footer, MapWidget, ErrorBoundary, Upload
│   │   │   ├── home/           # HeroCarousel, CategoryGrid, CollectionSections
│   │   │   ├── layout/         # AdminLayout, AdminSidebar, CustomerLayout
│   │   │   ├── products/       # BatCard, ProductGrid, FilterDrawers
│   │   │   └── ui/             # Buttons, Modals, Badges, Form Inputs
│   │   ├── pages/              # Storefront & Admin Portal Pages
│   │   │   ├── admin/          # Products, Orders, Inventory, CMS, Coupons, Users
│   │   │   ├── Cart/           # Full-page shopping cart
│   │   │   ├── Checkout/       # Single-step checkout & payment processing
│   │   │   ├── Gallery/        # Workshop craftsmanship showcase
│   │   │   ├── Home/           # Dynamic home storefront
│   │   │   ├── Login/          # Customer & Admin login with Google OAuth
│   │   │   └── ProductDetails/ # Detailed bat profile & reviews
│   │   ├── routes/             # App routing table with route protection guards
│   │   ├── store/              # Zustand state stores (auth, cart, wishlist)
│   │   ├── types/              # TypeScript interfaces & domain models
│   │   ├── utils/              # Image path resolvers & currency formatters
│   │   ├── App.tsx             # Root React tree with ErrorBoundary & QueryClient
│   │   ├── index.css           # Design tokens, theme styling, and animations
│   │   └── main.tsx            # Vite DOM mount point
│   ├── index.html              # HTML shell, SEO tags, Work Sans typography links
│   ├── package.json            # Node.js dependencies & build scripts
│   └── vite.config.ts          # Vite build config with path aliases
└── README.md                   # Complete architectural documentation
```

---

## 6. Installation & Setup

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Python**: `3.10` or higher
- **PostgreSQL Database**: Supabase cloud instance or local PostgreSQL server

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/vkbathouse.git
cd vkbathouse
```

### Step 2: Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables by creating `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:your-db-password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
   JWT_SECRET_KEY="your-secure-random-jwt-secret-key"
   JWT_ALGORITHM="HS256"
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   GST_PERCENTAGE=0.0
   DEFAULT_SHIPPING_FEE=0.0
   WHATSAPP_NUMBER="919274543199"
   RAZORPAY_KEY_ID="rzp_live_your_key_id"
   RAZORPAY_KEY_SECRET="your_razorpay_secret"
   CORS_ORIGINS="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
   ```
5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

### Step 3: Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 7. Usage & Workflow

### 🏏 Customer Purchase Flow
1. **Browse Bats**: Explore the storefront at `/products` or browse blade editions (`Single Blade`, `Double Blade`, `Triple X2`).
2. **Inspect Specifications**: View spine heights, edge thickness, grain counts, and willow grading on `/products/:slug`.
3. **Cart & Bag**: Click `ADD TO CART` to trigger the interactive sliding bag drawer or `BUY NOW` to enter the checkout flow.
4. **Apply Coupon**: Enter promotional coupon codes (e.g. `VK10`) for instant subtotal deductions.
5. **Secure Payment**: Complete purchase with Razorpay Modal (UPI, Cards, NetBanking) or choose Cash on Delivery (COD).
6. **Order Receipt**: Receive an instant confirmation order number and live status tracker.

### 🛡️ Administrator Operations
1. **Access Admin Portal**: Navigate to `/admin/login` and log in with admin credentials.
2. **Catalog Updates**: Add new bat releases, upload photos directly from local device storage, and customize pricing.
3. **Stock Control**: Adjust inventory balances instantly on `/admin/inventory`.
4. **Fulfillment**: Mark customer orders as `Processing`, `Shipped`, or `Delivered` on `/admin/orders`.
5. **CMS Customization**: Update the 3-second Hero carousel slides on `/admin/banners` with direct device uploads.

---

## 8. API Documentation

FastAPI provides interactive Swagger documentation automatically at `http://127.0.0.1:8000/docs`.

### Primary API Endpoints Matrix

| HTTP Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/register` | Register new customer account | No |
| `POST` | `/api/v1/auth/login` | Authenticate customer or admin user | No |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Bearer Token |
| `GET` | `/api/v1/products` | Retrieve filterable cricket bat catalog | No |
| `GET` | `/api/v1/products/slug/{slug}` | Get bat details by URL slug | No |
| `POST` | `/api/v1/products` | Create new cricket bat entry | Admin Only |
| `DELETE`| `/api/v1/products/{id}` | Permanently delete cricket bat | Admin Only |
| `POST` | `/api/v1/orders` | Place new customer order | Optional Token |
| `GET` | `/api/v1/orders/my-orders` | Fetch authenticated user's order history | Bearer Token |
| `GET` | `/api/v1/orders/{order_id}` | Retrieve order details (IDOR Protected) | Owner / Admin |
| `POST` | `/api/v1/payments/verify` | Verify Razorpay HMAC-SHA256 signature | No |
| `POST` | `/api/v1/coupons/validate` | Validate promo coupon against cart subtotal | No |
| `POST` | `/api/v1/upload` | Validated device image upload (10MB limit) | Admin Only |
| `GET` | `/api/v1/admin/dashboard` | Fetch store financial statistics & charts | Admin Only |
| `POST` | `/api/v1/admin/inventory/adjust` | Adjust product stock quantity | Admin Only |

---

## 9. Engineering Decisions & Trade-offs

1. **Authoritative Server-Side Pricing**:
   - *Decision*: The client payload during checkout (`POST /orders`) never dictates prices or taxes. The backend re-fetches each product directly from PostgreSQL, calculating subtotals, discounts, and totals independently to eliminate price tampering vulnerabilities.
2. **Stateless JWT Tokens with Database Account Status Verification**:
   - *Decision*: JWT tokens encode the user ID (`sub`) and role (`role`). The `get_current_user` dependency verifies that the user remains active in PostgreSQL on every protected request, allowing immediate blocking of compromised accounts.
3. **Database TEXT Storage for Direct Device Uploads**:
   - *Decision*: Altered image columns in PostgreSQL to `TEXT` rather than limited `VARCHAR` strings, enabling direct device image uploads, local file storage, and base64 fallbacks without database truncation errors.
4. **Adaptive Mobile Responsive Admin Views**:
   - *Decision*: Converted wide desktop tables into lightweight, mobile-first card stacks on small screens (`md:hidden`), completely eliminating horizontal scrolling on phones while preserving the dense data grid for laptop users (`hidden md:block`).
5. **Multi-Layer Defensive Security Middleware**:
   - *Decision*: Built customized FastAPI middlewares for HTTP security headers (`nosniff`, `SAMEORIGIN`, `strict-origin`), sliding-window rate limiting on authentication routes (15 req/min), and global exception shielding to prevent database tracebacks from reaching clients.

---

## 10. Testing & Quality Assurance

### Automated Security & Functional Tests
The backend includes an automated test suite executed with `pytest`:

```bash
# Run backend test suite from root
python -m pytest backend/tests/test_security_audit.py -v
```

**Tested Scenarios**:
- ✅ Security headers verification (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`).
- ✅ 401 Unauthorized enforcement on unauthenticated admin routes.
- ✅ 403 Forbidden enforcement on customer access to administrative endpoints.
- ✅ Insecure file upload rejection for executable and script extensions (`.exe`, `.py`).
- ✅ Rate limiting triggers HTTP 429 upon rapid brute-force authentication attempts.
- ✅ Health check operational availability (`GET /api/v1/health`).

### Frontend Production Compilation
```bash
cd frontend
npm run build
```
- ✅ 0 TypeScript errors.
- ✅ Clean Vite production rollup bundle.

---

## 11. Limitations & Future Roadmap

- **Automated PDF Invoices**: Implement automated transactional PDF invoice generation attached to confirmation emails via SMTP.
- **WhatsApp Webhook Sync**: Connect live WhatsApp Business Webhooks to dispatch real-time shipping tracking alerts directly to the customer's phone number.
- **Distributed Redis Rate Limiter**: Upgrade in-memory sliding window rate limiting to distributed Redis cache when deploying across multi-region server clusters.

---

## 12. License & Author

Crafted for **Vishwakarma Bat House**, Chaklasi, Gujarat, India.  
*Samurai-Precision Handcrafted Cricket Bats Since 2003.*
