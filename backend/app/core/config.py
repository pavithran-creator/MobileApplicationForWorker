from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DB_PATH = (BASE_DIR / "ondemand.db").as_posix()
DEFAULT_DB = f"sqlite:///{DB_PATH}"

from pydantic import field_validator

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(BASE_DIR / ".env"), extra="ignore")

    DATABASE_URL: str = DEFAULT_DB
    JWT_SECRET: str = "change-me-super-secret-min-32-chars-123456"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DEMO_MODE: bool = True
    AI_API_KEY: str = ""
    MAP_API_KEY: str = ""
    PAYMENT_API_KEY: str = ""
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def resolve_db_url(cls, v: str) -> str:
        if v.startswith("sqlite:///./"):
            rel_file = v[12:]
            return f"sqlite:///{(BASE_DIR / rel_file).as_posix()}"
        return v

settings = Settings()
