import torch
import librosa
from functools import lru_cache
from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2Model
from pathlib import Path

SAMPLE_RATE = 16000

# Lazily load model ONLY when first requested
@lru_cache()
def load_embedding_model(model_name="facebook/wav2vec2-large-xlsr-53"):
    base_path = Path(__file__).resolve().parent.parent / "models" / "wav2vec2"

    feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained(
        model_name,
        cache_dir=str(base_path)
    )
    model = Wav2Vec2Model.from_pretrained(
        model_name,
        cache_dir=str(base_path)
    )
    return feature_extractor, model


def extract_embedding(audio):
    feature_extractor, model = load_embedding_model()

    inputs = feature_extractor(
        audio,
        sampling_rate=SAMPLE_RATE,
        return_tensors="pt",
        padding=True,
    )

    with torch.no_grad():
        outputs = model(**inputs)
        embedding = outputs.last_hidden_state.mean(dim=1)

    return embedding.squeeze().numpy()
