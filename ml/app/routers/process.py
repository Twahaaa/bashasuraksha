from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import tempfile
import requests
import os

from app.services.audio_processor import AudioProcessor

router = APIRouter()
processor = AudioProcessor()


class ProcessRequest(BaseModel):
    file_url: str
    lat: float | None = None
    lng: float | None = None


@router.post("/process")
async def process_audio(data: ProcessRequest):

    # 1. Download the file from the blob URL
    response = requests.get(data.file_url)
    if response.status_code != 200:
        return JSONResponse(
            content={"error": "Failed to download audio from blob URL"},
            status_code=400
        )

    # 2. Save as temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(response.content)
        temp_path = tmp.name

    # 3. Process the audio
    try:
        result = processor.process(temp_path)

        # Attach lat/lng to result (not used in ML but needed for DB)
        result["lat"] = data.lat
        result["lng"] = data.lng

        return JSONResponse(content=result)

    finally:
        # 4. Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)
