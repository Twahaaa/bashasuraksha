import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.metrics.pairwise import cosine_similarity
from typing import Optional, Tuple
from app.utils.logger import get_logger

logger = get_logger(__name__)


def cluster_embedding_with_db(
    embedding: np.ndarray, 
    db_embeddings: np.ndarray,
    db_cluster_ids: list,
    similarity_threshold: float = 0.85,
    eps: float = 5,
    use_dbscan: bool = False
) -> Tuple[Optional[int], float]:
    """
    Cluster a new embedding by comparing with existing database embeddings.
    
    Args:
        embedding: New embedding vector (1D numpy array)
        db_embeddings: Existing embeddings from database (2D numpy array, shape: [n_samples, embedding_dim])
        db_cluster_ids: List of cluster IDs corresponding to db_embeddings
        similarity_threshold: Minimum cosine similarity to assign to existing cluster (default: 0.85)
        eps: DBSCAN epsilon parameter (used if use_dbscan=True)
        use_dbscan: Whether to use DBSCAN clustering (default: False, uses similarity-based approach)
        
    Returns:
        Tuple of (cluster_id, max_similarity)
        - cluster_id: Assigned cluster ID (None if no similar cluster found)
        - max_similarity: Maximum similarity score with existing embeddings
    """
    # Ensure embedding is 2D for similarity computation
    embedding = np.array(embedding).reshape(1, -1)
    
    # If no embeddings in database, return None (will create new cluster)
    if len(db_embeddings) == 0:
        logger.info("No embeddings in database. Will create new cluster.")
        return None, 0.0
    
    if use_dbscan:
        # Original DBSCAN approach
        X = np.vstack([db_embeddings, embedding])
        clusterer = DBSCAN(eps=eps, min_samples=1).fit(X)
        labels = clusterer.labels_
        assigned_cluster = int(labels[-1])
        
        # Calculate max similarity for reference
        similarities = cosine_similarity(embedding, db_embeddings)[0]
        max_similarity = float(np.max(similarities))
        
        logger.info(f"DBSCAN assigned cluster {assigned_cluster} with max similarity {max_similarity:.4f}")
        return assigned_cluster, max_similarity
    
    else:
        # Similarity-based approach (recommended)
        # Calculate cosine similarity with all database embeddings
        similarities = cosine_similarity(embedding, db_embeddings)[0]
        
        # Find the most similar embedding
        max_similarity_idx = np.argmax(similarities)
        max_similarity = float(similarities[max_similarity_idx])
        
        logger.info(f"Max similarity: {max_similarity:.4f} with sample at index {max_similarity_idx}")
        
        # If similarity exceeds threshold, assign to the same cluster
        if max_similarity >= similarity_threshold:
            assigned_cluster = db_cluster_ids[max_similarity_idx]
            logger.info(f"Assigned to existing cluster {assigned_cluster} (similarity: {max_similarity:.4f})")
            return assigned_cluster, max_similarity
        else:
            # No similar cluster found - will need to create new cluster
            logger.info(f"No similar cluster found (max similarity: {max_similarity:.4f} < threshold: {similarity_threshold})")
            return None, max_similarity


def cluster_embedding(embedding, history, eps=5):
    """
    Legacy clustering function for backward compatibility.
    Uses in-memory history with DBSCAN.
    
    Note: This is deprecated. Use cluster_embedding_with_db() instead.
    """
    # Ensure embedding is 2D
    embedding = np.array(embedding).reshape(1, -1)

    # Convert history list → 2D array
    history_arr = np.array(history) if len(history) > 0 else np.empty((0, embedding.shape[1]))

    # Combine history + current embedding
    X = np.vstack([history_arr, embedding])

    # Run DBSCAN
    clusterer = DBSCAN(eps=eps, min_samples=1).fit(X)
    labels = clusterer.labels_

    # Last label corresponds to current embedding
    return int(labels[-1])

