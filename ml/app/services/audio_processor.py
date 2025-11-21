# ml/app/services/audio_processor.py

import numpy as np

from .preprocess import preprocess_audio
from .whisper_utils import load_whisper_model, detect_language, transcribe_audio
from .embeddings import load_embedding_model, extract_embedding
from .clustering import cluster_embedding

class AudioProcessor:
    def __init__(self, whisper_model="tiny", embed_model="facebook/wav2vec2-large-xlsr-53", clustering_eps=5, conf_threshold=0.75):
        
        self.whisper = load_whisper_model(whisper_model)

        self.feature_extractor, self.embedding_model = load_embedding_model(embed_model)

        self.embeddings_history = []
        self.clustering_eps = clustering_eps
        self.conf_threshold = conf_threshold


    def process(self, path: str):
        

        audio, sr = preprocess_audio(path)

        lang, confidence = detect_language(self.whisper, audio)

        transcript = transcribe_audio(self.whisper, path)

        embedding = extract_embedding(self.feature_extractor, self.embedding_model, audio)

        cluster_id = None
        if confidence < self.conf_threshold:
            cluster_id = cluster_embedding(embedding, self.embeddings_history, eps=self.clustering_eps)
            self.embeddings_history.append(embedding)


        return {
            "language": lang,
            "confidence": confidence,
            "transcript": transcript,
            "cluster_id": cluster_id,
            "embedding": embedding.tolist(),
        }
