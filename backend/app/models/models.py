from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Date, Text,
    ForeignKey, Enum, UniqueConstraint, Index, CheckConstraint, Numeric
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base
import enum

class Role(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    WORKER = "WORKER"
    COOP_ADMIN = "COOP_ADMIN"
    FED_ADMIN = "FED_ADMIN"

class BookingStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    CONFIRMED = "CONFIRMED"
    WORKER_ACCEPTED = "WORKER_ACCEPTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"

class PayStatus(str, enum.Enum):
    PENDING = "PENDING"
    INITIATED = "INITIATED"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class VerifStatus(str, enum.Enum):
    REGISTERED = "REGISTERED"
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class Federation(Base):
    __tablename__ = "federations"
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    region = Column(String(200), default="Tamil Nadu")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    cooperatives = relationship("Cooperative", back_populates="federation")

class Cooperative(Base):
    __tablename__ = "cooperatives"
    id = Column(Integer, primary_key=True)
    federation_id = Column(Integer, ForeignKey("federations.id"))
    name = Column(String(200), nullable=False)
    area = Column(String(200), default="")
    lat = Column(Float, default=11.0168)
    lng = Column(Float, default=76.9558)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    federation = relationship("Federation", back_populates="cooperatives")
    workers = relationship("Worker", back_populates="cooperative")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    phone = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(200), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(Role), nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    customer = relationship("Customer", back_populates="user", uselist=False)
    worker = relationship("Worker", back_populates="user", uselist=False)

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    address = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", back_populates="customer")
    locations = relationship("CustomerLocation", back_populates="customer")

class Worker(Base):
    __tablename__ = "workers"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    cooperative_id = Column(Integer, ForeignKey("cooperatives.id"), index=True)
    address = Column(String(500), default="")
    experience_years = Column(Float, default=0.0)
    verification_status = Column(Enum(VerifStatus), default=VerifStatus.REGISTERED, index=True)
    is_available = Column(Boolean, default=True)
    avg_rating = Column(Float, default=0.0)
    rating_count = Column(Integer, default=0)
    base_lat = Column(Float, default=11.0168)
    base_lng = Column(Float, default=76.9558)
    service_radius_km = Column(Float, default=15.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", back_populates="worker")
    cooperative = relationship("Cooperative", back_populates="workers")
    skills = relationship("WorkerSkill", back_populates="worker", cascade="all,delete-orphan")
    certs = relationship("WorkerCertification", back_populates="worker", cascade="all,delete-orphan")
    services = relationship("WorkerService", back_populates="worker", cascade="all,delete-orphan")
    availability = relationship("WorkerAvailability", back_populates="worker", cascade="all,delete-orphan")
    verifications = relationship("WorkerVerification", back_populates="worker", cascade="all,delete-orphan")

class WorkerVerification(Base):
    __tablename__ = "worker_verifications"
    id = Column(Integer, primary_key=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), index=True)
    from_status = Column(String(40))
    to_status = Column(Enum(VerifStatus))
    actor_id = Column(Integer, ForeignKey("users.id"))
    note = Column(String(500), default="")
    id_proof_type = Column(String(100), default="")
    id_proof_ref = Column(String(200), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    worker = relationship("Worker", back_populates="verifications")

class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True)
    name = Column(String(200), unique=True, nullable=False)
    category = Column(String(200), default="")
    requires_certification = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class WorkerSkill(Base):
    __tablename__ = "worker_skills"
    id = Column(Integer, primary_key=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"))
    level = Column(String(50), default="intermediate")
    experience_years = Column(Float, default=0.0)
    __table_args__ = (UniqueConstraint("worker_id", "skill_id"),)
    worker = relationship("Worker", back_populates="skills")
    skill = relationship("Skill")

class Certification(Base):
    __tablename__ = "certifications"
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    issuer = Column(String(200), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

class WorkerCertification(Base):
    __tablename__ = "worker_certifications"
    id = Column(Integer, primary_key=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), index=True)
    certification_id = Column(Integer, ForeignKey("certifications.id"))
    cert_number = Column(String(200), default="")
    issuer = Column(String(200), default="")
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    verification_status = Column(String(40), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    worker = relationship("Worker", back_populates="certs")
    certification = relationship("Certification")

class ServiceCategory(Base):
    __tablename__ = "service_categories"
    id = Column(Integer, primary_key=True)
    name = Column(String(200), unique=True)
    description = Column(String(500), default="")

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("service_categories.id"))
    name = Column(String(200), nullable=False)
    description = Column(String(500), default="")
    base_price = Column(Numeric(10, 2), default=0.0)
    worker_earning = Column(Numeric(10, 2), default=0.0)
    coop_charge = Column(Numeric(10, 2), default=0.0)
    requires_certification = Column(Boolean, default=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class WorkerService(Base):
    __tablename__ = "worker_services"
    id = Column(Integer, primary_key=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), index=True)
    service_id = Column(Integer, ForeignKey("services.id"))
    price_override = Column(Numeric(10, 2), nullable=True)
    __table_args__ = (UniqueConstraint("worker_id", "service_id"),)
    worker = relationship("Worker", back_populates="services")

class WorkerAvailability(Base):
    __tablename__ = "worker_availability"
    id = Column(Integer, primary_key=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), index=True)
    weekday = Column(Integer)
    start_time = Column(String(5))
    end_time = Column(String(5))
    worker = relationship("Worker", back_populates="availability")

class WorkerLocation(Base):
    __tablename__ = "worker_locations"
    id = Column(Integer, primary_key=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), index=True)
    lat = Column(Float)
    lng = Column(Float)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CustomerLocation(Base):
    __tablename__ = "customer_locations"
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), index=True)
    label = Column(String(200), default="home")
    lat = Column(Float)
    lng = Column(Float)
    address = Column(String(500), default="")
    customer = relationship("Customer", back_populates="locations")

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), index=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), index=True)
    service_id = Column(Integer, ForeignKey("services.id"))
    scheduled_date = Column(Date, nullable=False)
    start_time = Column(String(5), nullable=False)
    duration_min = Column(Integer, default=60)
    lat = Column(Float, default=0.0)
    lng = Column(Float, default=0.0)
    address = Column(String(500), default="")
    description = Column(String(1000), default="")
    status = Column(Enum(BookingStatus), default=BookingStatus.REQUESTED, index=True)
    is_emergency = Column(Boolean, default=False)
    service_amount = Column(Numeric(10, 2), default=0.0)
    coop_charge = Column(Numeric(10, 2), default=0.0)
    total_amount = Column(Numeric(10, 2), default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    __table_args__ = (Index("ix_booking_worker_slot", "worker_id", "scheduled_date", "start_time"),)

class BookingStatusHistory(Base):
    __tablename__ = "booking_status_history"
    id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), index=True)
    from_status = Column(String(40))
    to_status = Column(String(40))
    actor_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    service_id = Column(Integer, ForeignKey("services.id"))
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    lat = Column(Float)
    lng = Column(Float)
    status = Column(String(40), default="OPEN")
    created_at = Column(DateTime, default=datetime.utcnow)

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True)
    amount = Column(Numeric(10, 2))
    provider = Column(String(50), default="mock")
    provider_ref = Column(String(200), default="")
    status = Column(Enum(PayStatus), default=PayStatus.PENDING)
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True)
    invoice_no = Column(String(50), unique=True)
    total = Column(Numeric(10, 2))
    payment_status = Column(String(40), default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)

class InvoiceItem(Base):
    __tablename__ = "invoice_items"
    id = Column(Integer, primary_key=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    label = Column(String(300))
    amount = Column(Numeric(10, 2))

class Rating(Base):
    __tablename__ = "ratings"
    id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    stars = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    __table_args__ = (CheckConstraint("stars>=1 AND stars<=5"),)

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"))
    worker_id = Column(Integer, ForeignKey("workers.id"))
    customer_id = Column(Integer, ForeignKey("customers.id"))
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class WelfareBenefit(Base):
    __tablename__ = "welfare_benefits"
    id = Column(Integer, primary_key=True)
    name = Column(String(200))
    description = Column(String(500), default="")

class WorkerWelfare(Base):
    __tablename__ = "worker_welfare_enrollments"
    id = Column(Integer, primary_key=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), index=True)
    benefit_id = Column(Integer, ForeignKey("welfare_benefits.id"))
    status = Column(String(40), default="enrolled")
    enrolled_at = Column(DateTime, default=datetime.utcnow)

class InsuranceProvider(Base):
    __tablename__ = "insurance_providers"
    id = Column(Integer, primary_key=True)
    name = Column(String(200))
    mode = Column(String(40), default="mock")

class InsuranceRecord(Base):
    __tablename__ = "insurance_records"
    id = Column(Integer, primary_key=True)
    worker_id = Column(Integer, ForeignKey("workers.id"), index=True)
    provider_id = Column(Integer, ForeignKey("insurance_providers.id"))
    policy_ref = Column(String(200), default="")
    coverage_type = Column(String(200), default="")
    status = Column(String(40), default="active")
    effective_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    is_demo = Column(Boolean, default=True)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    title = Column(String(300))
    body = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Complaint(Base):
    __tablename__ = "complaints"
    id = Column(Integer, primary_key=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    raised_by = Column(Integer, ForeignKey("users.id"))
    message = Column(Text)
    status = Column(String(40), default="OPEN")
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True)
    actor_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String(200))
    target = Column(String(300), default="")
    meta = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

class DemandForecast(Base):
    __tablename__ = "demand_forecasts"
    id = Column(Integer, primary_key=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("service_categories.id"), nullable=True)
    area = Column(String(200), default="")
    period = Column(String(100))
    expected_requests = Column(Integer)
    level = Column(String(20))
    mode = Column(String(60))
    created_at = Column(DateTime, default=datetime.utcnow)

class AllocationRecommendation(Base):
    __tablename__ = "workforce_allocation_recommendations"
    id = Column(Integer, primary_key=True)
    forecast_id = Column(Integer, ForeignKey("demand_forecasts.id"), nullable=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True)
    area = Column(String(200), default="")
    expected_demand = Column(Integer, default=0)
    available_workers = Column(Integer, default=0)
    shortage = Column(Integer, default=0)
    recommendation = Column(Text)
    reason = Column(Text)
    status = Column(String(40), default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)
