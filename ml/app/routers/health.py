# ml/app/routers/health.py

from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health_status():
    return {"status": "ok", "service": "bhashasuraksha-ml"}
