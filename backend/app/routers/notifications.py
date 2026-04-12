"""
Notification router.

Exposes endpoints to trigger push notifications manually (e.g. from an admin
UI or a cron job). The APScheduler jobs registered in main.py also call the
same service functions on a schedule.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.schemas import NotificationTrigger
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("/trigger")
def trigger_notifications(
    payload: NotificationTrigger, db: Session = Depends(get_db)
):
    """
    Manually trigger push notifications.

    - type="morning" → 'You have X tasks today'
    - type="evening" → 'You have X pending tasks'
    """
    if payload.type == "morning":
        result = notification_service.send_morning_reminders(db)
    else:
        result = notification_service.send_evening_reminders(db)

    return {"status": "ok", "type": payload.type, **result}
