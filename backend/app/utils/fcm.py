"""
Firebase Cloud Messaging helper.

Initialises the Firebase Admin SDK once (singleton pattern) and exposes
`send_push_notification` for sending messages to individual device tokens.
"""

import logging
import os
from typing import Optional

import firebase_admin
from firebase_admin import credentials, messaging

from app.config import settings

logger = logging.getLogger(__name__)

# Backend root = two levels up from this file (app/utils/fcm.py → app/ → backend/)
_BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

_firebase_app: Optional[firebase_admin.App] = None


def _resolve_credentials_path() -> str:
    """
    Return an absolute path to the Firebase credentials file.
    If FIREBASE_CREDENTIALS_PATH is already absolute, use it as-is.
    Otherwise resolve it relative to the backend root directory so the
    server can be started from any working directory.
    """
    raw = settings.FIREBASE_CREDENTIALS_PATH
    if os.path.isabs(raw):
        return raw
    # Try relative to backend root first (e.g. "secrets/file.json")
    candidate = os.path.join(_BACKEND_ROOT, raw)
    if os.path.exists(candidate):
        return candidate
    # Fall back to CWD (legacy behaviour)
    return raw


def get_firebase_app() -> firebase_admin.App:
    """Return the initialised Firebase app, creating it on first call."""
    global _firebase_app
    if _firebase_app is None:
        try:
            cred_path = _resolve_credentials_path()
            logger.info("Loading Firebase credentials from: %s", cred_path)
            cred = credentials.Certificate(cred_path)
            _firebase_app = firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialised successfully.")
        except Exception as exc:
            logger.error("Failed to initialise Firebase Admin SDK: %s", exc)
            raise
    return _firebase_app


def send_push_notification(token: str, title: str, body: str) -> bool:
    """
    Send a push notification to a single FCM device token.

    Returns True on success, False on failure.
    """
    try:
        get_firebase_app()
        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            token=token,
            android=messaging.AndroidConfig(priority="high"),
            apns=messaging.APNSConfig(
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(sound="default")
                )
            ),
        )
        response = messaging.send(message)
        logger.info("Notification sent, message_id=%s", response)
        return True
    except Exception as exc:
        logger.error("Failed to send notification to %s: %s", token, exc)
        return False


def send_multicast_notification(tokens: list[str], title: str, body: str) -> dict:
    """
    Send the same notification to multiple device tokens.

    Returns a dict with 'success_count' and 'failure_count'.
    """
    if not tokens:
        return {"success_count": 0, "failure_count": 0}

    try:
        get_firebase_app()
        message = messaging.MulticastMessage(
            notification=messaging.Notification(title=title, body=body),
            tokens=tokens,
            android=messaging.AndroidConfig(priority="high"),
            apns=messaging.APNSConfig(
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(sound="default")
                )
            ),
        )
        response = messaging.send_each_for_multicast(message)
        return {
            "success_count": response.success_count,
            "failure_count": response.failure_count,
        }
    except Exception as exc:
        logger.error("Multicast notification failed: %s", exc)
        return {"success_count": 0, "failure_count": len(tokens)}
