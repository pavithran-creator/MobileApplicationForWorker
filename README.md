# ON-DEMAND: Labour Cooperative Digital Service Marketplace
### Tamil Nadu Labour Cooperative Federation • Civic Trust Platform

[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2014%20(Vercel)-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Supabase%20%2F%20PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![PostGIS](https://img.shields.io/badge/Spatial-PostGIS%20Geo--Matching-336791?style=for-the-badge&logo=postgresql)](https://postgis.net/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Bilingual](https://img.shields.io/badge/i18n-English%20%26%20Tamil-198754?style=for-the-badge)](docs/design-system.md)

---

## 1. Executive Summary

**ON-DEMAND** is a civic-trust, cooperative-owned digital service platform built for **Labour Cooperative Federations and Primary Labour Contract Societies**.

Unlike private gig economy monopolies that extract 25% to 40% algorithmic broker commissions from blue-collar workers, ON-DEMAND enforces a **statutory 90% direct wage return** to verified tradespersons. The remaining **10% transparent society fee** finances local cooperative tool libraries, safety kits, dispute resolution, and state-backed social security protection.

---

## 2. Target Architecture (Supabase + Vercel)

```text
                 USER (Citizen / Worker / Cooperative Admin)
                                      │
                                      ▼
                      ┌────────────────────────────────┐
                      │        VERCEL PRODUCTION       │
                      │                                │
                      │  Next.js 14 App Router         │
                      │  - Server-Side Route Handlers  │
                      │  - Explainable Geo-Matching    │
                      │  - NLP & Multilingual Parser   │
                      │  - AI Demand Forecasting       │
                      │  - Strict Concurrency Control  │
                      └───────────────┬────────────────┘
                                      │
                                      ▼
                      ┌────────────────────────────────┐
                      │            SUPABASE            │
                      │                                │
                      │  • PostgreSQL 15 + PostGIS     │
                      │  • Supabase Authentication     │
                      │  • Row-Level Security (RLS)    │
                      │  • Supabase Storage (Private)  │
                      │  • Realtime Notification Bus   │
                      │  • Statutory 90/10 Fair Wage   │
                      └────────────────────────────────┘
```

---

## 3. Key Features & Highlights

- **90% / 10% Transparent Wage Model:** Every catalog service displays an audited breakdown showing worker direct compensation vs cooperative welfare surcharge.
- **Explainable Multi-Factor Geo-Matching:** Workers are evaluated on a 100-point scale:
  - Skill Match: 35 points
  - Schedule Slot Availability: 20 points
  - Proximity (Haversine / PostGIS): 20 points
  - Cooperative Verification: 10 points
  - Trade Certification: 5 points
  - Customer Rating: 10 points
- **Strict Slot Concurrency & Double-Booking Interception:** Real interval overlap detection intercepts conflicting booking requests with **HTTP 409 Conflict**.
- **24/7 Priority Emergency Dispatch:** Dispatches certified nearby technicians for critical electrical, plumbing, and safety faults with live database worker search.
- **AI Demand Forecasting & Workforce Rebalancing:** 60-day moving average demand modeling with human-in-the-loop administrative approval before any allocation.
- **Multilingual Request Parser:** Natural language processing for Tamil, Hindi, and English (*"எனக்கு ஒரு எலக்ட்ரீஷியன் வேண்டும் காந்திபுரத்தில்"*, *"Need electrician tomorrow at 10 AM near Gandhipuram"*) with secure server-side Gemini AI fallback.
- **Comprehensive Worker Welfare & Insurance:** Integrated tracking of state-backed accident cover, tool protection, and welfare pension grants.
- **100% Bilingual Interface:** Full instant toggling between English and Tamil (தமிழ் `ta.json`).

---

## 4. Environment Variables

Configure the following variables in `frontend/.env.local` (or in your Vercel Project Settings):

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Internal Next.js API Gateway (relative path for local and production)
NEXT_PUBLIC_API_URL=/api

# Optional: Google Gemini AI Key for advanced Natural Language understanding
AI_API_KEY=your-gemini-api-key
```

> [!CAUTION]
> Never expose `SUPABASE_SERVICE_ROLE_KEY` or `AI_API_KEY` to client-side code (`NEXT_PUBLIC_*`). They are strictly executed within secure server-side Next.js route handlers.

---

## 5. Local Setup & Running Locally

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

### Step 2: Database Setup (Supabase)
Run the SQL migration in your Supabase SQL Editor:
- File: [`supabase/migrations/20260916000001_initial_schema.sql`](supabase/migrations/20260916000001_initial_schema.sql)
- Seed Data: [`supabase/seed.sql`](supabase/seed.sql)

### Step 3: Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Demo Personas & Test Credentials

The system is pre-configured with realistic Coimbatore cooperative personas and 60 days of historical data:

| Persona | Name | Mobile Phone | Role | Portal URL |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | Meena Sundaram | `9000000011` | `CUSTOMER` | `/dashboard` |
| **Worker (Electrician)** | Suresh Kumar | `9010000001` | `WORKER` | `/worker` |
| **Cooperative Admin** | S. Muthukumar | `9000000002` | `COOP_ADMIN` | `/admin` |
| **Federation Admin** | Dr. K. Arumugam | `9000000001` | `FED_ADMIN` | `/admin` |

> [!TIP]
> The `/login` page includes **1-Click Demo Persona buttons** for instant, passwordless access to each role during evaluation.

---

## 7. Deployment to Vercel

1. Push your repository to GitHub / GitLab.
2. Import the repository in [Vercel](https://vercel.com).
3. Set the Root Directory to `frontend`.
4. Configure the Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_API_URL=/api`
   - `AI_API_KEY` (optional)
5. Deploy. The application is production-ready with zero external Python backend dependencies.

---

## 8. Troubleshooting

- **409 Conflict during Booking:** Worker is already booked in that timeslot. Choose an alternative time or another verified tradesperson.
- **Port 8000 Error:** Old references to FastAPI/localhost:8000 have been completely superseded by Next.js App Router handlers (`/api/*`). Ensure `NEXT_PUBLIC_API_URL` is set to `/api`.
- **Database Connection Error:** Verify `NEXT_PUBLIC_SUPABASE_URL` and keys in `.env.local`.
