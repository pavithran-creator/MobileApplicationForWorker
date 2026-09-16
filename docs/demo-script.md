# Hackathon Judge Walkthrough & Demonstration Script

This script provides an end-to-end, 7-minute demonstration path proving 100% functionality of all requirements for evaluators and hackathon judges.

---

## Demo Personas & Credentials

| Stakeholder Role | Name & Society | Phone | Password | One-Click Button |
| :--- | :--- | :--- | :--- | :--- |e
| **Customer** | Meena Sundaram (Gandhipuram) | `9000000011` | `cust123` | **Customer** |
| **Skilled Worker** | Suresh Kumar (ITI Electrician) | `9010000001` | `work123` | **Skilled Worker** |
| **Society Admin** | S. Muthukumar (Gandhipuram Coop) | `9000000002` | `admin123` | **Society Admin** |
| **Federation Admin** | Dr. K. Arumugam (Director) | `9000000001` | `admin123` | **Federation Admin** |

---

## 7-Step Demonstration Flow

### Step 1: Natural Language AI Request Parsing
1. Open the platform at `http://localhost:3000`.
2. Click **Book a Verified Worker** or navigate to `/book`.
3. In the **Natural Language Assistant** input at the top, type:  
   `"Need electrician tomorrow at 6 PM near Gandhipuram"`
4. Click **Parse with AI**.
5. **Notice:**
   - Trade automatically selects *Fan & light repair*.
   - Schedule Date automatically calculates tomorrow's ISO date.
   - Start Time sets to `18:00`.
   - Locality sets to `Gandhipuram, Coimbatore`.
   - Explanation badge confirms extraction.

---

### Step 2: Explainable Geo-Matching & Haversine Proximity
1. With parameters pre-filled, click **Find Geo-Matched Workers**.
2. **Notice:**
   - Live database query executes against verified cooperative members.
   - Workers are scored ($0 - 100$) via multi-factor evaluation.
   - Exact Haversine distance in kilometers is displayed (e.g. `1.2 km away`).
   - Explainability tags show points awarded for Skill, Availability, Proximity, Society Verification, and Certifications.

---

### Step 3: Slot Reservation & Double-Booking Conflict Prevention
1. Click **Confirm Booking** on *Suresh Kumar*.
2. A success modal appears confirming Booking Reference #ID and transparent pricing.
3. Dismiss the modal or return to `/book`.
4. Without changing the date, time (`18:00`), or worker, attempt to book *Suresh Kumar* again.
5. **Notice:**
   - The system intercepts the overlapping interval $\max(s_1, s_2) < \min(e_1, e_2)$.
   - A prominent red alert banner displays:  
     `Conflict: Worker is already booked for an overlapping time window. Please select another slot.`
   - Double-booking is completely blocked.

---

### Step 4: Transparent Cooperative Invoicing & Sandbox Payment
1. Navigate to `/dashboard` (Customer Portal).
2. Locate the active booking and click **View Invoice & Pay**.
3. **Notice:**
   - Itemized line items explicitly separate:
     - **Worker Fair Wage (90% Direct Compensation):** e.g. ₹200.00
     - **Cooperative Welfare & Maintenance Surcharge (10%):** e.g. ₹50.00
   - Prominent `[DEMO / MOCK]` status badge clarifies sandbox payment simulation.
4. Click **Simulate UPI Payment**.
5. Payment transitions to `PAID` with generated receipt reference number.

---

### Step 5: Service Completion & Rating Recalculation
1. On the dashboard booking card, click **Start Service** (advances to `IN_PROGRESS`), then **Complete Service** (advances to `COMPLETED`).
2. Click **Rate Service**.
3. Select 5 Stars, enter feedback: *"Prompt, certified, and left the work area clean."*
4. Click **Submit Review**.
5. The worker's average rating in the database is automatically recalculated.

---

### Step 6: Skilled Worker Portal Experience
1. Click **Log In** from the top right, and click the **Skilled Worker** 1-click demo button.
2. The user is redirected to `/worker`.
3. **Notice:**
   - Real-time direct earnings total shows statutory 90% retained wage.
   - Verification badge displays `VERIFIED`.
   - Trade qualifications and certifications list ITI National Trade Certificate.
   - Government social security schemes show active enrollment in ESI and Labour Pension.
   - Accident insurance shows mock policy reference.

---

### Step 7: Cooperative & Federation Admin Governance & AI Rebalancing
1. Log in using the **Federation Admin** 1-click button.
2. The user is redirected to `/admin`.
3. **Notice:**
   - Macro KPIs summarize Total Workers, Verified Members, Active Bookings, and Total Cooperative Revenue.
   - **Worker Verification Queue:** Shows pending worker applicants with 1-click **Approve** and **Reject** buttons.
   - **AI Demand Forecasting:** Shows 60-day historical moving average forecast, predicted requests, and mode badge (`model-based forecast (60d history)`).
   - **AI Workforce Allocation:** Shows projected shortage and automated cross-society reallocation recommendation. Click **Approve Workforce Allocation** to accept the recommendation into federation schedule.
   - **System Audit Trail:** View the tamper-evident log confirming the recorded approval timestamp and admin actor name.
