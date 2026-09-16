from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.core.deps import get_current_user, require_roles
from app.services.forecast import forecast
from app.services.nl_parser import parse
from app.models.models import DemandForecast, AllocationRecommendation, AuditLog, Service, User

router = APIRouter()
AdminGuard = Depends(require_roles("COOP_ADMIN", "FED_ADMIN"))

@router.get("/demand-forecast")
def get_demand_forecast(
    service_id: int | None = None,
    area: str = "Coimbatore Zone",
    days: int = 7,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    result = forecast(db, service_id, area, days)

    # Persist the forecast record in MySQL/SQLite
    fc_record = DemandForecast(
        service_id=service_id,
        area=result["area"],
        period=f"{days}d",
        expected_requests=result["expected_requests"],
        level=result["level"],
        mode=result["mode"]
    )
    db.add(fc_record)
    db.commit()

    service_name = "All Trade Services"
    if service_id:
        svc = db.get(Service, service_id)
        if svc:
            service_name = svc.name

    result["service_name"] = service_name
    result["forecast_id"] = fc_record.id
    return result

@router.get("/workforce-allocation")
def get_workforce_allocation(
    service_id: int | None = None,
    area: str = "Gandhipuram & Peelamedu",
    days: int = 7,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    fc = forecast(db, service_id, area, days)
    shortage = fc["shortage"]

    service_name = "Electrician / General Trades"
    if service_id:
        svc = db.get(Service, service_id)
        if svc:
            service_name = svc.name

    if shortage > 0:
        recommended_count = min(shortage, 5)
        recommendation = (
            f"Predicted {fc['level']} demand of {fc['expected_requests']} requests against "
            f"{fc['available_verified_workers']} available local verified workers. "
            f"Recommend temporarily mobilizing {recommended_count} verified {service_name} workers "
            f"from neighboring RS Puram / Singanallur societies to prevent fulfillment bottlenecks."
        )
        reason = f"Workforce deficit of {shortage} verified workers during projected {days}-day service surge."
    else:
        recommendation = (
            f"Local workforce of {fc['available_verified_workers']} verified workers is sufficient "
            f"to meet predicted demand of {fc['expected_requests']} requests. No cross-society reallocation needed."
        )
        reason = "Available local cooperative workers comfortably exceed projected demand."

    alloc_record = AllocationRecommendation(
        service_id=service_id,
        area=area,
        expected_demand=fc["expected_requests"],
        available_workers=fc["available_verified_workers"],
        shortage=shortage,
        recommendation=recommendation,
        reason=reason,
        status="PENDING"
    )
    db.add(alloc_record)
    db.commit()

    return {
        "allocation_id": alloc_record.id,
        "service_name": service_name,
        "area": area,
        "expected_demand": fc["expected_requests"],
        "available_workers": fc["available_verified_workers"],
        "shortage": shortage,
        "recommendation": recommendation,
        "reason": reason,
        "status": "PENDING",
        "governance_rule": "Administrative approval strictly required. AI will never auto-assign or move workers without human consent."
    }

@router.get("/recommendations")
def list_recommendations(limit: int = 20, db: Session = Depends(get_db), admin: User = AdminGuard):
    recs = db.query(AllocationRecommendation).order_by(AllocationRecommendation.id.desc()).limit(limit).all()
    out = []
    for r in recs:
        svc = db.query(Service).get(r.service_id) if r.service_id else None
        out.append({
            "id": r.id,
            "service_name": svc.name if svc else "All Services",
            "area": r.area,
            "expected_demand": r.expected_demand,
            "available_workers": r.available_workers,
            "shortage": r.shortage,
            "recommendation": r.recommendation,
            "reason": r.reason,
            "status": r.status,
            "created_at": str(r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else "")
        })
    return out

@router.post("/workforce-allocation/{aid}/approve")
def approve_allocation(aid: int, db: Session = Depends(get_db), admin: User = AdminGuard):
    rec = db.get(AllocationRecommendation, aid)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec.status = "APPROVED"
    db.add(AuditLog(
        actor_id=admin.id,
        action="ai.allocation.approved",
        target=f"allocation:{aid}",
        meta=f"Approved by admin {admin.name} ({admin.role.value})"
    ))
    db.commit()
    return {"id": aid, "status": "APPROVED", "message": "Workforce allocation recommendation approved by cooperative admin"}

@router.post("/workforce-allocation/{aid}/reject")
def reject_allocation(aid: int, db: Session = Depends(get_db), admin: User = AdminGuard):
    rec = db.get(AllocationRecommendation, aid)
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    rec.status = "REJECTED"
    db.add(AuditLog(
        actor_id=admin.id,
        action="ai.allocation.rejected",
        target=f"allocation:{aid}",
        meta=f"Rejected by admin {admin.name}"
    ))
    db.commit()
    return {"id": aid, "status": "REJECTED", "message": "Workforce allocation recommendation declined"}

class NLParseRequest(BaseModel):
    text: str

@router.post("/parse-request")
def parse_natural_language_request(req: NLParseRequest):
    return parse(req.text)
