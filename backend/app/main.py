from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.db.session import Base, engine
import app.models.models
from app.api.router import router

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print("[Startup warning] DB init:", e)
    yield

app = FastAPI(
    title="ON-DEMAND — Cooperative Intelligent Workforce Marketplace",
    description="Digital marketplace enabling Labour Cooperative Federations to connect verified skilled workers with households and institutions.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration supporting localhost & 127.0.0.1
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/health")
def health_check():
    return {
        "ok": True,
        "service": "ON-DEMAND Cooperative Marketplace Backend",
        "version": "1.0.0",
        "demo_mode": settings.DEMO_MODE
    }
