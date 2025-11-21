from app.services.embeddings import load_embedding_model, extract_embedding
from app.services.preprocess import preprocess_audio
import numpy as np

from pathlib import Path

SAMPLE = str(Path(__file__).resolve().parent / "sample_audio" / "beary.m4a")

def test_embeddings():
    feat, model = load_embedding_model("facebook/wav2vec2-large-xlsr-53")
    audio, _ = preprocess_audio(SAMPLE)

    emb = extract_embedding(feat, model, audio)

    assert isinstance(emb, np.ndarray)
    assert emb.ndim == 1          
    assert 100 < len(emb) < 2000  
