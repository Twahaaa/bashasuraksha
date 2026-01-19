from fileinput import filename
import os
import shutil
import tempfile
from typing import final
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn


from utils.logger import get_logger

from services import whisper_utils
from services import remote_encoder
from services import db_embeddings
from services import db_clusters
from services import clustering
from services import supabase

app = FastAPI(title="BhashaSuraksha Orchastrator")
logger = get_logger("main")


app.add_middleware(
CORSMiddleware,
allow_origins=["*"],  # In production, change this to your Frontend URL
allow_credentials=True,
allow_methods=["*"],    
allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status" : "healthy", "service": "orchastrator"}

@app.post("/process-audio")
async def process_audio(
    file: UploadFile = File(...),
    region:str = Form("Unknown"),
    lat:float = Form(None),
    lng:float = Form(None)
):
    tmp_path = None
    try:
        logger.info(f"Recieved request:{file.filename} from region:{region}")
        
        filename = file.filename or "audio.wav"
        file_ext = os.path.splitext(filename)[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            shutil.copyfileobj(file.file,tmp)
            tmp_path = tmp.name
            logger.info(f"saved temp file into {tmp_path}")
        
        #whisper
        transcription = whisper_utils.transcribe_audio(tmp_path)
        transcript_text = transcription["text"]
        detected_language = transcription["language"]
        confidence = transcription["probability"]
        logger.info(f"Whisper results: transcription:{transcript_text} with language:{detected_language} with confidence:{confidence}")
        
        #encoder
        embedding = await remote_encoder.get_audio_embedding(tmp_path)
        
        if not embedding:
            raise HTTPException(status_code=500,detail="Failed to generate embedding")

        #clustering
        existing_clusters = db_clusters.get_all_clusters()        
        best_cluster_id, distance = clustering.find_best_cluster(embedding,existing_clusters)
        final_cluster_id = None
        
        if best_cluster_id is not None:
            logger.info(f"Joining Cluster {best_cluster_id} (Distance:{distance:.4f})")
            final_cluster_id = best_cluster_id
            
            match = next(c for c in existing_clusters if c['id']==best_cluster_id)
            
            new_centroid = clustering.calculate_new_centroid(
                match["centroid"],
                match["sampleCount"],
                embedding
            )
            
            db_clusters.update_cluster_centroid(
                best_cluster_id,
                new_centroid,
                match["sampleCount"]+1
            )
            
        else:
            logger.info("No matching cluster found, Creating new Cluster")
            final_cluster_id = db_clusters.create_new_cluster(embedding)
            
        public_url = supabase.upload_audio_file(tmp_path,filename)
            
        sample_id = db_embeddings.create_unknown_sample(
            file_url=public_url,
            language_guess=detected_language,
            confidence=confidence,
            transcript=transcript_text,
            region=region,
            lat=lat,
            lng=lng,
            keywords="",
            embedding=embedding,
            cluster_id=final_cluster_id
        )
        
        return {
            "status": "success",
            "sample_id": sample_id,
            "transcript": transcript_text,
            "detected_language":detected_language,
            "assigned_cluster_id": final_cluster_id,
            "is_new_cluster": (final_cluster_id != best_cluster_id) if best_cluster_id is not None else True,
            "file_url": public_url
        }
    
    except Exception as e:
        logger.error(f"Processing failed: {e}")
        raise HTTPException(status_code=500,detail=str(e))
    
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)
            logger.info("cleaned temp path")
        
def main():
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

if __name__ == "__main__":
    main()
