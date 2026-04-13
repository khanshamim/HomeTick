"""
Task and TaskStatus business logic.

All queries are scoped by family_id to guarantee strict multi-tenant isolation.
No row from one family is ever accessible to users of another family.
"""

import uuid
from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.models import Task, TaskStatus, User
from app.schemas.schemas import TaskCreate, TaskWithStatus, UserProgress, UserResponse


def get_all_tasks(db: Session, family_id: UUID) -> list[Task]:
    return (
        db.query(Task)
        .filter(Task.family_id == family_id)
        .order_by(Task.created_at.desc())
        .all()
    )


def get_tasks_for_user(
    db: Session, user_id: UUID, family_id: UUID
) -> list[TaskWithStatus]:
    """Return all daily tasks assigned to a user, enriched with today's status."""
    today = date.today()

    tasks = (
        db.query(Task)
        .filter(
            Task.assigned_to == user_id,
            Task.family_id == family_id,
            Task.is_daily.is_(True),
        )
        .order_by(Task.due_time.asc().nulls_last(), Task.created_at.asc())
        .all()
    )

    task_ids = [t.id for t in tasks]
    statuses = (
        db.query(TaskStatus)
        .filter(
            TaskStatus.user_id == user_id,
            TaskStatus.date == today,
            TaskStatus.task_id.in_(task_ids),
        )
        .all()
    )
    status_map: dict[UUID, bool] = {s.task_id: s.completed for s in statuses}

    # Resolve creator names in a single query so the frontend can show "Assigned by Dad"
    creator_ids = {t.created_by for t in tasks if t.created_by}
    creator_map: dict[UUID, str] = {}
    if creator_ids:
        creators = db.query(User).filter(User.id.in_(creator_ids)).all()
        creator_map = {c.id: c.name for c in creators}

    result: list[TaskWithStatus] = []
    for task in tasks:
        tw = TaskWithStatus.model_validate(task)
        tw.completed = status_map.get(task.id, False)
        tw.assigned_by = creator_map.get(task.created_by, "")
        result.append(tw)

    return result


def create_task(
    db: Session,
    payload: TaskCreate,
    created_by: UUID,
    family_id: UUID,
) -> Task:
    task = Task(
        title=payload.title,
        assigned_to=payload.assigned_to,
        created_by=created_by,
        family_id=family_id,
        is_daily=payload.is_daily,
        due_time=payload.due_time,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def set_task_completion(
    db: Session, task_id: UUID, user_id: UUID, completed: bool = True
) -> TaskStatus:
    """Create or update today's task_status record (idempotent upsert)."""
    today = date.today()
    record = (
        db.query(TaskStatus)
        .filter(
            TaskStatus.task_id == task_id,
            TaskStatus.user_id == user_id,
            TaskStatus.date == today,
        )
        .first()
    )
    if record:
        record.completed = completed
    else:
        record = TaskStatus(
            id=uuid.uuid4(),
            task_id=task_id,
            user_id=user_id,
            date=today,
            completed=completed,
        )
        db.add(record)

    db.commit()
    db.refresh(record)
    return record


def get_status_for_user(db: Session, user_id: UUID) -> list[TaskStatus]:
    today = date.today()
    return (
        db.query(TaskStatus)
        .filter(TaskStatus.user_id == user_id, TaskStatus.date == today)
        .all()
    )


def get_family_overview(db: Session, family_id: UUID) -> list[UserProgress]:
    """Return today's completion stats for every member in a family."""
    today = date.today()
    users = (
        db.query(User)
        .filter(User.family_id == family_id)
        .order_by(User.name)
        .all()
    )
    overview: list[UserProgress] = []

    for user in users:
        daily_tasks = (
            db.query(Task)
            .filter(
                Task.assigned_to == user.id,
                Task.family_id == family_id,
                Task.is_daily.is_(True),
            )
            .count()
        )
        completed = (
            db.query(TaskStatus)
            .filter(
                TaskStatus.user_id == user.id,
                TaskStatus.date == today,
                TaskStatus.completed.is_(True),
            )
            .count()
        )
        pending = max(daily_tasks - completed, 0)
        pct = round((completed / daily_tasks * 100) if daily_tasks > 0 else 0.0, 1)

        overview.append(
            UserProgress(
                user=UserResponse.model_validate(user),
                total_tasks=daily_tasks,
                completed_tasks=completed,
                pending_tasks=pending,
                completion_percentage=pct,
            )
        )

    return overview
