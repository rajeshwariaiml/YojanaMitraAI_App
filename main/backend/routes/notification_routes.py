"""
Notification Routes
===================
Endpoint:
    GET /notifications?user_email=<email>&lang=en|kn
"""

from fastapi import APIRouter, Query
from typing import Optional

from controllers.notification_controller import get_user_notifications

router = APIRouter(tags=["notifications"])


@router.get("/notifications")
def list_notifications(
    user_email: Optional[str] = Query(
        default=None,
        description="Email of the user whose saved-scheme deadlines should be checked.",
    ),
    lang: Optional[str] = Query(
        default="en",
        description="Response language for titles + messages: 'en' or 'kn'.",
    ),
):
    """
    Returns a list of deadline alerts. When `lang=kn` is passed, scheme
    names and messages are returned in Kannada (using
    dataset/schemes_multilingual.json).
    """
    return get_user_notifications(user_email, lang)
