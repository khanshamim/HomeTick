from uuid import UUID

from sqlalchemy.orm import Session

from app.models.models import User
from app.schemas.schemas import UserCreate


def get_users_in_family(db: Session, family_id: UUID) -> list[User]:
    """Return all users belonging to a specific family, ordered by name."""
    return (
        db.query(User)
        .filter(User.family_id == family_id)
        .order_by(User.name)
        .all()
    )


def get_user_by_id(db: Session, user_id: UUID) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, payload: UserCreate) -> User:
    user = User(
        name=payload.name,
        role=payload.role,
        family_id=payload.family_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_fcm_token(db: Session, user_id: UUID, token: str) -> User | None:
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    user.fcm_token = token
    db.commit()
    db.refresh(user)
    return user
