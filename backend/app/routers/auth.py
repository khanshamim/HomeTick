"""
Auth router — simple user selection with no password (MVP).

In production, swap this for JWT / OAuth2 with Supabase Auth.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Family, User
from app.schemas.schemas import SelectUserRequest, SelectUserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/select-user", response_model=SelectUserResponse)
def select_user(payload: SelectUserRequest, db: Session = Depends(get_db)):
    """
    Identify a user by name within a family.

    Returns user_id + family_id for the client to persist and send as
    the X-User-ID header on subsequent requests.
    """
    user = (
        db.query(User)
        .filter(
            User.name == payload.name,
            User.family_id == payload.family_id,
        )
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in this family",
        )
    family = db.query(Family).filter(Family.id == user.family_id).first()
    return SelectUserResponse(
        user_id=user.id,
        family_id=user.family_id,
        name=user.name,
        role=user.role,
        family_name=family.name if family else "",
    )
