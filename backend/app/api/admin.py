from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field
from app.db.session import get_db
from app.core.deps import require_roles
from app.models.models import (
    Worker, Booking, BookingStatus, VerifStatus, WorkerVerification,
    AuditLog, Payment, Rating, EmergencyRequest, Cooperative, User
)

router = APIRouter()
AdminGuard = Depends(require_roles("COOP_ADMIN", "FED_ADMIN"))

@router.get("/dashboard")
def get_dashboard_kpis(db: Session = Depends(get_db), admin: User = AdminGuard):
    total_workers = db.query(Worker).count()
    verified_workers = db.query(Worker).filter_by(verification_status=VerifStatus.VERIFIED).count()
    pending_workers = db.query(Worker).filter(
        Worker.verification_status.in_([VerifStatus.REGISTERED, VerifStatus.PENDING, VerifStatus.UNDER_REVIEW])
    ).count()
    available_workers = db.query(Worker).filter_by(is_available=True).count()
    
    active_bookings = db.query(Booking).filter(
        Booking.status.in_([
            BookingStatus.REQUESTED,
            BookingStatus.CONFIRMED,
            BookingStatus.WORKER_ACCEPTED,
            BookingStatus.IN_PROGRESS
        ])
    ).count()
    completed_bookings = db.query(Booking).filter_by(status=BookingStatus.COMPLETED).count()
    emergency_open = db.query(EmergencyRequest).filter_by(status="OPEN").count()

    total_revenue = db.query(func.coalesce(func.sum(Payment.amount), 0.0)).filter(Payment.status == "SUCCESS").scalar()
    avg_rating = db.query(func.coalesce(func.avg(Rating.stars), 4.5)).scalar()

    return {
        "total_workers": total_workers,
        "verified_workers": verified_workers,
        "pending_verification": pending_workers,
        "available_workers": available_workers,
        "active_bookings": active_bookings,
        "completed_bookings": completed_bookings,
        "emergency_requests_open": emergency_open,
        "total_revenue": round(float(total_revenue), 2),
        "avg_platform_rating": round(float(avg_rating), 1)
    }

@router.get("/workers")
def get_admin_workers(status: str | None = None, db: Session = Depends(get_db), admin: User = AdminGuard):
    q = db.query(Worker)
    if status:
        q = q.filter(Worker.verification_status == status)
    
    workers = q.order_by(Worker.id.asc()).all()
    out = []
    for w in workers:
        skills = [s.skill.name for s in w.skills if s.skill]
        certs = [c.cert_number for c in w.certs]
        out.append({
            "id": w.id,
            "name": w.user.name if w.user else f"Worker #{w.id}",
            "phone": w.user.phone if w.user else "",
            "cooperative": w.cooperative.name if w.cooperative else "Cooperative",
            "cooperative_id": w.cooperative_id,
            "verification_status": w.verification_status.value,
            "is_available": w.is_available,
            "avg_rating": w.avg_rating or 0.0,
            "rating_count": w.rating_count or 0,
            "experience_years": w.experience_years or 0.0,
            "address": w.address or "",
            "skills": skills,
            "certifications": certs,
            "created_at": str(w.created_at.date() if w.created_at else "")
        })
    return out

class VerifyWorkerRequest(BaseModel):
    status: str = Field(..., description="VERIFIED, REJECTED, UNDER_REVIEW, or PENDING")
    note: str = ""
    id_proof_type: str = "Aadhaar / Labour Card"
    id_proof_ref: str = ""

@router.patch("/workers/{wid}/verification")
def verify_worker(wid: int, req: VerifyWorkerRequest, db: Session = Depends(get_db), admin: User = AdminGuard):
    worker = db.get(Worker, wid)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    try:
        new_status = VerifStatus(req.status)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid verification status. Must be in {[s.value for s in VerifStatus]}")

    old_status = worker.verification_status.value
    worker.verification_status = new_status

    # Record verification history
    db.add(WorkerVerification(
        worker_id=worker.id,
        from_status=old_status,
        to_status=new_status,
        actor_id=admin.id,
        note=req.note or f"Status changed by admin {admin.name}",
        id_proof_type=req.id_proof_type,
        id_proof_ref=req.id_proof_ref
    ))

    # Audit log
    db.add(AuditLog(
        actor_id=admin.id,
        action="worker.verification.update",
        target=f"worker:{wid}",
        meta=f"{old_status} -> {new_status.value} (Note: {req.note})"
    ))

    db.commit()
    return {
        "worker_id": worker.id,
        "verification_status": new_status.value,
        "previous_status": old_status
    }

@router.get("/audit-logs")
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db), admin: User = AdminGuard):
    logs = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(limit).all()
    out = []
    for l in logs:
        actor = db.query(User).get(l.actor_id)
        out.append({
            "id": l.id,
            "actor_id": l.actor_id,
            "actor_name": actor.name if actor else "System",
            "action": l.action,
            "target": l.target,
            "meta": l.meta,
            "timestamp": str(l.created_at.strftime("%Y-%m-%d %H:%M:%S") if l.created_at else "")
        })
    return out

@router.get("/reports")
def get_reports(db: Session = Depends(get_db), admin: User = AdminGuard):
    by_status = db.query(Booking.status, func.count()).group_by(Booking.status).all()
    total_payments = db.query(func.coalesce(func.sum(Payment.amount), 0.0)).filter(Payment.status == "SUCCESS").scalar()
    
    return {
        "bookings_by_status": [{str(k.value if hasattr(k, "value") else k): v} for k, v in by_status],
        "total_revenue": float(total_payments or 0.0),
        "cooperatives": [
            {"id": c.id, "name": c.name, "workers": len(c.workers)}
            for c in db.query(Cooperative).all()
        ]
    }
