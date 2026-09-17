# Phase 1: Repository Audit & Supabase Migration Specification

## 1. System Architecture Status
- **Frontend & Server Handlers**: Next.js 14.2.5 (App Router), React 18, TypeScript 5.5, Tailwind CSS 3.4
- **Backend & Database**: Pure Supabase PostgreSQL with PostGIS, Supabase Auth, Row Level Security (RLS), and Realtime.
- **Decommissioned**: Legacy Python (FastAPI, Uvicorn, SQLAlchemy) backend and SQLite/MySQL database containers have been completely removed.
- **Authentication**: Supabase Auth + session tokens; roles: CUSTOMER, WORKER, COOP_ADMIN, FED_ADMIN.
- **API Boundary**: Fully centralized in Next.js route handlers (`frontend/app/api/*`) and `frontend/lib/api.ts`.

## 2. Supabase Target Mapping
- **Database**: Supabase PostgreSQL with PostGIS extension for spatial queries.
- **Security**: Row Level Security (RLS) on all tables with custom access policies per user role.
- **Authentication**: Supabase Auth (`auth.users`) integrated with `public.profiles`.
- **Business Logic & Concurrency**: PostgreSQL functions (`worker_free`, `match_workers`, `create_booking_atomic`) ensuring zero double-booking and explainable scoring.
- **Server Handlers**: Next.js App Router API Route Handlers (`/api/*`) executing secure server-side logic using `@supabase/supabase-js` without exposing secrets to the client.
- **AI & Integrations**: Server-side Gemini AI with multilingual fallback; mock cooperative banking gateway with statutory 90/10 fair wage invoices.
