"""
Request-level dependencies.

Current user is identified via the X-User-ID header.
This is a simple MVP pattern — replace with JWT verification in production.
"""

from uuid import UUID

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User


async def get_current_user(
    x_user_id: str = Header(..., alias="X-User-ID"),
    db: Session = Depends(get_db),
) -> User:
    """Extract and validate the current user from the X-User-ID request header."""
    try:
        user_id = UUID(x_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid X-User-ID header — must be a valid UUID",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Raise 403 if the current user does not have the 'admin' role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required",
        )
    return current_user
