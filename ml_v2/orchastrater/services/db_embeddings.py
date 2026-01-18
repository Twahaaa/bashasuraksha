import json
from utils.db import excecute_query
from utils.logger import get_logger

logger = get_logger("db_embeddings")

def create_unknown_sample(
    file_url: str,
    language_guess: str,
    confidence: str,
    transcript: str,
    region: str,
    lat: float,
    lng: float,
    keywords: str,
    embedding: list,
    cluster_id: int = None
):
    """To insert into the unknown samples table"""
    
    query = """
        INSERT INTO "UknownSample"(
            "fileUrl",
            "languageGuess",
            "confidence",
            "transcript",
            "region",
            "lat",
            "lng",
            "keywords",
            "embedding",
            "clusterId"
        ) 
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s)
        RETURNING id;
    """
    
    embedding_json = json.dumps(embedding)
    
    params = (
        file_url,
        language_guess,
        confidence,
        transcript,
        region,
        lat,
        lng,
        keywords,
        embedding,
        cluster_id,
    )
    
    try:
        result = excecute_query(query,params,fetch_one=True)
        if result: 
            logger.info(f"Saved UnknownSample with id: {result['id']}")
            return result['id']
        
    except Exception as e:
        logger.error(f"Failed to save UnknownSample: {e}")
        raise 