from fastapi import FastAPI, UploadFile, File, HTTPException
import uvicorn
import logging
import librosa
from services.preprocess_audio import preprocess_audio
from services.generate_embeddings import extract_embedding

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("encoder-service")

app = FastAPI(title="Audio Encoder Service")

@app.post('/vectorize')
async def vectorize_audio(file: UploadFile = File(...)):
    
    logger.info(f"Received audio file: {file.filename}")

    if not file:
        raise HTTPException(status_code=400, detail="file not provided")
    
    audio = preprocess_audio(file)
    logger.info("Preprocessed audio successfully")
    embedding = extract_embedding(audio)
    logger.info("Generated embedding successfully")

    return {
        "fileName": file.filename,
        "embedding": embedding.tolist()
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
