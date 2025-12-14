

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
        whisper_model="small", 
        embed_model="facebook/wav2vec2-large-xlsr-53", 
        clustering_eps=5, 
        conf_threshold=0.75,
        similarity_threshold=0.85,
        use_db_clustering=True
    ):
        
        self.whisper = load_whisper_model(whisper_model)

        self.feature_extractor, self.embedding_model = load_embedding_model(embed_model)

        self.embeddings_history = []
        self.clustering_eps = clustering_eps
        self.conf_threshold = conf_threshold
        
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
                try:
                    from app.services.db_embeddings import get_embeddings_as_numpy
                    from app.services.db_clusters import create_new_cluster
                    
                    db_ids, db_embeddings = get_embeddings_as_numpy()
                    
                    if len(db_ids) > 0:
                        from app.services.db_embeddings import get_all_embeddings
                        db_samples = get_all_embeddings()
                        db_cluster_ids = [sample.get('cluster_id') for sample in db_samples]
                        
                        cluster_id, similarity_score = cluster_embedding_with_db(
                            embedding=embedding,
                            db_embeddings=db_embeddings,
                            db_cluster_ids=db_cluster_ids,
                            similarity_threshold=self.similarity_threshold,
                            eps=self.clustering_eps,
                            use_dbscan=False
                        )
                        
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
                        cluster_id = create_new_cluster(centroid=embedding)
                        is_new_cluster = True
                        similarity_score = 0.0
                        logger.info(f"Created first cluster {cluster_id} (no existing embeddings)")
                        
                except Exception as e:
                    logger.warning(f"Database clustering failed, falling back to in-memory: {e}")
                    cluster_id = cluster_embedding(embedding, self.embeddings_history, eps=self.clustering_eps)
                    self.embeddings_history.append(embedding)
            else:
                cluster_id = cluster_embedding(embedding, self.embeddings_history, eps=self.clustering_eps)
                self.embeddings_history.append(embedding)


        result = {
            "language": lang,
            "confidence": confidence,
            "transcript": transcript,
            "cluster_id": cluster_id,
            "embedding": embedding.tolist(),
        }
        
        return result
