
from dotenv import load_dotenv
from pathlib import Path

# Load .env file from the ml directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import process, health, embeddings
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # allow all for hackathon
    allow_credentials=True,
    allow_methods=["*"],       # <== CRITICAL (fixes OPTIONS preflight)
    allow_headers=["*"],       # <== CRITICAL
)

app.include_router(process.router)
app.include_router(health.router)
app.include_router(embeddings.router)


@app.get("/")
def index():
    return {"message": "BhashaSuraksha ML API is running"}
