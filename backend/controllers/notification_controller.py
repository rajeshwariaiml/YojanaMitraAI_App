"""
Notification Controller
=======================
Thin layer between the route and the service.

Responsibilities:
    - Validate / normalize the incoming user_email and language
    - Invoke the notification service
    - Shape the final HTTP response payload
"""

from typing import List, Dict, Any, Optional

from services.notification_service import build_notifications_for_user


def get_user_notifications(
    user_email: Optional[str],
    lang: Optional[str] = "en",
) -> List[Dict[str, Any]]:
    normalized_email = (user_email or "").strip().lower() or None
    normalized_lang = (lang or "en").lower()
    if normalized_lang not in ("en", "kn"):
        normalized_lang = "en"
    return build_notifications_for_user(normalized_email, lang=normalized_lang)
