# ml/app/services/audio_processor.py

import numpy as np

from .preprocess import preprocess_audio
from .whisper_utils import load_whisper_model, detect_language, transcribe_audio
from .embeddings import load_embedding_model, extract_embedding
from .clustering import cluster_embedding, cluster_embedding_with_db
from app.utils.logger import get_logger

logger = get_logger(__name__)

class AudioProcessor:
    def __init__(
        self, 
        whisper_model="tiny", 
        embed_model="facebook/wav2vec2-large-xlsr-53", 
        clustering_eps=5, 
        conf_threshold=0.75,
        similarity_threshold=0.85,
        use_db_clustering=True
    ):
        
        self.whisper = load_whisper_model(whisper_model)

        self.feature_extractor, self.embedding_model = load_embedding_model(embed_model)

        # Legacy in-memory history (kept for backward compatibility)
        self.embeddings_history = []
        self.clustering_eps = clustering_eps
        self.conf_threshold = conf_threshold
        
        # New database-backed clustering settings
        self.similarity_threshold = similarity_threshold
        self.use_db_clustering = use_db_clustering


    def process(self, path: str):
        

        audio, sr = preprocess_audio(path)

        lang, confidence = detect_language(audio)

        transcript = transcribe_audio(path)

        embedding = extract_embedding(audio)

        cluster_id = None
        similarity_score = None
        is_new_cluster = False
        
        if confidence < self.conf_threshold:
            if self.use_db_clustering:
                # Use database-backed clustering
                try:
                    from app.services.db_embeddings import get_embeddings_as_numpy
                    from app.services.db_clusters import create_new_cluster
                    
                    # Fetch all existing embeddings from database
                    db_ids, db_embeddings = get_embeddings_as_numpy()
                    
                    if len(db_ids) > 0:
                        # Get all samples to extract their cluster IDs
                        from app.services.db_embeddings import get_all_embeddings
                        db_samples = get_all_embeddings()
                        db_cluster_ids = [sample.get('cluster_id') for sample in db_samples]
                        
                        # Use new clustering function
                        cluster_id, similarity_score = cluster_embedding_with_db(
                            embedding=embedding,
                            db_embeddings=db_embeddings,
                            db_cluster_ids=db_cluster_ids,
                            similarity_threshold=self.similarity_threshold,
                            eps=self.clustering_eps,
                            use_dbscan=False  # Use similarity-based approach
                        )
                        
                        # If no similar cluster found, create a new one
                        if cluster_id is None:
                            cluster_id = create_new_cluster(centroid=embedding)
                            is_new_cluster = True
                            logger.info(
                                f"Created new cluster {cluster_id} (similarity {similarity_score:.4f} "
                                f"below threshold {self.similarity_threshold})"
                            )
                        else:
                            logger.info(
                                f"Assigned to existing cluster {cluster_id} "
                                f"(similarity {similarity_score:.4f})"
                            )
                    else:
                        # First sample - create first cluster
                        cluster_id = create_new_cluster(centroid=embedding)
                        is_new_cluster = True
                        similarity_score = 0.0
                        logger.info(f"Created first cluster {cluster_id} (no existing embeddings)")
                        
                except Exception as e:
                    logger.warning(f"Database clustering failed, falling back to in-memory: {e}")
                    # Fallback to legacy in-memory clustering
                    cluster_id = cluster_embedding(embedding, self.embeddings_history, eps=self.clustering_eps)
                    self.embeddings_history.append(embedding)
            else:
                # Legacy in-memory clustering
                cluster_id = cluster_embedding(embedding, self.embeddings_history, eps=self.clustering_eps)
                self.embeddings_history.append(embedding)


        result = {
            "language": lang,
            "confidence": confidence,
            "transcript": transcript,
            "cluster_id": cluster_id,
            "embedding": embedding.tolist(),
        }
        
        # Add similarity score if available
        # if similarity_score is not None:
            # result["similarity_score"] = similarity_score
        
        # Add flag if new cluster was created
        # if is_new_cluster:
            # result["is_new_cluster"] = True
        
        return result

