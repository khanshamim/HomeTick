from pydantic import BaseModel, Field
from typing import Optional
from datetime import time, datetime, date
from uuid import UUID


# ---------------------------------------------------------------------------
# Family
# ---------------------------------------------------------------------------

class FamilyCreate(BaseModel):
    name: str


class FamilyResponse(BaseModel):
    id: UUID
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# User
# ---------------------------------------------------------------------------

class UserBase(BaseModel):
    name: str
    role: str = "member"


class UserCreate(UserBase):
    family_id: UUID


class UserResponse(UserBase):
    id: UUID
    family_id: UUID
    fcm_token: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class FCMTokenUpdate(BaseModel):
    token: str


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class SelectUserRequest(BaseModel):
    name: str
    family_id: UUID


class SelectUserResponse(BaseModel):
    user_id: UUID
    family_id: UUID
    name: str
    role: str


# ---------------------------------------------------------------------------
# Task
# ---------------------------------------------------------------------------

class TaskBase(BaseModel):
    title: str
    assigned_to: UUID
    is_daily: bool = True
    due_time: Optional[time] = None


class TaskCreate(TaskBase):
    pass  # created_by and family_id are injected from the auth context on the backend


class TaskResponse(TaskBase):
    id: UUID
    created_by: UUID
    family_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class TaskWithStatus(TaskResponse):
    """Task enriched with today's completion status."""
    completed: bool = False


# ---------------------------------------------------------------------------
# TaskStatus
# ---------------------------------------------------------------------------

class TaskStatusResponse(BaseModel):
    id: UUID
    task_id: UUID
    user_id: UUID
    date: date
    completed: bool

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

class NotificationTrigger(BaseModel):
    type: str = Field(..., pattern="^(morning|evening)$")


# ---------------------------------------------------------------------------
# Family overview
# ---------------------------------------------------------------------------

class UserProgress(BaseModel):
    user: UserResponse
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    completion_percentage: float
