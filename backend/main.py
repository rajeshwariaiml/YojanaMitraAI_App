"""
YojanaMitraAI - FastAPI Backend
================================
Main FastAPI application entry point.

Run locally:
    cd backend
    pip install fastapi uvicorn
    uvicorn main:app --reload --port 8000

The deadline notification system is exposed at:
    GET http://localhost:8000/notifications?user_email=<email>
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.notification_routes import router as notification_router
from routes.auth_routes import router as auth_router
from routes.profile_routes import router as profile_router
from routes.recommend_routes import router as recommend_router

app = FastAPI(
    title="YojanaMitraAI Backend",
    description="Auth, profile, deadline notifications & ML recommendation service",
    version="1.1.0",
)

# Allow the React frontend (Vite dev server / Lovable preview) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(notification_router)
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(recommend_router)


@app.get("/")
def root():
    return {
        "service": "YojanaMitraAI Backend",
        "status": "running",
        "endpoints": [
            "/signup",
            "/login",
            "/save-profile",
            "/get-profile",
            "/notifications",
            "/recommend-schemes",
        ],
    }
