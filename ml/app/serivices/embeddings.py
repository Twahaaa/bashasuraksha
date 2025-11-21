import torch
import librosa
from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2Model

SAMPLE_RATE = 16000

def load_embedding_model(model_name="ai4bharat/indicwav2vec_v1"):
    feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained(
        model_name,
        cache_dir="ml/app/models/indicwav2vec"
    )
    model = Wav2Vec2Model.from_pretrained(
        model_name,
        cache_dir="ml/app/models/indicwav2vec"
    )
    return feature_extractor, model

def extract_embedding(feature_extractor, model, audio):
    """
    Returns a numpy embedding vector (mean pooled last hidden state).
    """
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
