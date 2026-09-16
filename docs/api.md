# API Specification & Contract Reference — ON-DEMAND Platform

Base URL: `http://127.0.0.1:8000/api`  
Authentication: HTTP Bearer JWT (`Authorization: Bearer <token>`)

---

## 1. Authentication & User Management

### `POST /auth/register`
Register a new customer or trade worker.
- **Request Body:**
```json
{
  "name": "Ramesh Kumar",
  "phone": "9876543210",
  "password": "securepassword",
  "role": "CUSTOMER",
  "address": "142 Crosscut Road, Gandhipuram, Coimbatore",
  "cooperative_id": 1,
  "experience_years": 4.5,
  "trade": "Electrical repair"
}
```
- **Response (200 OK):**
```json
{
  "id": 14,
  "name": "Ramesh Kumar",
  "phone": "9876543210",
  "role": "CUSTOMER",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### `POST /auth/login`
Authenticate existing user and retrieve session token.
- **Request Body:**
```json
{
  "phone": "9000000011",
  "password": "cust123"
}
```
- **Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "role": "CUSTOMER",
  "user_id": 3,
  "name": "Meena Sundaram"
}
```

### `GET /auth/me`
Retrieve authenticated profile with role-specific context.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "id": 4,
  "name": "Suresh Kumar",
  "phone": "9010000001",
  "role": "WORKER",
  "worker_id": 1,
  "verification_status": "VERIFIED",
  "cooperative": "Gandhipuram Labour Cooperative Society",
  "avg_rating": 4.9,
  "rating_count": 34,
  "experience_years": 8.5
}
```

---

## 2. Catalog & Trade Services

### `GET /catalog/categories`
List broad trade categories.

### `GET /catalog/services`
Retrieve services with statutory 90/10 transparent wage breakdown.
- **Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Fan & light repair",
    "description": "Professional fan & light repair by verified cooperative tradespersons",
    "base_price": 250.0,
    "worker_earning": 200.0,
    "coop_charge": 50.0,
    "requires_certification": true,
    "category_id": 1
  }
]
```

### `GET /catalog/cooperatives`
List registered primary labour cooperative societies.

---

## 3. Worker Discovery & Geo-Matching

### `GET /workers/match`
Multi-factor explainable worker matching with Haversine distance and slot conflict check.
- **Query Parameters:**
  - `service_id` (int): Required.
  - `lat` (float): Customer latitude.
  - `lng` (float): Customer longitude.
  - `scheduled_date` (YYYY-MM-DD): Target date.
  - `start_time` (HH:MM): Target time.
  - `duration_min` (int): Slot duration (default 60).
- **Response (200 OK):**
```json
[
  {
    "worker_id": 1,
    "name": "Suresh Kumar",
    "phone": "9010000001",
    "cooperative_name": "Gandhipuram Labour Cooperative Society",
    "score": 95,
    "distance_km": 1.2,
    "avg_rating": 4.9,
    "rating_count": 34,
    "experience_years": 8.5,
    "reasons": [
      "Exact skill match (+35pts)",
      "Available slot (+20pts)",
      "Proximity: 1.2km (+20pts)",
      "Verified Society Member (+10pts)",
      "Govt Certified (+5pts)"
    ]
  }
]
```

---

## 4. Bookings & Concurrency Control

### `POST /bookings`
Reserve a slot for a verified worker.
- **Request Body:**
```json
{
  "worker_id": 1,
  "service_id": 1,
  "scheduled_date": "2026-09-16",
  "start_time": "14:00",
  "duration_min": 60,
  "lat": 11.0168,
  "lng": 76.9558,
  "address": "142 Crosscut Road, Gandhipuram",
  "description": "Ceiling fan speed regulator replacement",
  "is_emergency": false
}
```
- **Response (200 OK):**
```json
{
  "id": 42,
  "service_name": "Fan & light repair",
  "worker_name": "Suresh Kumar",
  "date": "2026-09-16",
  "start_time": "14:00",
  "total_amount": 250.0,
  "status": "REQUESTED"
}
```
- **Error Response (409 Conflict):**
```json
{
  "detail": "Conflict: Worker is already booked for an overlapping time window. Please select another slot."
}
```

### `PATCH /bookings/{id}?status={new_status}`
Advance booking status through workflow state machine:
`REQUESTED` $\rightarrow$ `CONFIRMED` $\rightarrow$ `WORKER_ACCEPTED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`.

---

## 5. Emergency Dispatch

### `POST /emergency-requests`
Real-time nearby worker discovery for urgent incidents.
- **Request Body:**
```json
{
  "service_id": 1,
  "lat": 11.0168,
  "lng": 76.9558,
  "address": "Gandhipuram Signal",
  "description": "Main circuit breaker tripping constantly"
}
```
- **Response (200 OK):** Returns live available candidates from database. Returns HTTP 404 if no verified worker is available.

### `POST /emergency-requests/{id}/dispatch`
Assigns the nearest available worker and creates priority accepted booking.

---

## 6. Payments & Invoicing

### `POST /payments`
Simulate itemized payment.
- **Request Body:**
```json
{
  "booking_id": 42,
  "succeed": true,
  "method": "UPI Demo Sandbox"
}
```
- **Response (200 OK):**
```json
{
  "booking_id": 42,
  "payment_status": "SUCCESS",
  "amount": 250.0,
  "transaction_ref": "MOCK-TXN-A7F92B301C",
  "is_demo": true,
  "demo_notice": "Simulated cooperative sandbox transaction. No real banking transfer was executed."
}
```

### `GET /invoices/{booking_id}`
Returns formal cooperative invoice with line-item breakdown.

---

## 7. Quality Reviews & Ratings

### `POST /ratings`
Submit 1-5 star review on completed booking. Automatically recalculates worker average rating.
- **Request Body:**
```json
{
  "booking_id": 42,
  "stars": 5,
  "message": "Punctual, polite, and resolved the electrical issue within 30 minutes."
}
```

---

## 8. AI Engine & Administrative Governance

### `GET /ai/demand-forecast?days=7`
60-day moving average demand forecasting by locality.

### `GET /ai/workforce-allocation?days=7`
Shortage detection and inter-society workforce reallocation recommendations.

### `POST /ai/workforce-allocation/{id}/approve`
Admin approval of AI recommendation, generating tamper-evident audit log entry.

### `POST /ai/parse-request`
Natural language entity extractor (supports English and Tamil requests).
