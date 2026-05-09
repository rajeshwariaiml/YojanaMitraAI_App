"""
Auth Routes
===========
POST /signup
POST /login
"""

from fastapi import APIRouter

from controllers.auth_controller import signup as signup_ctrl, login as login_ctrl
from models.user_model import SignupRequest, LoginRequest, AuthResponse

router = APIRouter(tags=["auth"])


@router.post("/signup", response_model=AuthResponse)
def signup(payload: SignupRequest):
    return signup_ctrl(payload.name, payload.email, payload.password)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    return login_ctrl(payload.email, payload.password)
