from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.models import User
from app.schemas.schemas import UserCreate, UserResponse, FCMTokenUpdate
from app.services import user_service

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=list[UserResponse])
def list_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all members of the current user's family."""
    return user_service.get_users_in_family(db, current_user.family_id)


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user in a family.

    This endpoint is intentionally unauthenticated so that family members can
    be added during the initial setup flow before anyone is logged in.
    """
    return user_service.create_user(db, payload)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.family_id != current_user.family_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return user


@router.put("/fcm-token", response_model=UserResponse)
def update_fcm_token(
    payload: FCMTokenUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Register or refresh the FCM device token for the current user."""
    user = user_service.update_fcm_token(db, current_user.id, payload.token)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
