"""
Notification service.

Sends morning/evening push notifications to all users who have FCM tokens.
Task counts are family-scoped so cross-family data never leaks.
"""

import logging
from datetime import date

from sqlalchemy.orm import Session

from app.models.models import Task, TaskStatus, User
from app.utils.fcm import send_push_notification

logger = logging.getLogger(__name__)


def _get_task_counts(
    db: Session, user_id, family_id, today: date
) -> tuple[int, int]:
    """Return (total_daily, completed_today) for a user, scoped to their family."""
    total = (
        db.query(Task)
        .filter(
            Task.assigned_to == user_id,
            Task.family_id == family_id,
            Task.is_daily.is_(True),
        )
        .count()
    )
    completed = (
        db.query(TaskStatus)
        .filter(
            TaskStatus.user_id == user_id,
            TaskStatus.date == today,
            TaskStatus.completed.is_(True),
        )
        .count()
    )
    return total, completed


def send_morning_reminders(db: Session) -> dict:
    """Send 'You have X tasks today' to every member who has an FCM token."""
    today = date.today()
    users = db.query(User).filter(User.fcm_token.isnot(None)).all()
    results = {"sent": 0, "skipped": 0, "failed": 0}

    for user in users:
        total, _ = _get_task_counts(db, user.id, user.family_id, today)
        if total == 0:
            results["skipped"] += 1
            continue

        title = "Good morning!"
        body = f"You have {total} task{'s' if total != 1 else ''} to complete today."
        success = send_push_notification(user.fcm_token, title, body)
        results["sent" if success else "failed"] += 1

    return results


def send_task_assigned_notification(token: str, task_title: str, assigned_by_name: str) -> bool:
    """Notify a user immediately when a task is assigned to them."""
    return send_push_notification(
        token,
        "New task assigned",
        f"{assigned_by_name} assigned you: {task_title}",
    )


def send_evening_reminders(db: Session) -> dict:
    """Send 'X pending tasks' to members who haven't finished everything."""
    today = date.today()
    users = db.query(User).filter(User.fcm_token.isnot(None)).all()
    results = {"sent": 0, "skipped": 0, "failed": 0}

    for user in users:
        total, completed = _get_task_counts(db, user.id, user.family_id, today)
        pending = max(total - completed, 0)

        if pending == 0:
            results["skipped"] += 1
            continue

        title = "Evening check-in"
        body = (
            f"You still have {pending} pending task{'s' if pending != 1 else ''}. "
            "Don't forget to complete them!"
        )
        success = send_push_notification(user.fcm_token, title, body)
        results["sent" if success else "failed"] += 1

    return results
