"""
HomeTick FastAPI — v2.0 with multi-family support.

Architecture:
  - All data is scoped by family_id (multi-tenant isolation).
  - Current user is identified via the X-User-ID request header.
  - APScheduler fires morning (08:00 UTC) and evening (20:00 UTC) push notifications.
  - Tables are created automatically on startup (idempotent via create_all).
"""

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.database import Base, SessionLocal, engine
from app.models import models  # noqa: F401 — registers ORM models with Base
from app.routers import auth, families, notifications, task_status, tasks, users
from app.services import notification_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="HomeTick API",
    description="Multi-family task manager — daily household coordination",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers  (order matters for /tasks routes — specifics before /{id})
# ---------------------------------------------------------------------------

app.include_router(auth.router)
app.include_router(families.router)
app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(task_status.router)
app.include_router(notifications.router)

# ---------------------------------------------------------------------------
# Scheduler
# ---------------------------------------------------------------------------


def _morning_job():
    db = SessionLocal()
    try:
        result = notification_service.send_morning_reminders(db)
        logger.info("Morning notifications: %s", result)
    finally:
        db.close()


def _evening_job():
    db = SessionLocal()
    try:
        result = notification_service.send_evening_reminders(db)
        logger.info("Evening notifications: %s", result)
    finally:
        db.close()


scheduler = BackgroundScheduler(timezone="UTC")
scheduler.add_job(_morning_job, CronTrigger(hour=8, minute=0))
scheduler.add_job(_evening_job, CronTrigger(hour=20, minute=0))

# ---------------------------------------------------------------------------
# Lifecycle
# ---------------------------------------------------------------------------


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    scheduler.start()
    logger.info("HomeTick API v2.0 started — multi-family mode, scheduler running.")


@app.on_event("shutdown")
def on_shutdown():
    scheduler.shutdown()
    logger.info("HomeTick API shutting down.")


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok", "service": "hometick-api", "version": "2.0.0"}
