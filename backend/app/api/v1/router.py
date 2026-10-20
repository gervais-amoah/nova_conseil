# FILE: backend/app/api/v1/router.py
from fastapi import APIRouter

from app.api.v1.endpoints import admin_requests, auth, requests

api_router = APIRouter()
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(requests.router, tags=["requests"])
api_router.include_router(admin_requests.router, tags=["admin"])
