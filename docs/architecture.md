# Architecture Specification — ON-DEMAND Labour Cooperative Digital Service Marketplace

## 1. System Overview

**ON-DEMAND** is a democratic, civic-trust, cooperative-owned digital service platform connecting Labour Cooperative Federations and Primary Labour Contract Societies with households and commercial enterprises. Unlike predatory private gig aggregators that extract 25%–40% broker commissions, ON-DEMAND guarantees a statutory **90% direct wage return** to tradespersons, while retaining **10% for local society maintenance, welfare, tool pools, and federation oversight**.

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER (PWA)                              │
│                                                                              │
│    Next.js 14 App Router  •  Tailwind CSS Design Tokens  •  TypeScript       │
│    Bilingual i18n (English & Tamil)  •  Universal Status & Error Boundary   │
│                                                                              │
│  ┌───────────────────────┬───────────────────────┬────────────────────────┐  │
│  │   Customer Portal     │     Worker Portal     │      Admin Console     │  │
│  │  • AI Query Parser    │  • Task Acceptance    │  • Worker Vetting      │  │
│  │  • Geo-Matching (km)  │  • Real-time Earnings │  • 60d AI Forecasting  │  │
│  │  • Itemized Invoices  │  • Skill Profiling    │  • Shortage Balancer   │  │
│  │  • 1-5 Star Ratings   │  • Welfare/Insurance  │  • Tamper Audit Trail  │  │
│  └───────────────────────┴───────────────────────┴────────────────────────┘  │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │ REST API (JSON / Bearer JWT)
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                             BACKEND SERVICE LAYER                            │
│                                                                              │
│               FastAPI (Python 3.11)  •  Uvicorn  •  Pydantic v2              │
│                                                                              │
│  ┌───────────────────────┬───────────────────────┬────────────────────────┐  │
│  │  Matching & Geo Engine│  Scheduling & Concurr │   AI Forecasting Engine│  │
│  │  • Haversine Distance │  • max(s1,s2)<min(e1) │  • 60-Day Moving Avg   │  │
│  │  • 6-Factor Algorithm │  • HTTP 409 Conflict  │  • Trend Multipliers   │  │
│  │  • Score: 0 - 100     │  • Zero Double-Booking│  • Sparse Data Fallback│  │
│  ├───────────────────────┼───────────────────────┼────────────────────────┤  │
│  │  Security & Identity  │  Welfare & Governance │   Transparent Mocks    │  │
│  │  • Bcrypt Hashing     │  • ESI / Accident Ins │  • Labeled Sandboxes   │  │
│  │  • HS256 JWT Tokens   │  • Inter-Society Lend │  • Automated Invoices  │  │
│  │  • Role-Based Guards  │  • Tamper-Evident Logs│  • Zero False Claims   │  │
│  └───────────────────────┴───────────────────────┴────────────────────────┘  │
└──────────────────────────────────────┬───────────────────────────────────────┘
                                       │ SQLAlchemy 2.0 ORM
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                               DATABASE LAYER                                 │
│                                                                              │
│             MySQL 8.0 Engine (Production)  /  SQLite 3 (Fallback)            │
│             22 Normalized Relational Tables  •  Foreign Key Cascade          │
│             Composite Slot Indexes  •  60-Day Seed Data (300+ Records)       │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Principles

### 2.1 Multi-Tenant Cooperative Federation Model
- **Federation Level (State):** Oversees macro policy, inter-society resource balancing, certified rate regulations, and statutory compliance.
- **Primary Society Level (District/Ward):** Manages local tradespersons, verifies physical credentials (Aadhaar, trade certs), manages tool pools, and resolves on-site grievances.
- **Member Tradesperson Level:** Owns democratic voting rights in the cooperative, receives 90% direct earnings, and enjoys state-facilitated social security benefits.
- **Customer / Household Level:** Accesses certified, background-verified tradespersons at audited, transparent rates with zero surge gouging.

### 2.2 Explainable Multi-Factor Worker Matching
Workers are ranked using a multi-factor mathematical scoring model ($0 \le \text{Score} \le 100$):

$$\text{Score} = S_{\text{skill}} + S_{\text{avail}} + S_{\text{dist}} + S_{\text{verif}} + S_{\text{cert}} + S_{\text{rating}}$$

Where:
- **$S_{\text{skill}}$ (35 pts):** Match between requested trade service and verified worker capability.
- **$S_{\text{avail}}$ (20 pts):** Verified real-time availability in the requested weekday and time window.
- **$S_{\text{dist}}$ (20 pts):** Proximity computed via the Haversine great-circle formula ($R=6371\text{ km}$):
  $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos \phi_1 \cos \phi_2 \sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
- **$S_{\text{verif}}$ (10 pts):** Society verification status (`VERIFIED` = 10 pts).
- **$S_{\text{cert}}$ (5 pts):** Government certification credential (ITI / Red Cross / NSDC).
- **$S_{\text{rating}}$ (10 pts):** Historical customer review average normalized ($2 \times \text{Stars}$).

### 2.3 Concurrency & Double-Booking Prevention
The scheduler verifies interval overlap against all non-cancelled bookings for the worker:

$$\max(\text{start}_1, \text{start}_2) < \min(\text{end}_1, \text{end}_2)$$

If an overlap is detected, the API returns **HTTP 409 Conflict** with an explicit error explanation, preventing double-booking at both the database and application levels.

### 2.4 AI Demand Forecasting & Shortage Balancer
- **Moving Average Engine:** Computes historical volume over rolling 60-day windows, grouping by service category and locality.
- **Predictive Multipliers:** Applies seasonal and day-of-week trend weights.
- **Transparent Attribution:** When booking history is sparse, the engine automatically tags output as `mode: "baseline/demo forecast due to sparse data"`. When historical data is sufficient ($N \ge 30$), it outputs `mode: "model-based forecast (60d history)"`.
- **Human-In-The-Loop Governance:** Shortage reallocation recommendations require explicit Admin approval/rejection with full audit logging.

---

## 3. Technology Stack Justification

| Layer | Selected Tech | Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router) | Server-Side Rendering (SSR) for instant SEO and client interactivity, zero-bundle overhead for static layouts. |
| **Styling & Design Tokens** | Vanilla CSS + Tailwind CSS | Strict Civic-Trust design tokens (emerald, amber, slate), responsive flex/grid layouts, no runtime CSS-in-JS penalty. |
| **Localization** | Custom Client i18n (`useLang`) | 100% complete bilingual support (English & Tamil `ta.json`) without external heavy i18n libraries. |
| **Backend Framework** | FastAPI (Python 3.11) | High-throughput asynchronous performance, automatic OpenAPI documentation, strict Pydantic v2 data validation. |
| **ORM & Database** | SQLAlchemy 2.0 (MySQL / SQLite) | Strict relational integrity, foreign keys, slot index constraints, and frictionless zero-setup SQLite fallback. |
| **Authentication** | OAuth2 Bearer + JWT (HS256) | Stateless token verification with role-based RBAC guards (`CUSTOMER`, `WORKER`, `COOP_ADMIN`, `FED_ADMIN`). |
