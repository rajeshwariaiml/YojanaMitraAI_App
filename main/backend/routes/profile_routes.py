"""
Profile Routes
==============
POST /save-profile
GET  /get-profile?email=...
"""

from typing import Optional

from fastapi import APIRouter, Query

from controllers.profile_controller import save_profile as save_ctrl, get_profile as get_ctrl
from models.user_model import ProfileModel

router = APIRouter(tags=["profile"])


@router.post("/save-profile")
def save_profile(payload: ProfileModel):
    return save_ctrl(payload.dict())


@router.get("/get-profile")
def get_profile(email: Optional[str] = Query(default=None)):
    return get_ctrl(email)
