# ml/app/routers/process.py

from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from app.services.audio_processor import AudioProcessor
import uuid
import os

router = APIRouter()

# Create ONE processor instance (efficient)
processor = AudioProcessor()

@router.post("/process")
async def process_audio(file: UploadFile = File(...)):
    """
    Endpoint for running the full ML pipeline.
    Saves the audio temporarily, passes to AudioProcessor,
    returns structured JSON.
    """

    # Generate a unique filename
    temp_filename = f"/tmp/{uuid.uuid4()}.wav"

    # Save uploaded file
    with open(temp_filename, "wb") as f:
        f.write(await file.read())

    # Run ML pipeline
    try:
        result = processor.process(temp_filename)
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    finally:
        # Always clean up temp file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
