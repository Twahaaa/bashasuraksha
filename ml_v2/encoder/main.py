from fastapi import FastAPI, UploadFile, File, HTTPException
import uvicorn
import logging
import librosa
from services.preprocess_audio import preprocess_audio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("encoder-service")

app = FastAPI(title="Audio Encoder Service")

@app.post('/vectorize')
async def vectorize_audio(file: UploadFile = File(...)):
    
    logger.info(f"Received audio file: {file.filename}")

    if not file:
        raise HTTPException(status_code=400, detail="file not provided")

    
    audio = preprocess_audio(file)

    logger.info("Generated embedding successfully")


    #just dummy data for now, will add the encoder tomorrow
    vector = [1,2,3,4,5]

    return {
        "fileName": file.filename,
        "embedding": vector
    }


def main():
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    )


if __name__ == "__main__":
    main()
