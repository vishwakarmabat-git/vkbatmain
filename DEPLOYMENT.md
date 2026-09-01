# 🚀 Production Deployment Guide — Vishwakarma Bat House

This guide details the complete, step-by-step instructions for deploying the **Vishwakarma Bat House** full-stack cricket bat e-commerce application to production.

```text
                    ┌─────────────────────────┐
                    │     VERCEL (Frontend)   │
                    │   React 19 + TypeScript │
                    └────────────┬────────────┘
                                 │
                                 │ HTTPS (REST API)
                                 ▼
                    ┌─────────────────────────┐
                    │     RENDER (Backend)    │
                    │   FastAPI + Docker      │
                    └────────────┬────────────┘
                                 │
                                 │ PostgreSQL (Port 6543 Pooler)
                                 ▼
                    ┌─────────────────────────┐
                    │    SUPABASE (Database)  │
                    │ PostgreSQL + Storage    │
                    └─────────────────────────┘
```

---

## 📋 Table of Contents
1. [Architecture & Services](#1-architecture--services)
2. [Step 1: Supabase Database Setup](#2-step-1-supabase-database-setup)
3. [Step 2: Database Migration & Initial Seed](#3-step-2-database-migration--initial-seed)
4. [Step 3: Render Backend Deployment](#4-step-3-render-backend-deployment)
5. [Step 4: Vercel Frontend Deployment](#5-step-4-vercel-frontend-deployment)
6. [Step 5: CORS & Environment Binding](#6-step-5-cors--environment-binding)
7. [Step 6: Custom Domain Setup](#7-step-6-custom-domain-setup)
8. [Step 7: Verification & Testing Checklist](#8-step-7-verification--testing-checklist)
9. [Troubleshooting & Cold Starts](#9-troubleshooting--cold-starts)

---

## 1. Architecture & Services

| Component | Platform | Configuration Type | Role |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** | Framework: `Vite` \| Root: `frontend` | SPA static hosting, edge CDN caching, and routing |
| **Backend** | **Render** | Runtime: `Docker` \| Root: `backend` | Python FastAPI REST API with dynamic `$PORT` |
| **Database** | **Supabase** | Cloud PostgreSQL (AWS Mumbai / ap-south-1) | Transactional data store with connection pooling |

---

## 2. Step 1: Supabase Database Setup

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Navigate to **Project Settings** → **Database**.
3. Under **Connection String**, select:
   - **Transaction Pooler (Port 6543)** for application traffic:
     ```text
     postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
     ```
   - **Direct Connection (Port 5432)** for running Alembic migrations:
     ```text
     postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
     ```
4. Under **Storage**, ensure a public bucket named `vkbathouse-media` exists if you plan to use cloud storage for user reviews and gallery images.

---

## 3. Step 2: Database Migration & Initial Seed

> [!IMPORTANT]
> **No Auto-Seeding on Startup**: The FastAPI server creates database tables if they do not exist on startup, but **NEVER** re-seeds products automatically. When an admin deletes a product or category, it stays permanently deleted across all container restarts.

To run migrations and seed the initial catalog one time:

```bash
# 1. Activate backend environment
cd backend
source venv/bin/activate   # or .\venv\Scripts\Activate.ps1 on Windows

# 2. Run Alembic migrations to current HEAD
alembic upgrade head

# 3. (Optional) Run initial catalog seed once if starting with a blank database
python -m app.utils.seed
```

---

## 4. Step 3: Render Backend Deployment

Render deploys the backend containerized via Docker using the provided [backend/Dockerfile](file:///c:/Users/HARSH/OneDrive/Desktop/vkbathouse/backend/Dockerfile).

### Option A: Deploy via `render.yaml` (Recommended)
1. In your Render Dashboard, click **New** → **Blueprint**.
2. Connect your GitHub repository.
3. Render will detect [render.yaml](file:///c:/Users/HARSH/OneDrive/Desktop/vkbathouse/render.yaml) and configure the service automatically.

### Option B: Manual Web Service Setup
1. Click **New** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Name**: `vkbathouse-api`
   - **Region**: `Singapore` (closest to India / South Asia)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `Dockerfile`
   - **Health Check Path**: `/api/v1/health`
4. Add the following **Environment Variables** under the **Environment** tab:

| Variable | Value / Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Supabase Pooler Connection String (Port 6543) | `postgresql://postgres.xxx:pass@aws-0-ap-south-1.pooler.supabase.com:6543/postgres` |
| `DIRECT_URL` | Supabase Direct Connection String (Port 5432) | `postgresql://postgres.xxx:pass@aws-0-ap-south-1.pooler.supabase.com:5432/postgres` |
| `JWT_SECRET_KEY` | High-entropy 64-character random key | `b94c...generate_random_key...93a` |
| `JWT_ALGORITHM` | Algorithm token format | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Session duration | `1440` (24 Hours) |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `https://your-site.vercel.app,https://vkbathouse.com` |
| `RAZORPAY_KEY_ID` | Live / Sandbox Razorpay Key ID | `rzp_live_TTa7F9GaYlk1nt` |
| `RAZORPAY_KEY_SECRET` | Live / Sandbox Razorpay Key Secret | `zGQ7zWvbCBEl3Y3Aqy48q1CP` |
| `WHATSAPP_NUMBER` | Store WhatsApp contact (Country code + number) | `919274543199` |
| `CONTACT_EMAIL` | Customer support email | `support@vkbathouse.com` |

5. Click **Deploy Web Service**.
6. Once deployed, note your Render backend URL: `https://vkbatmain.onrender.com`.

---

## 5. Step 4: Vercel Frontend Deployment

1. Log into your [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** → **Project**.
2. Select your GitHub repository (`vishwakarmabat-git/vkbatmain`).
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontend`
   - **Build Command**: `npm run build` (automatic)
   - **Output Directory**: `dist` (automatic)
   - **Install Command**: `npm install` (automatic)
4. Add **Environment Variables**:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://vkbatmain.onrender.com/api/v1` | URL of your deployed Render backend |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_TTa7F9GaYlk1nt` | Razorpay Key ID |
| `VITE_GOOGLE_CLIENT_ID` | `165410470670-0c60mt3fbahdg8mhb3bg7fu7u98f6oem.apps.googleusercontent.com` | Public Google OAuth Client ID |

5. Click **Deploy**.
6. Vercel will build the frontend and serve it with the [frontend/vercel.json](file:///c:/Users/HARSH/OneDrive/Desktop/vkbathouse/frontend/vercel.json) rewrite rules, ensuring deep SPA links (e.g., `/products/slug`, `/checkout`, `/admin/orders`) load seamlessly on page refresh.

---

## 6. Step 5: CORS & Environment Binding

Once both services are deployed:
1. Copy your live Vercel URL (e.g. `https://vkbathouse.vercel.app`).
2. Go to **Render Dashboard** → `vkbatmain` → **Environment**.
3. Update `CORS_ORIGINS` with your live frontend domain:
   ```env
   CORS_ORIGINS=https://vkbathouse.vercel.app,http://localhost:5173
   ```
4. Save changes. Render will auto-redeploy with the new CORS permissions.

---

## 7. Step 6: Custom Domain Setup (Optional)

If using a custom domain (e.g. `vkbathouse.com` and `api.vkbathouse.com`):
1. **Frontend**: In Vercel Project Settings → Domains → Add `vkbathouse.com` and `www.vkbathouse.com`.
2. **Backend**: In Render Web Service Settings → Custom Domains → Add `api.vkbathouse.com`.
3. **DNS Records** (at your domain registrar, e.g. Cloudflare / GoDaddy / Namecheap):
   - `A` record for `@` → `76.76.21.21` (Vercel)
   - `CNAME` for `www` → `cname.vercel-dns.com`
   - `CNAME` for `api` → `vkbatmain.onrender.com`
4. Update `VITE_API_URL` on Vercel to `https://api.vkbathouse.com/api/v1`.

---

## 8. Step 7: Verification & Testing Checklist

After deployment, verify each layer:

### ✅ Health & System Checks
- [ ] Swagger API Docs: `https://your-api.onrender.com/docs` loads properly.

### ✅ Frontend & Purchase Flow
- [ ] Direct navigation to `/products` and `/products/:slug` loads without 404 on refresh.
- [ ] Dynamic 3-second Hero carousel rotates with correct images.
- [ ] Adding to cart opens sliding drawer with exact bat price.
- [ ] Applying coupon (e.g. `VK10`) discounts subtotal accurately.
- [ ] Placing order (COD or Razorpay) succeeds and creates record in Supabase.
- [ ] Order tracking `/track/{order_number}` displays live order status.

### ✅ Admin Management
- [ ] Admin login at `/admin/login` gates access properly.
- [ ] Admin dashboard displays live statistics and 7-day revenue chart.
- [ ] Creating a new product uploads image and immediately appears on customer catalog.
- [ ] Deleting a product removes it permanently from Supabase; reloading or restarting Render does **NOT** restore it.

---

## 9. Troubleshooting & Cold Starts

### Handling Free-Tier Render Cold Starts
Render free-tier instances sleep after 15 minutes of inactivity. When the first visitor accesses the site:
- The frontend Axios client in `client.ts` has a **25-second timeout** and handles network latency gracefully.
- The TanStack Query client retries failed queries automatically.
- Root [ErrorBoundary.tsx](file:///c:/Users/HARSH/OneDrive/Desktop/vkbathouse/frontend/src/components/common/ErrorBoundary.tsx) shields the React tree and displays a clean reload action if a request fails.

### Debugging Deployment Logs
- **Render Logs**: View live terminal output under the **Logs** tab in Render Dashboard.
- **Vercel Build Logs**: View build and deployment logs under the **Deployments** tab in Vercel.
- **Supabase Logs**: View database query execution and connection statistics in Supabase **Logs** → **Database**.
