from sqlalchemy.orm import Session
from app.models.models import Worker, WorkerSkill, WorkerService, Service, Booking, BookingStatus, WorkerCertification
from app.geo.haversine import km

WEIGHTS = {
    "skill": 35,
    "availability": 20,
    "distance": 20,
    "verification": 10,
    "certification": 5,
    "rating": 10
}

def overlaps(a_start: str, a_dur: int, b_start: str, b_dur: int) -> bool:
    def to_minutes(t_str: str) -> int:
        h, mi = map(int, t_str.split(":"))
        return h * 60 + mi
    s1, e1 = to_minutes(a_start), to_minutes(a_start) + a_dur
    s2, e2 = to_minutes(b_start), to_minutes(b_start) + b_dur
    return max(s1, s2) < min(e1, e2)

def worker_free(db: Session, worker_id: int, date_val, start: str, dur: int, exclude_booking: int | None = None) -> bool:
    q = db.query(Booking).filter(
        Booking.worker_id == worker_id,
        Booking.scheduled_date == date_val,
        Booking.status.in_([
            BookingStatus.REQUESTED,
            BookingStatus.CONFIRMED,
            BookingStatus.WORKER_ACCEPTED,
            BookingStatus.IN_PROGRESS
        ])
    )
    if exclude_booking:
        q = q.filter(Booking.id != exclude_booking)
    for b in q.all():
        if overlaps(start, dur, b.start_time, b.duration_min):
            return False
    return True

def match_workers(db: Session, service_id: int, lat: float, lng: float, date_val, start: str, dur: int = 60, limit: int = 10):
    svc = db.get(Service, service_id)
    if not svc:
        return []
    out = []
    
    # Query all active available workers
    for w in db.query(Worker).filter(Worker.is_available == True).all():
        # Only verified workers are eligible
        if w.verification_status.value != "VERIFIED":
            continue

        # Check skill or offered service
        offers = db.query(WorkerService).filter_by(worker_id=w.id, service_id=service_id).first()
        has_skill = False
        if svc.skill_id:
            has_skill = db.query(WorkerSkill).filter_by(worker_id=w.id, skill_id=svc.skill_id).first() is not None
        else:
            has_skill = offers is not None

        if not has_skill and not offers:
            continue

        # Check certification requirement
        if svc.requires_certification:
            cert_ok = db.query(WorkerCertification).filter(
                WorkerCertification.worker_id == w.id,
                WorkerCertification.verification_status == "verified"
            ).first()
            if not cert_ok:
                continue

        # Check schedule availability
        if not worker_free(db, w.id, date_val, start, dur):
            continue

        # Check geographic distance
        w_lat = w.base_lat if w.base_lat is not None else 11.0168
        w_lng = w.base_lng if w.base_lng is not None else 76.9558
        d = km(lat, lng, w_lat, w_lng)
        max_rad = w.service_radius_km if w.service_radius_km else 15.0
        if d > max_rad:
            continue

        # Calculate explainable score
        score = 35 + 20  # Skill match + availability match
        score += max(0.0, 20.0 - (d / max_rad) * 20.0)  # Proximity score (0-20)
        score += 10.0  # Cooperative verified score
        if svc.requires_certification:
            score += 5.0  # Certified trade qualification
        score += min(10.0, ((w.avg_rating or 0.0) / 5.0) * 10.0)  # Rating score (0-10)

        reasons = [
            "Required trade skill matches",
            "Schedule slot available (no conflicts)",
            f"{d:.1f} km away (within {max_rad:.0f} km service zone)",
            "Labour Cooperative verified worker"
        ]
        if svc.requires_certification:
            reasons.append("Official trade certification verified")
        if w.avg_rating and w.avg_rating > 0:
            reasons.append(f"{w.avg_rating:.1f} ★ verified customer rating ({w.rating_count} jobs)")

        out.append({
            "worker_id": w.id,
            "name": w.user.name if w.user else f"Worker #{w.id}",
            "phone": w.user.phone if w.user else "",
            "cooperative_name": w.cooperative.name if w.cooperative else "Labour Cooperative",
            "score": round(score, 1),
            "distance_km": round(d, 1),
            "avg_rating": w.avg_rating or 0.0,
            "rating_count": w.rating_count or 0,
            "experience_years": w.experience_years or 0.0,
            "reasons": reasons
        })

    if out:
        return sorted(out, key=lambda x: -x["score"])[:limit]

    # State-wide Federation Dispatch Fallback:
    # If no local cooperative society worker is within immediate radius, dispatch certified tradespersons from nearest Federation Hub
    candidates = []
    for w in db.query(Worker).filter(Worker.is_available == True).all():
        if w.verification_status.value != "VERIFIED":
            continue
        offers = db.query(WorkerService).filter_by(worker_id=w.id, service_id=service_id).first()
        has_skill = False
        if svc.skill_id:
            has_skill = db.query(WorkerSkill).filter_by(worker_id=w.id, skill_id=svc.skill_id).first() is not None
        else:
            has_skill = offers is not None

        if not has_skill and not offers:
            continue

        if svc.requires_certification:
            cert_ok = db.query(WorkerCertification).filter(
                WorkerCertification.worker_id == w.id,
                WorkerCertification.verification_status == "verified"
            ).first()
            if not cert_ok:
                continue

        if not worker_free(db, w.id, date_val, start, dur):
            continue

        w_lat = w.base_lat if w.base_lat is not None else 11.0168
        w_lng = w.base_lng if w.base_lng is not None else 76.9558
        d = km(lat, lng, w_lat, w_lng)
        candidates.append((d, w))

    candidates.sort(key=lambda x: x[0])
    for d, w in candidates[:limit]:
        score = 35 + 20 + 10.0 + min(10.0, ((w.avg_rating or 0.0) / 5.0) * 10.0)
        if svc.requires_certification:
            score += 5.0
        reasons = [
            "Required trade skill matches",
            "Schedule slot available (no conflicts)",
            f"State Cooperative Federation Hub Dispatch ({d:.0f} km transit zone)",
            "Labour Cooperative verified worker"
        ]
        if svc.requires_certification:
            reasons.append("Official trade certification verified")
        if w.avg_rating and w.avg_rating > 0:
            reasons.append(f"{w.avg_rating:.1f} ★ verified customer rating ({w.rating_count} jobs)")

        out.append({
            "worker_id": w.id,
            "name": w.user.name if w.user else f"Worker #{w.id}",
            "phone": w.user.phone if w.user else "",
            "cooperative_name": w.cooperative.name if w.cooperative else "Labour Cooperative",
            "score": round(score, 1),
            "distance_km": round(d, 1),
            "avg_rating": w.avg_rating or 0.0,
            "rating_count": w.rating_count or 0,
            "experience_years": w.experience_years or 0.0,
            "reasons": reasons
        })

    return sorted(out, key=lambda x: -x["score"])[:limit]
