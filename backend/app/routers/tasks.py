from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_admin
from app.models.models import User
from app.schemas.schemas import TaskCreate, TaskResponse, TaskWithStatus, UserProgress
from app.services import task_service

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/me", response_model=list[TaskWithStatus])
def get_my_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return today's tasks for the currently authenticated user."""
    return task_service.get_tasks_for_user(db, current_user.id, current_user.family_id)


@router.get("/overview", response_model=list[UserProgress])
def family_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return today's progress summary for every member in the current family."""
    return task_service.get_family_overview(db, current_user.family_id)


@router.get("/", response_model=list[TaskResponse])
def list_all_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all tasks belonging to the current family (admin use)."""
    return task_service.get_all_tasks(db, current_user.family_id)


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin only: create and assign a task within the current family."""
    # Validate the assigned user belongs to the same family
    assigned_user = db.query(User).filter(User.id == payload.assigned_to).first()
    if not assigned_user or assigned_user.family_id != current_user.family_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assigned user must belong to the same family",
        )
    return task_service.create_task(
        db,
        payload,
        created_by=current_user.id,
        family_id=current_user.family_id,
    )


@router.get("/user/{user_id}", response_model=list[TaskWithStatus])
def get_user_tasks(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return today's tasks for a specific family member (used by admin overview)."""
    target = db.query(User).filter(User.id == user_id).first()
    if not target or target.family_id != current_user.family_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return task_service.get_tasks_for_user(db, user_id, current_user.family_id)
