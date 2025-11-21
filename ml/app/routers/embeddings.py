from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import numpy as np

from app.services.db_embeddings import (
    get_all_embeddings,
    get_embedding_by_id,
    get_embeddings_by_cluster,
    get_embeddings_as_numpy,
    parse_embedding_to_numpy
)
from app.services.embeddings import extract_embedding
from app.services.preprocess import preprocess_audio
from app.utils.logger import get_logger

router = APIRouter(prefix="/embeddings", tags=["embeddings"])
logger = get_logger(__name__)


class CompareRequest(BaseModel):
    file_url: str
    top_k: int = 5


@router.get("/")
async def list_embeddings(
    limit: Optional[int] = Query(None, description="Maximum number of embeddings to return"),
    offset: int = Query(0, description="Number of embeddings to skip"),
    cluster_id: Optional[int] = Query(None, description="Filter by cluster ID (null for unclustered)")
):
    """
    Retrieve embeddings from the UnknownSample table.
    
    Query parameters:
    - limit: Maximum number of results (default: all)
    - offset: Skip N records (for pagination)
    - cluster_id: Filter by cluster (omit to get all, use 'null' for unclustered)
    """
    try:
        if cluster_id is not None:
            results = get_embeddings_by_cluster(cluster_id)
        else:
            results = get_all_embeddings(limit=limit, offset=offset)
        
        # Convert datetime to string for JSON serialization
        for result in results:
            if 'created_at' in result and result['created_at']:
                result['created_at'] = result['created_at'].isoformat()
        
        return {
            "count": len(results),
            "embeddings": results
        }
    except Exception as e:
        logger.error(f"Error fetching embeddings: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch embeddings: {str(e)}")


@router.get("/{sample_id}")
async def get_embedding(sample_id: int):
    """
    Retrieve a single embedding by sample ID.
    """
    try:
        result = get_embedding_by_id(sample_id)
        
        if result is None:
            raise HTTPException(status_code=404, detail=f"Sample {sample_id} not found")
        
        # Convert datetime to string
        if 'created_at' in result and result['created_at']:
            result['created_at'] = result['created_at'].isoformat()
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching embedding {sample_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch embedding: {str(e)}")


@router.post("/compare")
async def compare_audio(data: CompareRequest):
    """
    Compare a new audio file against all embeddings in the database.
    
    Returns the top K most similar samples based on cosine similarity.
    """
    try:
        # Download and process the audio file
        import requests
        import tempfile
        import os
        
        response = requests.get(data.file_url)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to download audio file")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
            tmp.write(response.content)
            temp_path = tmp.name
        
        try:
            # Preprocess and extract embedding from new audio
            audio = preprocess_audio(temp_path)
            new_embedding = extract_embedding(audio)
            
            # Fetch all database embeddings
            ids, db_embeddings = get_embeddings_as_numpy()
            
            if len(ids) == 0:
                return {
                    "message": "No embeddings in database to compare against",
                    "matches": []
                }
            
            # Calculate cosine similarity
            new_embedding_norm = new_embedding / np.linalg.norm(new_embedding)
            db_embeddings_norm = db_embeddings / np.linalg.norm(db_embeddings, axis=1, keepdims=True)
            
            similarities = np.dot(db_embeddings_norm, new_embedding_norm)
            
            # Get top K matches
            top_k_indices = np.argsort(similarities)[::-1][:data.top_k]
            
            matches = []
            for idx in top_k_indices:
                sample_id = ids[idx]
                similarity = float(similarities[idx])
                
                # Fetch full sample details
                sample = get_embedding_by_id(sample_id)
                if sample:
                    # Convert datetime to string
                    if 'created_at' in sample and sample['created_at']:
                        sample['created_at'] = sample['created_at'].isoformat()
                    
                    matches.append({
                        "sample_id": sample_id,
                        "similarity": similarity,
                        "details": sample
                    })
            
            return {
                "query_file": data.file_url,
                "total_samples_compared": len(ids),
                "top_k": data.top_k,
                "matches": matches
            }
            
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing audio: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to compare audio: {str(e)}")


@router.get("/numpy/export")
async def export_embeddings_numpy():
    """
    Export all embeddings as numpy arrays.
    
    Returns sample IDs and embedding dimensions.
    """
    try:
        ids, embeddings = get_embeddings_as_numpy()
        
        return {
            "count": len(ids),
            "embedding_dimension": embeddings.shape[1] if len(embeddings) > 0 else 0,
            "sample_ids": ids,
            "embeddings_shape": list(embeddings.shape),
            "note": "Actual embedding vectors not returned in JSON. Use this endpoint to verify structure."
        }
    except Exception as e:
        logger.error(f"Error exporting embeddings: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to export embeddings: {str(e)}")
