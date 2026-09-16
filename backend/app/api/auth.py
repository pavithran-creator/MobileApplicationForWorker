from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.db.session import get_db
from app.models.models import (
    User, Customer, Worker, Cooperative, Role, VerifStatus,
    Skill, WorkerSkill, Service, WorkerService, WelfareBenefit,
    WorkerWelfare, InsuranceRecord, InsuranceProvider
)
from app.core.config import settings
from app.core.security import hash_password, verify_password, create_token
from app.core.deps import get_current_user

router = APIRouter()

class RegisterRequest(BaseModel):
    name: str = Field("Cooperative Member", min_length=1)
    phone: str = Field(..., min_length=6, max_length=25)
    password: str = Field(..., min_length=4)
    role: str = "CUSTOMER"
    email: str | None = None
    cooperative_id: int | None = None
    address: str = ""
    trade: str = ""
    experience_years: float | None = 2.0

class LoginRequest(BaseModel):
    phone: str
    password: str

@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    clean_phone = "".join(filter(lambda c: c.isdigit() or c == "+", req.phone.strip()))
    if not clean_phone:
        clean_phone = req.phone.strip()

    if db.query(User).filter_by(phone=clean_phone).first():
        raise HTTPException(status_code=400, detail="Phone number is already registered")
    
    try:
        user_role = Role(req.role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of {[r.value for r in Role]}")

    user = User(
        name=req.name,
        phone=clean_phone,
        email=req.email,
        password_hash=hash_password(req.password),
        role=user_role
    )
    db.add(user)
    db.flush()

    worker_id = None
    customer_id = None

    if user_role == Role.CUSTOMER:
        customer = Customer(user_id=user.id, address=req.address or "Coimbatore")
        db.add(customer)
        db.flush()
        customer_id = customer.id
    elif user_role == Role.WORKER:
        coop = None
        if req.cooperative_id:
            coop = db.get(Cooperative, req.cooperative_id)
        if not coop:
            coop = db.query(Cooperative).first()
        coop_id = coop.id if coop else None
        
        verif_status = VerifStatus.PENDING

        worker = Worker(
            user_id=user.id,
            cooperative_id=coop_id,
            address=req.address or "Coimbatore",
            experience_years=req.experience_years,
            verification_status=verif_status,
            is_available=True,
            base_lat=coop.lat if coop else 11.0168,
            base_lng=coop.lng if coop else 76.9558,
            service_radius_km=20.0,
            avg_rating=4.8,
            rating_count=1
        )
        db.add(worker)
        db.flush()
        worker_id = worker.id

        # Attach craft skill and related services
        trade_name = req.trade.strip() if req.trade else "Electrical repair"
        skill = db.query(Skill).filter(Skill.name.ilike(trade_name)).first()
        if not skill:
            skill = Skill(name=trade_name, category="Trade Craft")
            db.add(skill)
            db.flush()

        db.add(WorkerSkill(
            worker_id=worker.id,
            skill_id=skill.id,
            level="expert" if req.experience_years >= 3 else "intermediate",
            experience_years=req.experience_years
        ))

        # Link any existing catalog service linked to this skill
        services = db.query(Service).filter_by(skill_id=skill.id).all()
        if not services:
            services = db.query(Service).filter(Service.name.ilike(f"%{trade_name.split()[0]}%")).all()
        for svc in services:
            db.add(WorkerService(worker_id=worker.id, service_id=svc.id))

        # Enroll in basic welfare & insurance cover
        first_benefit = db.query(WelfareBenefit).first()
        if first_benefit:
            db.add(WorkerWelfare(worker_id=worker.id, benefit_id=first_benefit.id, status="ACTIVE"))

        first_provider = db.query(InsuranceProvider).first()
        db.add(InsuranceRecord(
            worker_id=worker.id,
            provider_id=first_provider.id if first_provider else None,
            policy_ref=f"POL-TN-2026-{worker.id:04d}",
            coverage_type="Accident & Health Cover",
            status="ACTIVE",
            is_demo=True
        ))

    db.commit()
    token = create_token(str(user.id), user.role.value)
    return {
        "id": user.id,
        "name": user.name,
        "phone": user.phone,
        "role": user.role.value,
        "token": token,
        "worker_id": worker_id,
        "customer_id": customer_id
    }

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(phone=req.phone).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid phone number or password")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_token(str(user.id), user.role.value)
    resp = {
        "token": token,
        "role": user.role.value,
        "user_id": user.id,
        "name": user.name
    }
    if user.role == Role.CUSTOMER and user.customer:
        resp["customer_id"] = user.customer.id
    elif user.role == Role.WORKER and user.worker:
        resp["worker_id"] = user.worker.id
    return resp

@router.get("/me")
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = {
        "id": user.id,
        "name": user.name,
        "phone": user.phone,
        "email": user.email,
        "role": user.role.value,
        "created_at": str(user.created_at)
    }
    if user.role == Role.CUSTOMER and user.customer:
        res["customer_id"] = user.customer.id
        res["address"] = user.customer.address
    elif user.role == Role.WORKER and user.worker:
        res["worker_id"] = user.worker.id
        res["verification_status"] = user.worker.verification_status.value
        res["cooperative"] = user.worker.cooperative.name if user.worker.cooperative else ""
        res["avg_rating"] = user.worker.avg_rating
        res["rating_count"] = user.worker.rating_count
        res["experience_years"] = user.worker.experience_years
    return res
