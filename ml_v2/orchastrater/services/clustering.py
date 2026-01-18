from math import dist
from turtle import update
import numpy as np
from sklearn.metrics.pairwise import cosine_distances
from utils.logger import get_logger

logger = get_logger("clustering")


# 0.0 = Identical and 1.0 = Completely Opposite
SIMILARITY_THRESHOLD = 0.2

def find_best_cluster(new_embedding: list, existing_clusters: list):
    """
        args:
            new_embedding: the embedding vector of the users voice
            existing_clusters: a list of dicts of all the clusters 
        
        output:
            tuple(best_cluster_id, distance) or (None, None) if None exists
    """
    if not existing_clusters:
        return (None, None)
    
    centroids = np.array([c['centroid'] for c in existing_clusters])
    
    user_vector = np.array(new_embedding).reshape(1,-1)
    
    """
        The [0] here is used to flatten the list 
        example output without [0]:
            [
                [0.1,0.2,0.3]
            ]
        with [0]:
            [0.1,0.2,0.3]
    """
    dists = cosine_distances(user_vector,centroids)[0]
    
    min_dist_index = np.argmin(dists)
    min_dist = dists[min_dist_index]
    
    best_cluster = existing_clusters[min_dist_index]
    
    logger.info(f"Closest cluster: ID {best_cluster['id']} and Distance {min_dist:.4f}") 
    
    if min_dist < SIMILARITY_THRESHOLD:
        return best_cluster['id'], flaot(min_dist)
    else:
        logger.info(f"No match found. CLosest was {min_dist:.4f} > {SIMILARITY_THRESHOLD}")
        return None, float(min_dist)
    
def calculate_new_centroid(current_centroid: list, current_count: int, new_embedding: list):
    """
        Updates a specific clusters centroid using a wighted average with the formula:
        
        New = ((Old * Count) + New_sample) / Count+1
    """    
    old_vec = np.array(current_centroid)
    
    new_vec = np.array(new_embedding)
    
    udpated_vec = ((old_vec * current_count) + new_vec) / (current_count + 1)
    
    return updated_vec.tolist()
    
