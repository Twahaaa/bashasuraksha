from app.services.embeddings import load_embedding_model, extract_embedding
from app.services.preprocess import preprocess_audio
import numpy as np

SAMPLE = "ml/tests/sample_audio/sample.wav"

def test_embeddings():
    feat, model = load_embedding_model("ai4bharat/indicwav2vec_v1")
    audio, _ = preprocess_audio(SAMPLE)

    emb = extract_embedding(feat, model, audio)

    assert isinstance(emb, np.ndarray)
    assert emb.ndim == 1          
    assert 100 < len(emb) < 2000  
