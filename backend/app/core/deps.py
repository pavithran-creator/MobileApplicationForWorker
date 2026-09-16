from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_token
from app.models.models import User

def get_current_user(authorization: str = Header(default=""), db: Session = Depends(get_db)) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication token missing or invalid format")
    try:
        payload = decode_token(authorization[7:].strip())
        user_id = int(payload.get("sub"))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user

def require_roles(*roles):
    def role_checker(user: User = Depends(get_current_user)) -> User:
        user_role = user.role.value if hasattr(user.role, "value") else str(user.role)
        if user_role not in roles:
            raise HTTPException(status_code=403, detail=f"Access denied: Required role in {roles}, got '{user_role}'")
        return user
    return role_checker

def get_optional_user(authorization: str = Header(default=""), db: Session = Depends(get_db)) -> User | None:
    if not authorization.startswith("Bearer "):
        return None
    try:
        payload = decode_token(authorization[7:].strip())
        user_id = int(payload.get("sub"))
        return db.query(User).filter(User.id == user_id, User.is_active == True).first()
    except Exception:
        return None
