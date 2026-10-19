# FILE: backend/app/api/v1/router.py
from fastapi import APIRouter

from app.api.v1.endpoints import requests

api_router = APIRouter()
api_router.include_router(requests.router, tags=["requests"])
