# ml/app/services/audio_processor.py

import numpy as np

from .preprocess import preprocess_audio
from .whisper_utils import load_whisper_model, detect_language, transcribe_audio
from .embeddings import load_embedding_model, extract_embedding
from .clusturing import cluster_embedding
from .extract_keywords import extract_keywords

class AudioProcessor:

    def __init__(self, whisper_model="tiny", embed_model="ai4bharat/indicwav2vec_v1", clustering_eps=5, conf_threshold=0.75):
        """
        Initialize ML models once (FastAPI container will reuse this object).
        """

        # Load Whisper model (tiny is best for speed)
        self.whisper = load_whisper_model(whisper_model)

        # Load embedding model
        self.feature_extractor, self.embedding_model = load_embedding_model(embed_model)

        # Store embeddings history (in-memory for now; later move to DB)
        self.embeddings_history = []

        # Clustering config
        self.clustering_eps = clustering_eps
        self.conf_threshold = conf_threshold


    # -----------------------------------------------------
    # MAIN PIPELINE
    # -----------------------------------------------------
    def process(self, path: str):
        """
        Full inference pipeline:
        1. Preprocess audio
        2. Whisper LID
        3. Whisper STT
        4. Extract embeddings
        5. Conditional clustering
        6. JSON output
        """

        # Step 1 — Preprocess (load audio waveform)
        audio, sr = preprocess_audio(path)

        # Step 2 — Whisper LID (language + confidence)
        lang, confidence = detect_language(self.whisper, audio)

        # Step 3 — Whisper STT
        transcript = transcribe_audio(self.whisper, path)

        # Step 4 — Embedding extraction
        embedding = extract_embedding(self.feature_extractor, self.embedding_model, audio)

        # Step 5 — Conditional clustering
        cluster_id = None
        if confidence < self.conf_threshold:
            cluster_id = cluster_embedding(embedding, self.embeddings_history, eps=self.clustering_eps)
            self.embeddings_history.append(embedding)

        extracted_keywords = extract_keywords(text=transcript)

        # Step 6 — Construct JSON response
        return {
            "language": lang,
            "confidence": confidence,
            "transcript": transcript,
            "cluster_id": cluster_id,
            "extracted_keywords": extract_keywords
        }
