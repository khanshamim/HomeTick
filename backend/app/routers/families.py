"""
Families router — create, list, join, and manage invite codes.

Public endpoints (no auth required):
  GET  /families/           — list all families
  GET  /families/{id}       — get a single family
  GET  /families/{id}/users — list members of a family
  POST /families/join       — join a family using an invite code

Authenticated endpoints:
  POST /families/           — create a new family (unauthenticated — first-run setup)
  POST /families/invite-code — admin-only: generate / refresh the family invite code
"""

import random
import string
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models.models import Family, User
from app.schemas.schemas import (
    FamilyCreate,
    FamilyResponse,
    InviteCodeResponse,
    JoinFamilyRequest,
    JoinFamilyResponse,
    UserResponse,
)

router = APIRouter(prefix="/families", tags=["families"])

_CODE_CHARS = string.ascii_uppercase + string.digits  # A-Z0-9


def _generate_unique_invite_code(db: Session, length: int = 6) -> str:
    """Generate a random invite code that doesn't already exist in the DB."""
    for _ in range(20):  # 20 attempts is astronomically more than enough
        code = "".join(random.choices(_CODE_CHARS, k=length))
        if not db.query(Family).filter(Family.invite_code == code).first():
            return code
    raise RuntimeError("Could not generate a unique invite code — try again.")


# ---------------------------------------------------------------------------
# Public
# ---------------------------------------------------------------------------

@router.get("/", response_model=list[FamilyResponse])
def list_families(db: Session = Depends(get_db)):
    """List all families (used on the family selection screen)."""
    return db.query(Family).order_by(Family.name).all()


@router.post("/", response_model=FamilyResponse, status_code=status.HTTP_201_CREATED)
def create_family(payload: FamilyCreate, db: Session = Depends(get_db)):
    """
    Create a new family (called during initial setup).

    Intentionally unauthenticated — this is the very first action a new admin
    takes before any users exist.  A unique invite code is generated immediately
    so the family is shareable from the moment it is created.
    """
    invite_code = _generate_unique_invite_code(db)
    family = Family(name=payload.name, invite_code=invite_code)
    db.add(family)
    db.commit()
    db.refresh(family)
    return family


@router.post(
    "/join",
    response_model=JoinFamilyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Join a family using an invite code",
)
def join_family(payload: JoinFamilyRequest, db: Session = Depends(get_db)):
    """
    Public endpoint — no prior authentication needed.

    Steps:
      1. Look up the family by invite_code (case-insensitive).
      2. Check for a duplicate name within that family.
      3. Create a new user with role='member'.
      4. Return data in the same shape as /auth/select-user so the frontend
         can store it and jump straight to the main app.
    """
    code = payload.invite_code.strip().upper()
    family = db.query(Family).filter(Family.invite_code == code).first()
    if not family:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid invite code — please check and try again.",
        )

    clean_name = payload.name.strip()

    # Prevent duplicate names within the same family
    duplicate = (
        db.query(User)
        .filter(User.family_id == family.id, User.name == clean_name)
        .first()
    )
    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f'A member named "{clean_name}" already exists in this family.',
        )

    user = User(name=clean_name, role="member", family_id=family.id)
    db.add(user)
    db.commit()
    db.refresh(user)

    return JoinFamilyResponse(
        user_id=user.id,
        family_id=family.id,
        family_name=family.name,
        name=user.name,
        role=user.role,
    )


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


# ---------------------------------------------------------------------------
# Admin-only
# ---------------------------------------------------------------------------

@router.post(
    "/invite-code",
    response_model=InviteCodeResponse,
    summary="Generate (or refresh) the family invite code — admin only",
)
def generate_invite_code(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Generate a new 6-character invite code for the admin's family.

    Calling this again replaces the previous code, invalidating old links.
    Useful when the code has been shared too broadly.
    """
    family = db.query(Family).filter(Family.id == current_user.family_id).first()
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")

    family.invite_code = _generate_unique_invite_code(db)
    db.commit()
    db.refresh(family)

    return InviteCodeResponse(
        invite_code=family.invite_code,
        family_id=family.id,
        family_name=family.name,
    )
