import json 
from utils.db import excecute_query
from utils.logger import get_logger

logger = get_logger("db_clusters")

def get_all_clusters():
    query = 'SELECT "id", "centroid", "sampleCount" FROM "Cluster";'
    
    return excecute_query(query, fetch_all=True)

def create_new_cluster(centroid: list):
    
    query = """
        INSERT INTO "Cluster" ("centroid", "sampleCount","createdAt") VALUES (%s::jsonb, 1, NOW())
        RETURNING id;
    """
    
    centroid_json = json.dumps(centroid)
    result = excecute_query(query, (centroid_json,), fetch_one=True)
    logger.info(f"Created a new cluster with id: {result['id']}")
    
    return result['id']    

def update_cluster_centroid(cluster_id: int, new_centroid: list, new_count: int):
    
    query = """
        UPDATE "Cluster"
        SET "centroid" = %s::jsonb, "sampleCount" = %s
        WHERE "id" = %s;
    """
    
    centroid_json = json.dumps(new_centroid)
    excecute_query(query, (centroid_json, new_count, cluster_id))
    
    logger.info(f"Updated cluster: {cluster_id} centroid with the new count: {new_count}")
    
    
    