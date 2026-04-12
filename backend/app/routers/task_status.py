from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.models import Task, User
from app.schemas.schemas import TaskStatusResponse
from app.services import task_service

router = APIRouter(prefix="/tasks", tags=["task-status"])


class CompletePayload(BaseModel):
    completed: bool = True


@router.post("/{task_id}/complete", response_model=TaskStatusResponse)
def complete_task(
    task_id: UUID,
    payload: CompletePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mark (or un-mark) a task as completed for today.

    The task must belong to the current user's family.  The completion record
    is created for the currently authenticated user.
    """
    task = (
        db.query(Task)
        .filter(Task.id == task_id, Task.family_id == current_user.family_id)
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task_service.set_task_completion(
        db,
        task_id=task_id,
        user_id=current_user.id,
        completed=payload.completed,
    )


@router.get("/status/me", response_model=list[TaskStatusResponse])
def get_my_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all task_status records for the current user on today's date."""
    return task_service.get_status_for_user(db, current_user.id)


@router.get("/status/{user_id}", response_model=list[TaskStatusResponse])
def get_user_status(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return task_status records for a user — must belong to the same family."""
    target = db.query(User).filter(User.id == user_id).first()
    if not target or target.family_id != current_user.family_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return task_service.get_status_for_user(db, user_id)
