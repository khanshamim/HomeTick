"""
Families router — create and list families.

These endpoints are intentionally public (no X-User-ID required) so that:
  - New users can set up their family on first launch.
  - Existing users on a new device can find and select their family.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Family, User
from app.schemas.schemas import FamilyCreate, FamilyResponse, UserResponse

router = APIRouter(prefix="/families", tags=["families"])


@router.get("/", response_model=list[FamilyResponse])
def list_families(db: Session = Depends(get_db)):
    """List all families (used on the family selection screen)."""
    return db.query(Family).order_by(Family.name).all()


@router.post("/", response_model=FamilyResponse, status_code=status.HTTP_201_CREATED)
def create_family(payload: FamilyCreate, db: Session = Depends(get_db)):
    """Create a new family (called during initial setup)."""
    family = Family(name=payload.name)
    db.add(family)
    db.commit()
    db.refresh(family)
    return family


@router.get("/{family_id}", response_model=FamilyResponse)
def get_family(family_id: UUID, db: Session = Depends(get_db)):
    """Get a specific family by ID."""
    family = db.query(Family).filter(Family.id == family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    return family


@router.get("/{family_id}/users", response_model=list[UserResponse])
def list_family_users(family_id: UUID, db: Session = Depends(get_db)):
    """
    Public endpoint: list all users in a family.

    Used on the UserSelectionScreen so the user can pick their profile
    without being authenticated yet.
    """
    family = db.query(Family).filter(Family.id == family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    return (
        db.query(User)
        .filter(User.family_id == family_id)
        .order_by(User.name)
        .all()
    )
