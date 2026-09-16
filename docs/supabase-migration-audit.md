# Phase 1: Repository Audit & Supabase Migration Specification

## 1. Existing System Audit
- **Frontend**: Next.js 14.2.5 (App Router), React 18, TypeScript 5.5, Tailwind CSS 3.4
- **Backend**: FastAPI 0.115.6, Uvicorn, SQLAlchemy 2.0 (33 database models)
- **Database**: SQLite / MySQL compatibility layer with 33 tables covering federations, cooperatives, users, workers, customers, bookings, payments, invoices, ratings, welfare, insurance, audit logs, and AI forecasts.
- **Authentication**: JWT Bearer tokens with bcrypt passwords; roles: CUSTOMER, WORKER, COOP_ADMIN, FED_ADMIN.
- **API Boundary**: Fully centralized in `frontend/lib/api.ts` via `request<T>(endpoint, options)`.

## 2. Supabase Target Mapping
- **Database**: Supabase PostgreSQL with PostGIS extension for spatial queries.
- **Security**: Row Level Security (RLS) on all tables with custom access policies per user role.
- **Authentication**: Supabase Auth (`auth.users`) integrated with `public.profiles`.
- **Business Logic & Concurrency**: PostgreSQL functions (`worker_free`, `match_workers`, `create_booking_atomic`) ensuring zero double-booking and explainable scoring.
- **Server Handlers**: Next.js App Router API Route Handlers (`/api/*`) executing secure server-side logic using `@supabase/supabase-js` without exposing secrets to the client.
- **AI & Integrations**: Server-side Gemini AI with multilingual fallback; mock cooperative banking gateway with statutory 90/10 fair wage invoices.
