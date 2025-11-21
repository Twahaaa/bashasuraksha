
from fastapi import FastAPI
from app.routers import process, health

app = FastAPI()

app.include_router(process.router)
app.include_router(health.router)

@app.get("/")
def index():
    return {"message": "BhashaSuraksha ML API is running"}
