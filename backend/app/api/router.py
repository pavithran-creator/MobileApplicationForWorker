from fastapi import APIRouter
from app.api import auth, catalog, workers, bookings, emergency, payments, ratings, welfare, admin, ai

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(catalog.router, prefix="/catalog", tags=["catalog"])
router.include_router(catalog.router, prefix="", tags=["catalog"])
router.include_router(workers.router, prefix="", tags=["workers"])
router.include_router(bookings.router, prefix="", tags=["bookings"])
router.include_router(emergency.router, prefix="", tags=["emergency"])
router.include_router(payments.router, prefix="", tags=["payments"])
router.include_router(ratings.router, prefix="", tags=["ratings"])
router.include_router(welfare.router, prefix="", tags=["welfare"])
router.include_router(admin.router, prefix="/admin", tags=["admin"])
router.include_router(ai.router, prefix="/ai", tags=["ai"])
