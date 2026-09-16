from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.models import (
    Worker, WorkerWelfare, WelfareBenefit, InsuranceRecord,
    InsuranceProvider, Notification, User, Role
)

router = APIRouter()

@router.get("/welfare")
def get_welfare_info(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    benefits = db.query(WelfareBenefit).all()
    b_map = {b.id: {"name": b.name, "description": b.description} for b in benefits}

    worker = db.query(Worker).filter_by(user_id=user.id).first()
    q = db.query(WorkerWelfare)
    if worker:
        q = q.filter_by(worker_id=worker.id)
    elif user.role in (Role.COOP_ADMIN, Role.FED_ADMIN):
        q = q.limit(100)
    else:
        q = q.limit(20)

    enrollments = q.all()
    return {
        "schemes": [
            {"id": b.id, "name": b.name, "description": b.description}
            for b in benefits
        ],
        "enrollments": [
            {
                "id": e.id,
                "worker_id": e.worker_id,
                "benefit_id": e.benefit_id,
                "benefit_name": b_map.get(e.benefit_id, {}).get("name", "Cooperative Welfare"),
                "status": e.status,
                "enrolled_at": str(e.enrolled_at.date() if e.enrolled_at else "")
            }
            for e in enrollments
        ]
    }

@router.get("/insurance")
def get_insurance_info(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    worker = db.query(Worker).filter_by(user_id=user.id).first()
    q = db.query(InsuranceRecord)
    if worker:
        q = q.filter_by(worker_id=worker.id)
    elif user.role in (Role.COOP_ADMIN, Role.FED_ADMIN):
        q = q.limit(100)
    else:
        q = q.limit(20)

    records = q.all()
    out = []
    for r in records:
        provider = db.query(InsuranceProvider).get(r.provider_id) if r.provider_id else None
        out.append({
            "id": r.id,
            "worker_id": r.worker_id,
            "provider_name": provider.name if provider else "Tamil Nadu Labour Welfare Insurance",
            "policy_ref": r.policy_ref,
            "coverage_type": r.coverage_type,
            "status": r.status,
            "effective_date": str(r.effective_date) if r.effective_date else None,
            "expiry_date": str(r.expiry_date) if r.expiry_date else None,
            "is_demo": r.is_demo,
            "demo_notice": "Integration-ready mock insurance architecture. External insurer API not live in demo sandbox."
        })
    return out

@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    notes = db.query(Notification).filter_by(user_id=user.id).order_by(Notification.id.desc()).limit(30).all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "body": n.body,
            "is_read": n.is_read,
            "date": str(n.created_at.strftime("%b %d, %H:%M") if n.created_at else "")
        }
        for n in notes
    ]

@router.patch("/notifications/{nid}/read")
def mark_notification_read(nid: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    note = db.query(Notification).filter_by(id=nid, user_id=user.id).first()
    if note:
        note.is_read = True
        db.commit()
    return {"status": "ok"}
