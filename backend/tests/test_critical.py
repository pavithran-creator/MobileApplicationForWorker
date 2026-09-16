import os
import pytest
from fastapi.testclient import TestClient

# Configure isolated test database
os.environ["DATABASE_URL"] = "sqlite:///./test_suite.db"
test_db_file = "./test_suite.db"
if os.path.exists(test_db_file):
    try:
        os.remove(test_db_file)
    except Exception:
        pass

from app.main import app
from app.db.session import Base, engine, SessionLocal
import app.models.models as M
from seed import seed_database

# Initialize database schema and test seeds
seed_database()
client = TestClient(app)

def test_01_authentication_and_roles():
    # Customer registration
    reg = client.post("/api/auth/register", json={
        "name": "Test Customer",
        "phone": "9998887771",
        "password": "password123",
        "role": "CUSTOMER",
        "address": "Gandhipuram"
    })
    assert reg.status_code == 200, reg.text
    token = reg.json()["token"]
    assert token is not None

    # Login with valid credentials
    login = client.post("/api/auth/login", json={
        "phone": "9998887771",
        "password": "password123"
    })
    assert login.status_code == 200
    assert login.json()["role"] == "CUSTOMER"

    # Login with invalid password
    bad_login = client.post("/api/auth/login", json={
        "phone": "9998887771",
        "password": "wrongpassword"
    })
    assert bad_login.status_code == 401

    # Protected me endpoint
    headers = {"Authorization": f"Bearer {token}"}
    me = client.get("/api/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["phone"] == "9998887771"

def test_02_worker_registration_and_admin_verification():
    # Worker registration
    reg_worker = client.post("/api/auth/register", json={
        "name": "Arun Electrician",
        "phone": "9998887772",
        "password": "password123",
        "role": "WORKER",
        "address": "Gandhipuram",
        "experience_years": 4.0
    })
    assert reg_worker.status_code == 200

    # Login as Coop Admin (seeded account)
    admin_login = client.post("/api/auth/login", json={
        "phone": "9000000002",
        "password": "admin123"
    })
    admin_token = admin_login.json()["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Verify worker appears in pending list
    workers = client.get("/api/admin/workers", headers=admin_headers)
    assert workers.status_code == 200
    new_worker = next((w for w in workers.json() if w["phone"] == "9998887772"), None)
    assert new_worker is not None
    assert new_worker["verification_status"] == "PENDING"

    # Admin approves worker verification
    verify_res = client.patch(
        f"/api/admin/workers/{new_worker['id']}/verification",
        json={"status": "VERIFIED", "note": "Trade credentials approved at society office"},
        headers=admin_headers
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["verification_status"] == "VERIFIED"

    # Customer cannot perform admin actions (RBAC enforcement)
    cust_login = client.post("/api/auth/login", json={
        "phone": "9998887771",
        "password": "password123"
    })
    cust_token = cust_login.json()["token"]
    forbidden = client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {cust_token}"})
    assert forbidden.status_code == 403

def test_03_geo_matching_and_explainable_score():
    # Search for electrical service in Gandhipuram
    # Service ID 1 = Fan & light repair
    match_res = client.get(
        "/api/match",
        params={
            "service_id": 1,
            "lat": 11.0168,
            "lng": 76.9558,
            "scheduled_date": "2026-09-20",
            "start_time": "14:00",
            "duration_min": 60
        }
    )
    assert match_res.status_code == 200
    matches = match_res.json()
    assert len(matches) >= 1
    top_match = matches[0]
    assert "distance_km" in top_match
    assert "score" in top_match
    assert len(top_match["reasons"]) >= 3
    assert any("km away" in r for r in top_match["reasons"])

def test_04_booking_creation_and_double_booking_prevention():
    # Customer login
    cust_login = client.post("/api/auth/login", json={"phone": "9998887771", "password": "password123"})
    cust_headers = {"Authorization": f"Bearer {cust_login.json()['token']}"}

    # Match worker
    matches = client.get(
        "/api/match",
        params={
            "service_id": 1,
            "lat": 11.0168,
            "lng": 76.9558,
            "scheduled_date": "2026-09-25",
            "start_time": "10:00"
        }
    ).json()
    worker_id = matches[0]["worker_id"]

    # First booking: 10:00 to 11:00
    b1 = client.post("/api/bookings", json={
        "worker_id": worker_id,
        "service_id": 1,
        "scheduled_date": "2026-09-25",
        "start_time": "10:00",
        "duration_min": 60,
        "lat": 11.0168,
        "lng": 76.9558,
        "address": "Gandhipuram"
    }, headers=cust_headers)
    assert b1.status_code == 200
    booking_id = b1.json()["id"]

    # Overlapping booking attempt: 10:30 to 11:30 (Double booking test)
    b2 = client.post("/api/bookings", json={
        "worker_id": worker_id,
        "service_id": 1,
        "scheduled_date": "2026-09-25",
        "start_time": "10:30",
        "duration_min": 60,
        "lat": 11.0168,
        "lng": 76.9558,
        "address": "Gandhipuram"
    }, headers=cust_headers)
    # Backend MUST reject with 409 Conflict
    assert b2.status_code == 409

    # Non-overlapping booking: 12:00 to 13:00 MUST succeed
    b3 = client.post("/api/bookings", json={
        "worker_id": worker_id,
        "service_id": 1,
        "scheduled_date": "2026-09-25",
        "start_time": "12:00",
        "duration_min": 60,
        "lat": 11.0168,
        "lng": 76.9558,
        "address": "Gandhipuram"
    }, headers=cust_headers)
    assert b3.status_code == 200

def test_05_payment_processing_and_itemized_invoice():
    cust_login = client.post("/api/auth/login", json={"phone": "9998887771", "password": "password123"})
    cust_headers = {"Authorization": f"Bearer {cust_login.json()['token']}"}

    # Get recent booking
    bookings = client.get("/api/bookings", headers=cust_headers).json()
    bid = bookings[0]["id"]

    # Process sandbox payment
    pay = client.post("/api/payments", json={
        "booking_id": bid,
        "succeed": True
    }, headers=cust_headers)
    assert pay.status_code == 200
    assert pay.json()["payment_status"] == "SUCCESS"
    assert pay.json()["is_demo"] is True

    # Check generated itemized invoice
    inv = client.get(f"/api/invoices/{bid}", headers=cust_headers)
    assert inv.status_code == 200
    invoice_data = inv.json()
    assert invoice_data["invoice_no"].startswith("INV-")
    assert len(invoice_data["items"]) >= 2

def test_06_ratings_and_feedback():
    cust_login = client.post("/api/auth/login", json={"phone": "9998887771", "password": "password123"})
    cust_headers = {"Authorization": f"Bearer {cust_login.json()['token']}"}

    bookings = client.get("/api/bookings", headers=cust_headers).json()
    bid = bookings[0]["id"]

    # Rating before completion must fail
    rate_fail = client.post("/api/ratings", json={
        "booking_id": bid,
        "stars": 5,
        "message": "Prompt service"
    }, headers=cust_headers)
    assert rate_fail.status_code == 400

    # Mark booking completed
    client.patch(f"/api/bookings/{bid}?status=COMPLETED", headers=cust_headers)

    # Rate completed booking
    rate_ok = client.post("/api/ratings", json={
        "booking_id": bid,
        "stars": 5,
        "message": "Excellent prompt electrical service by cooperative member!"
    }, headers=cust_headers)
    assert rate_ok.status_code == 200
    assert rate_ok.json()["stars"] == 5

    # Duplicate rating on same booking must be rejected
    rate_dup = client.post("/api/ratings", json={
        "booking_id": bid,
        "stars": 4
    }, headers=cust_headers)
    assert rate_dup.status_code == 400

def test_07_emergency_booking_flow():
    cust_login = client.post("/api/auth/login", json={"phone": "9998887771", "password": "password123"})
    cust_headers = {"Authorization": f"Bearer {cust_login.json()['token']}"}

    # Create emergency request
    em = client.post("/api/emergency-requests", json={
        "service_id": 1,
        "lat": 11.0168,
        "lng": 76.9558,
        "address": "Gandhipuram"
    }, headers=cust_headers)
    assert em.status_code == 200
    res = em.json()
    assert res["candidates_found"] >= 1
    assert "demo_notice" in res

def test_08_ai_forecasting_and_workforce_allocation():
    admin_login = client.post("/api/auth/login", json={"phone": "9000000001", "password": "admin123"})
    admin_headers = {"Authorization": f"Bearer {admin_login.json()['token']}"}

    # Demand forecast uses real 60-day historical data
    fc = client.get("/api/ai/demand-forecast?days=7", headers=admin_headers)
    assert fc.status_code == 200
    fc_data = fc.json()
    assert fc_data["expected_requests"] > 0
    assert fc_data["level"] in ("LOW", "MEDIUM", "HIGH")
    assert "historical_bookings_60d" in fc_data

    # Workforce allocation
    alloc = client.get("/api/ai/workforce-allocation?days=7", headers=admin_headers)
    assert alloc.status_code == 200
    alloc_data = alloc.json()
    assert "recommendation" in alloc_data
    assert "reason" in alloc_data
    assert alloc_data["status"] == "PENDING"
    aid = alloc_data["allocation_id"]

    # Admin approval
    appr = client.post(f"/api/ai/workforce-allocation/{aid}/approve", headers=admin_headers)
    assert appr.status_code == 200
    assert appr.json()["status"] == "APPROVED"

def test_09_natural_language_parser():
    parsed = client.post("/api/ai/parse-request", json={
        "text": "I need an electrician tomorrow at 6 PM near Gandhipuram"
    }).json()
    assert parsed["service"] == "electrician"
    assert parsed["time"] == "18:00"
    assert parsed["location"] == "Gandhipuram"
    assert parsed["lat"] is not None
