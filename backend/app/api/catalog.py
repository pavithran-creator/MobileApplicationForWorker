from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Service, ServiceCategory, Skill, Cooperative

router = APIRouter()

@router.get("/services")
def list_services(category_id: int | None = None, db: Session = Depends(get_db)):
    q = db.query(Service)
    if category_id:
        q = q.filter(Service.category_id == category_id)
    out = []
    for s in q.all():
        out.append({
            "id": s.id,
            "name": s.name,
            "description": s.description,
            "category_id": s.category_id,
            "base_price": float(s.base_price or 0),
            "worker_earning": float(s.worker_earning or 0),
            "coop_charge": float(s.coop_charge or 0),
            "requires_certification": s.requires_certification,
            "skill_id": s.skill_id
        })
    return out

@router.get("/services/{sid}")
def get_service(sid: int, db: Session = Depends(get_db)):
    s = db.query(Service).get(sid)
    if not s:
        raise HTTPException(status_code=404, detail="Service not found")
    return {
        "id": s.id,
        "name": s.name,
        "description": s.description,
        "category_id": s.category_id,
        "base_price": float(s.base_price or 0),
        "worker_earning": float(s.worker_earning or 0),
        "coop_charge": float(s.coop_charge or 0),
        "requires_certification": s.requires_certification,
        "skill_id": s.skill_id
    }

@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    cats = db.query(ServiceCategory).all()
    return [{"id": c.id, "name": c.name, "description": c.description} for c in cats]

@router.get("/cooperatives")
def list_cooperatives(db: Session = Depends(get_db)):
    coops = db.query(Cooperative).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "area": c.area,
            "lat": c.lat,
            "lng": c.lng,
            "federation_id": c.federation_id
        }
        for c in coops
    ]

@router.get("/skills")
def list_skills(db: Session = Depends(get_db)):
    skills = db.query(Skill).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "category": s.category,
            "requires_certification": s.requires_certification
        }
        for s in skills
    ]
