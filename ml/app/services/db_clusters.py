import json
import numpy as np
from typing import Optional, Dict, Any
from app.utils.db import execute_query
from app.utils.logger import get_logger

logger = get_logger(__name__)


def create_new_cluster(centroid: Optional[np.ndarray] = None) -> int:
    """
    Create a new cluster in the database.
    
    Args:
        centroid: Optional centroid vector for the cluster (numpy array)
        
    Returns:
        The ID of the newly created cluster
    """
    centroid_json = None
    if centroid is not None:
        # Convert numpy array to list for JSON storage
        centroid_json = json.dumps(centroid.tolist())
    
    query = """
        INSERT INTO "Cluster" (centroid, "sampleCount", "createdAt")
        VALUES (%s, 0, NOW())
        RETURNING id
    """
    
    try:
        result = execute_query(query, params=(centroid_json,), fetch=True)
        cluster_id = result[0]['id']
        logger.info(f"Created new cluster with ID: {cluster_id}")
        return cluster_id
    except Exception as e:
        logger.error(f"Error creating cluster: {e}")
        raise


def update_cluster_centroid(cluster_id: int, centroid: np.ndarray):
    """
    Update the centroid of an existing cluster.
    
    Args:
        cluster_id: The cluster ID to update
        centroid: New centroid vector (numpy array)
    """
    centroid_json = json.dumps(centroid.tolist())
    
    query = """
        UPDATE "Cluster"
        SET centroid = %s
        WHERE id = %s
    """
    
    try:
        execute_query(query, params=(centroid_json, cluster_id), fetch=False)
        logger.info(f"Updated centroid for cluster {cluster_id}")
    except Exception as e:
        logger.error(f"Error updating cluster centroid: {e}")
        raise


def increment_cluster_sample_count(cluster_id: int):
    """
    Increment the sample count for a cluster.
    
    Args:
        cluster_id: The cluster ID to update
    """
    query = """
        UPDATE "Cluster"
        SET "sampleCount" = "sampleCount" + 1
        WHERE id = %s
    """
    
    try:
        execute_query(query, params=(cluster_id,), fetch=False)
        logger.info(f"Incremented sample count for cluster {cluster_id}")
    except Exception as e:
        logger.error(f"Error incrementing cluster sample count: {e}")
        raise


def get_cluster_info(cluster_id: int) -> Optional[Dict[str, Any]]:
    """
    Get information about a specific cluster.
    
    Args:
        cluster_id: The cluster ID
        
    Returns:
        Dictionary with cluster information or None if not found
    """
    query = """
        SELECT id, centroid, "sampleCount", "createdAt"
        FROM "Cluster"
        WHERE id = %s
    """
    
    try:
        result = execute_query(query, params=(cluster_id,), fetch=True)
        if result:
            return result[0]
        return None
    except Exception as e:
        logger.error(f"Error fetching cluster info: {e}")
        raise
