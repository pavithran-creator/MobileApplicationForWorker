from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field
from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.models import Booking, BookingStatus, Rating, Feedback, Customer, Worker, User

router = APIRouter()

class RateRequest(BaseModel):
    booking_id: int
    stars: int = Field(..., ge=1, le=5)
    message: str = Field(default="", max_length=1000)

@router.post("/ratings")
def submit_rating(req: RateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    booking = db.get(Booking, req.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Only completed bookings can be rated
    if booking.status != BookingStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Only completed service bookings can be rated and reviewed")

    customer = db.query(Customer).filter_by(user_id=user.id).first()
    if not customer or customer.id != booking.customer_id:
        raise HTTPException(status_code=403, detail="Unauthorized: You can only review your own bookings")

    # Prevent duplicate rating
    if db.query(Rating).filter_by(booking_id=booking.id).first():
        raise HTTPException(status_code=400, detail="This booking has already been rated")

    rating_entry = Rating(
        booking_id=booking.id,
        worker_id=booking.worker_id,
        customer_id=customer.id,
        stars=req.stars
    )
    db.add(rating_entry)

    if req.message.strip():
        db.add(Feedback(
            booking_id=booking.id,
            worker_id=booking.worker_id,
            customer_id=customer.id,
            message=req.message.strip()
        ))

    db.flush()

    # Recalculate worker average rating accurately from database
    avg_val = db.query(func.avg(Rating.stars)).filter_by(worker_id=booking.worker_id).scalar() or req.stars
    count_val = db.query(Rating).filter_by(worker_id=booking.worker_id).count()

    worker = db.get(Worker, booking.worker_id)
    if worker:
        worker.avg_rating = round(float(avg_val), 2)
        worker.rating_count = count_val

    db.commit()
    return {
        "status": "success",
        "booking_id": booking.id,
        "worker_id": booking.worker_id,
        "stars": req.stars,
        "new_worker_average": worker.avg_rating if worker else req.stars,
        "total_reviews": count_val
    }

@router.get("/workers/{wid}/ratings")
def get_worker_ratings(wid: int, db: Session = Depends(get_db)):
    ratings = db.query(Rating).filter_by(worker_id=wid).order_by(Rating.id.desc()).limit(15).all()
    feedback = db.query(Feedback).filter_by(worker_id=wid).order_by(Feedback.id.desc()).limit(15).all()

    return {
        "worker_id": wid,
        "ratings": [
            {"stars": r.stars, "booking_id": r.booking_id, "date": str(r.created_at.date() if r.created_at else "")}
            for r in ratings
        ],
        "feedback": [
            {"message": fb.message, "date": str(fb.created_at.date() if fb.created_at else "")}
            for fb in feedback
        ]
    }
