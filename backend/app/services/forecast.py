from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.models.models import Booking, Worker, VerifStatus

def forecast(db: Session, service_id: int | None = None, area: str = "", days: int = 7):
    since = date.today() - timedelta(days=60)
    q = db.query(Booking).filter(Booking.scheduled_date >= since)
    if service_id:
        q = q.filter(Booking.service_id == service_id)
    
    hist = q.count()
    if hist < 10:
        expected = max(6, (hist // 7) + 12)
        mode = "baseline/demo forecast due to insufficient historical data"
    else:
        # Moving average across 60 days scaled to requested future days with 15% cooperative peak coefficient
        expected = round((hist / 60.0) * days * 1.15)
        mode = "model-based forecast (moving average x seasonality)"

    level = "LOW" if expected < 15 else ("MEDIUM" if expected < 30 else "HIGH")
    
    # Query current available and verified workers
    avail = db.query(Worker).filter(
        Worker.verification_status == VerifStatus.VERIFIED,
        Worker.is_available == True
    ).count()

    shortage = max(0, expected - avail)

    return {
        "service_id": service_id,
        "area": area or "All Cooperative Zones",
        "period_days": days,
        "historical_bookings_60d": hist,
        "expected_requests": expected,
        "level": level,
        "available_verified_workers": avail,
        "shortage": shortage,
        "mode": mode
    }
