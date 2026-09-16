from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from datetime import date
from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.models import (
    Worker, WorkerSkill, WorkerCertification, WorkerService,
    WorkerAvailability, User, Skill, Certification, VerifStatus
)
from app.services.matching import match_workers

router = APIRouter()

@router.get("/workers")
def list_workers(cooperative_id: int | None = None, db: Session = Depends(get_db)):
    q = db.query(Worker)
    if cooperative_id:
        q = q.filter(Worker.cooperative_id == cooperative_id)
    out = []
    for w in q.all():
        skills = [s.skill.name for s in w.skills if s.skill]
        out.append({
            "id": w.id,
            "name": w.user.name if w.user else f"Worker #{w.id}",
            "phone": w.user.phone if w.user else "",
            "cooperative_name": w.cooperative.name if w.cooperative else "Cooperative",
            "cooperative_id": w.cooperative_id,
            "verification_status": w.verification_status.value,
            "is_available": w.is_available,
            "avg_rating": w.avg_rating or 0.0,
            "rating_count": w.rating_count or 0,
            "experience_years": w.experience_years or 0.0,
            "skills": skills,
            "base_lat": w.base_lat,
            "base_lng": w.base_lng,
            "service_radius_km": w.service_radius_km
        })
    return out

@router.get("/match")
@router.get("/workers/match")
def match(
    service_id: int,
    lat: float = 11.0168,
    lng: float = 76.9558,
    scheduled_date: date | None = None,
    start_time: str | None = None,
    duration_min: int = 60,
    db: Session = Depends(get_db)
):
    if not scheduled_date:
        from datetime import date as dt_date, timedelta
        scheduled_date = dt_date.today() + timedelta(days=1)
    if not start_time:
        start_time = "10:00"
    return match_workers(db, service_id, lat, lng, scheduled_date, start_time, duration_min)

@router.get("/workers/{wid}")
def get_worker(wid: int, db: Session = Depends(get_db)):
    w = db.query(Worker).get(wid)
    if not w:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    skills = [
        {
            "id": s.id,
            "skill_id": s.skill_id,
            "name": s.skill.name if s.skill else "",
            "level": s.level,
            "experience_years": s.experience_years
        }
        for s in w.skills
    ]

    certs = [
        {
            "id": c.id,
            "name": c.certification.name if c.certification else (c.cert_number or "Trade Certificate"),
            "cert_number": c.cert_number,
            "issuer": c.issuer or (c.certification.issuer if c.certification else ""),
            "verification_status": c.verification_status,
            "expiry_date": str(c.expiry_date) if c.expiry_date else None
        }
        for c in w.certs
    ]

    services = [s.service_id for s in w.services]

    return {
        "id": w.id,
        "name": w.user.name if w.user else f"Worker #{w.id}",
        "phone": w.user.phone if w.user else "",
        "cooperative_name": w.cooperative.name if w.cooperative else "",
        "verification_status": w.verification_status.value,
        "is_available": w.is_available,
        "avg_rating": w.avg_rating or 0.0,
        "rating_count": w.rating_count or 0,
        "experience_years": w.experience_years or 0.0,
        "address": w.address or "",
        "skills": skills,
        "certifications": certs,
        "services": services
    }

class AvailabilityRequest(BaseModel):
    weekday: int = Field(..., ge=0, le=6)
    start_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")
    end_time: str = Field(..., pattern=r"^\d{2}:\d{2}$")

@router.post("/workers/me/availability")
def set_availability(req: AvailabilityRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    worker = db.query(Worker).filter_by(user_id=user.id).first()
    if not worker:
        raise HTTPException(status_code=403, detail="Only worker accounts can update availability")
    
    avail = WorkerAvailability(
        worker_id=worker.id,
        weekday=req.weekday,
        start_time=req.start_time,
        end_time=req.end_time
    )
    db.add(avail)
    db.commit()
    return {"status": "success", "message": "Availability schedule updated"}

class AddSkillRequest(BaseModel):
    skill_name: str
    category: str = ""
    level: str = "intermediate"
    experience_years: float = 1.0

@router.post("/workers/me/skills")
def add_skill(req: AddSkillRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    worker = db.query(Worker).filter_by(user_id=user.id).first()
    if not worker:
        raise HTTPException(status_code=403, detail="Only workers can update skills")
    
    skill = db.query(Skill).filter(Skill.name.ilike(req.skill_name.strip())).first()
    if not skill:
        skill = Skill(name=req.skill_name.strip(), category=req.category)
        db.add(skill)
        db.flush()

    existing = db.query(WorkerSkill).filter_by(worker_id=worker.id, skill_id=skill.id).first()
    if existing:
        existing.level = req.level
        existing.experience_years = req.experience_years
    else:
        db.add(WorkerSkill(
            worker_id=worker.id,
            skill_id=skill.id,
            level=req.level,
            experience_years=req.experience_years
        ))
    db.commit()
    return {"status": "success", "message": f"Skill '{skill.name}' updated on profile"}

class AddCertRequest(BaseModel):
    cert_name: str
    cert_number: str = ""
    issuer: str = "State Board / ITI"

@router.post("/workers/me/certifications")
def add_certification(req: AddCertRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    worker = db.query(Worker).filter_by(user_id=user.id).first()
    if not worker:
        raise HTTPException(status_code=403, detail="Only workers can add certifications")
    
    cert = db.query(Certification).filter(Certification.name.ilike(req.cert_name.strip())).first()
    if not cert:
        cert = Certification(name=req.cert_name.strip(), issuer=req.issuer)
        db.add(cert)
        db.flush()

    w_cert = WorkerCertification(
        worker_id=worker.id,
        certification_id=cert.id,
        cert_number=req.cert_number,
        issuer=req.issuer,
        verification_status="pending"
    )
    db.add(w_cert)
    db.commit()
    return {"status": "success", "message": "Certification submitted for cooperative verification"}
