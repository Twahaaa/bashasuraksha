import numpy as np
from typing import List, Optional, Dict, Any
from app.utils.db import execute_query
from app.utils.logger import get_logger

logger = get_logger(__name__)


def get_all_embeddings(limit: Optional[int] = None, offset: int = 0) -> List[Dict[str, Any]]:
    """
    Fetch all embeddings from the UnknownSample table.
    
    Args:
        limit: Maximum number of records to fetch (None for all)
        offset: Number of records to skip
        
    Returns:
        List of dictionaries containing id, embedding, and metadata
    """
    query = """
        SELECT 
            id,
            "fileUrl" as file_url,
            "languageGuess" as language_guess,
            confidence,
            transcript,
            "clusterId" as cluster_id,
            region,
            keywords,
            embedding,
            "createdAt" as created_at
        FROM "UnknownSample"
        ORDER BY id
    """
    
    if limit is not None:
        query += f" LIMIT {limit}"
    
    if offset > 0:
        query += f" OFFSET {offset}"
    
    try:
        results = execute_query(query, fetch=True)
        logger.info(f"Fetched {len(results)} embeddings from database")
        return results
    except Exception as e:
        logger.error(f"Error fetching embeddings: {e}")
        raise


def get_embedding_by_id(sample_id: int) -> Optional[Dict[str, Any]]:
    """
    Fetch a single embedding by ID.
    
    Args:
        sample_id: The ID of the UnknownSample record
        
    Returns:
        Dictionary containing embedding and metadata, or None if not found
    """
    query = """
        SELECT 
            id,
            "fileUrl" as file_url,
            "languageGuess" as language_guess,
            confidence,
            transcript,
            "clusterId" as cluster_id,
            region,
            keywords,
            embedding,
            "createdAt" as created_at
        FROM "UnknownSample"
        WHERE id = %s
    """
    
    try:
        results = execute_query(query, params=(sample_id,), fetch=True)
        if results:
            logger.info(f"Fetched embedding for sample ID: {sample_id}")
            return results[0]
        logger.warning(f"No embedding found for sample ID: {sample_id}")
        return None
    except Exception as e:
        logger.error(f"Error fetching embedding by ID {sample_id}: {e}")
        raise


def get_embeddings_by_cluster(cluster_id: Optional[int]) -> List[Dict[str, Any]]:
    """
    Fetch embeddings filtered by cluster ID.
    
    Args:
        cluster_id: The cluster ID to filter by (None for unclustered samples)
        
    Returns:
        List of dictionaries containing embeddings with the specified cluster_id
    """
    if cluster_id is None:
        query = """
            SELECT 
                id,
                "fileUrl" as file_url,
                "languageGuess" as language_guess,
                confidence,
                transcript,
                "clusterId" as cluster_id,
                region,
                keywords,
                embedding,
                "createdAt" as created_at
            FROM "UnknownSample"
            WHERE "clusterId" IS NULL
            ORDER BY id
        """
        params = None
    else:
        query = """
            SELECT 
                id,
                "fileUrl" as file_url,
                "languageGuess" as language_guess,
                confidence,
                transcript,
                "clusterId" as cluster_id,
                region,
                keywords,
                embedding,
                "createdAt" as created_at
            FROM "UnknownSample"
            WHERE "clusterId" = %s
            ORDER BY id
        """
        params = (cluster_id,)
    
    try:
        results = execute_query(query, params=params, fetch=True)
        logger.info(f"Fetched {len(results)} embeddings for cluster {cluster_id}")
        return results
    except Exception as e:
        logger.error(f"Error fetching embeddings by cluster {cluster_id}: {e}")
        raise


def parse_embedding_to_numpy(embedding_json: Any) -> np.ndarray:
    """
    Convert JSON embedding to numpy array.
    
    Args:
        embedding_json: JSON array or list representing the embedding
        
    Returns:
        Numpy array of the embedding
    """
    try:
        # If it's already a list, convert directly
        if isinstance(embedding_json, list):
            return np.array(embedding_json, dtype=np.float32)
        
        # If it's a dict, it might be a serialized numpy array
        if isinstance(embedding_json, dict):
            if 'data' in embedding_json:
                return np.array(embedding_json['data'], dtype=np.float32)
        
        # Fallback: try to convert directly
        return np.array(embedding_json, dtype=np.float32)
    except Exception as e:
        logger.error(f"Error parsing embedding to numpy: {e}")
        raise ValueError(f"Invalid embedding format: {e}")


def get_embeddings_as_numpy(limit: Optional[int] = None, offset: int = 0) -> tuple[List[int], np.ndarray]:
    """
    Fetch embeddings and return as numpy array.
    
    Args:
        limit: Maximum number of records to fetch
        offset: Number of records to skip
        
    Returns:
        Tuple of (list of IDs, numpy array of embeddings)
    """
    results = get_all_embeddings(limit=limit, offset=offset)
    
    if not results:
        return [], np.array([])
    
    ids = [row['id'] for row in results]
    embeddings = [parse_embedding_to_numpy(row['embedding']) for row in results]
    
    # Stack all embeddings into a single numpy array
    embeddings_array = np.vstack(embeddings)
    
    logger.info(f"Converted {len(ids)} embeddings to numpy array with shape {embeddings_array.shape}")
    return ids, embeddings_array
