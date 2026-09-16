from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date, datetime
from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.models import Customer, EmergencyRequest, Booking, BookingStatus, Service, Worker, Notification, User
from app.services.matching import match_workers

router = APIRouter()

class EmergencyCreateRequest(BaseModel):
    service_id: int
    lat: float = 11.0168
    lng: float = 76.9558
    address: str = "Gandhipuram, Coimbatore"
    description: str = "Urgent service required immediately"

@router.post("/emergency-requests")
def create_emergency_request(req: EmergencyCreateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    customer = db.query(Customer).filter_by(user_id=user.id).first()
    if not customer:
        raise HTTPException(status_code=403, detail="Only customer accounts can make emergency requests")

    # Current time for emergency check
    now_time = datetime.now().strftime("%H:%M")
    candidates = match_workers(db, req.service_id, req.lat, req.lng, date.today(), now_time, 60, limit=5)

    if not candidates:
        raise HTTPException(
            status_code=404,
            detail="No verified worker currently available for this emergency request in your radius."
        )

    er = EmergencyRequest(
        customer_id=customer.id,
        service_id=req.service_id,
        lat=req.lat,
        lng=req.lng,
        status="OPEN"
    )
    db.add(er)
    db.commit()

    service = db.get(Service, req.service_id)

    return {
        "emergency_id": er.id,
        "service_name": service.name if service else "Emergency Service",
        "candidates_found": len(candidates),
        "candidates": candidates,
        "mode": "REAL_DATABASE_AVAILABILITY",
        "demo_notice": "Real-time query against active database workers. No fake ETA invented."
    }

class DispatchRequest(BaseModel):
    worker_id: int
    address: str = "Gandhipuram, Coimbatore"

@router.post("/emergency-requests/{eid}/dispatch")
def dispatch_emergency_worker(eid: int, req: DispatchRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    er = db.query(EmergencyRequest).get(eid)
    if not er:
        raise HTTPException(status_code=404, detail="Emergency request not found")

    worker = db.query(Worker).get(req.worker_id)
    if not worker or worker.verification_status.value != "VERIFIED":
        raise HTTPException(status_code=400, detail="Worker unavailable or not verified")

    service = db.query(Service).get(er.service_id)
    base_price = float(service.base_price) if service and service.base_price else 0.0
    coop_charge = float(service.coop_charge) if service and service.coop_charge else 0.0
    total_amount = base_price + coop_charge

    now_time = datetime.now().strftime("%H:%M")
    booking = Booking(
        customer_id=er.customer_id,
        worker_id=worker.id,
        service_id=er.service_id,
        scheduled_date=date.today(),
        start_time=now_time,
        duration_min=60,
        lat=er.lat,
        lng=er.lng,
        address=req.address,
        description="[EMERGENCY ON-DEMAND DISPATCH]",
        is_emergency=True,
        status=BookingStatus.WORKER_ACCEPTED,
        service_amount=base_price,
        coop_charge=coop_charge,
        total_amount=total_amount
    )
    db.add(booking)
    db.flush()

    er.booking_id = booking.id
    er.status = "DISPATCHED"

    db.add(Notification(
        user_id=worker.user_id,
        title="EMERGENCY JOB DISPATCHED",
        body=f"Urgent emergency job #{booking.id} assigned to you at {req.address}."
    ))

    db.commit()
    return {
        "booking_id": booking.id,
        "emergency_id": er.id,
        "status": "DISPATCHED",
        "worker_name": worker.user.name if worker.user else "Worker",
        "worker_phone": worker.user.phone if worker.user else ""
    }
