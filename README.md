# ON-DEMAND: Labour Cooperative Digital Service Marketplace
### Tamil Nadu Labour Cooperative Federation • Civic Trust Platform

[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.111-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MySQL / SQLite](https://img.shields.io/badge/Database-MySQL%20%2F%20SQLite-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Bilingual](https://img.shields.io/badge/i18n-English%20%26%20Tamil-198754?style=for-the-badge)](docs/design-system.md)

---

## 1. Executive Summary

**ON-DEMAND** is a civic-trust, cooperative-owned digital service platform built for **Labour Cooperative Federations and Primary Labour Contract Societies**.

Unlike private gig economy monopolies that extract 25% to 40% algorithmic broker commissions from blue-collar workers, ON-DEMAND enforces a **statutory 90% direct wage return** to verified tradespersons. The remaining **10% transparent society fee** finances local cooperative tool libraries, safety kits, dispute resolution, and state-backed social security protection.

---

## 2. Key Features & Highlights

- **90% / 10% Transparent Wage Model:** Every catalog service displays an audited breakdown showing worker direct compensation vs cooperative maintenance.
- **Explainable Multi-Factor Geo-Matching:** Workers are evaluated on a 100-point scale incorporating skill match, verified availability, Haversine distance ($R=6371\text{ km}$), cooperative vetting, and credentials.
- **Strict Slot Concurrency & Anti-Double-Booking:** Real interval overlap detection ($\max(s_1, s_2) < \min(e_1, e_2)$) intercepts conflicting slots with **HTTP 409 Conflict**.
- **24/7 Priority Emergency Dispatch:** Dispatches certified nearby technicians for critical electrical, plumbing, and safety faults with live database worker search.
- **AI Demand Forecasting & Workforce Rebalancing:** 60-day moving average demand modeling with explicit mode attribution (`model-based forecast` vs `sparse baseline`) and human-in-the-loop admin approval.
- **Natural Language Request Parser:** Bilingual NLP parsing conversational English or Tamil requests (*"Need electrician tomorrow at 6 PM near Gandhipuram"*).
- **Comprehensive Worker Welfare & Insurance:** Integrated tracking of ESI healthcare, provident pension schemes, and accident cover labeled with transparent demo attributions.
- **100% Bilingual Interface:** Full instant toggling between English and Tamil (தமிழ் `ta.json`) with zero layout clipping.
- **Tamper-Evident System Audit Trail:** Complete recording of administrative approvals, verifications, and AI decisions.

---

## 3. Quick Start Guide (Windows)

### Option A: 1-Click Launchers (Recommended)
Double-click `start.bat` in the repository root. This will automatically:
1. Start the FastAPI backend on port `8000`.
2. Launch the Next.js frontend on port `3000`.
3. Seed realistic Coimbatore cooperative data (if not already seeded).

Alternatively, you can run components individually:
- `run-backend.bat`: Starts Python virtual environment and Uvicorn server.
- `run-frontend.bat`: Starts Next.js development server.

### Option B: Docker Compose
```bash
docker-compose up -d
```
Starts MySQL 8.0 and the FastAPI application containerized.

### Option C: Manual Terminal Setup

#### Backend Setup:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
API Documentation will be live at: `http://127.0.0.1:8000/docs`

#### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```
Web Application will be live at: `http://localhost:3000`

---

## 4. Demo Personas & Test Credentials

The database is pre-seeded with 10 skilled tradespersons, 3 customers, 2 cooperative administrators, and 60 days of historical bookings.

| Persona | Name | Mobile Phone | Password | Portal URL |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | Meena Sundaram | `9000000011` | `cust123` | `/dashboard` |
| **Worker (Electrician)** | Suresh Kumar | `9010000001` | `work123` | `/worker` |
| **Cooperative Admin** | S. Muthukumar (Gandhipuram) | `9000000002` | `admin123` | `/admin` |
| **Federation Admin** | Dr. K. Arumugam (Director) | `9000000001` | `admin123` | `/admin` |

> [!TIP]
> The `/login` page includes **1-Click Demo Persona buttons** for instant, passwordless access to any role during presentations and evaluation.

---

## 5. Architecture & Project Layout

```text
sih/
├── backend/                      # FastAPI Python Service
│   ├── app/
│   │   ├── api/                  # Modular REST Routers
│   │   │   ├── auth.py           # Registration, Login, JWT
│   │   │   ├── catalog.py        # Services, Categories, Societies
│   │   │   ├── workers.py        # Worker profiles, Geo-Matching
│   │   │   ├── bookings.py       # Concurrency scheduler, Status workflows
│   │   │   ├── emergency.py      # Real-time nearby emergency dispatch
│   │   │   ├── payments.py       # Invoices, itemized wage breakdown
│   │   │   ├── ratings.py        # 1-5 star reviews & recalculation
│   │   │   ├── welfare.py        # ESI, Pension, and Insurance
│   │   │   ├── admin.py          # KPIs, Vetting Queue, Audit Logs
│   │   │   └── ai.py             # Demand forecast, Shortage rebalancer, NLP
│   │   ├── models/models.py      # 22 SQLAlchemy Relational Entities
│   │   ├── services/             # Domain logic (Matching, Forecasting, NLP)
│   │   └── core/                 # Config, JWT Security, RBAC Guards
│   ├── tests/                    # Pytest Integration Test Suite
│   └── seed.py                   # Realistic 60-day historical data seed
│
├── frontend/                     # Next.js 14 App Router PWA
│   ├── app/                      # Application Routes
│   │   ├── layout.tsx            # Root Layout with Nav, Footer, ErrorBoundary
│   │   ├── page.tsx              # Civic-Trust Landing Page
│   │   ├── services/page.tsx     # Transparent Fair-Wage Service Catalog
│   │   ├── login/page.tsx        # Persona Authentication Screen
│   │   ├── register/page.tsx     # Multi-Role Member Registration
│   │   ├── book/page.tsx         # AI-Assisted Geo-Matching & Scheduling
│   │   ├── emergency/page.tsx    # 24/7 Priority Emergency Dispatch
│   │   ├── dashboard/page.tsx    # Customer Bookings, Invoices & Ratings
│   │   ├── worker/page.tsx       # Worker Service Portal & Earnings
│   │   └── admin/page.tsx        # Federation Governance & AI Console
│   ├── components/               # Reusable UI Design Tokens
│   │   ├── Navbar.tsx            # Sticky Bilingual Navigation Bar
│   │   ├── StatusBadge.tsx       # Universal 5-Domain Semantic Badges
│   │   ├── ErrorBoundary.tsx     # Graceful Client Crash Recovery
│   │   ├── LoadingSkeleton.tsx   # Content Shimmer Animation Loaders
│   │   └── EmptyState.tsx        # Friendly Empty States
│   ├── locales/                  # Complete i18n Dictionaries
│   │   ├── en.json               # English Translations
│   │   └── ta.json               # Tamil (தமிழ்) Complete Translations
│   └── lib/                      # API Client & i18n Provider
│
└── docs/                         # Comprehensive Documentation
    ├── architecture.md           # Architectural Deep Dive
    ├── database.md               # ER Diagrams & 22-Table Schemas
    ├── api.md                    # REST API Contract Specifications
    ├── design-system.md          # Civic-Trust Tokens & Color System
    ├── ps-feature-mapping.md     # 100% PS Traceability Matrix
    └── demo-script.md            # Step-by-Step 7-Minute Judge Script
```

---

## 6. Documentation Index

- [System Architecture](docs/architecture.md)
- [Database Schema & ER Diagrams](docs/database.md)
- [REST API Specifications](docs/api.md)
- [Design Tokens & UI Aesthetics](docs/design-system.md)
- [Problem Statement Traceability Matrix](docs/ps-feature-mapping.md)
- [Judge Demonstration Walkthrough Script](docs/demo-script.md)

---

## 7. License & Cooperative Attribution

Developed in accordance with the Official Problem Statement requirements for **State Labour Cooperative Federations**. All simulated external integrations (payment gateways, insurance providers) are explicitly marked with `[DEMO / MOCK]` status indicators.
