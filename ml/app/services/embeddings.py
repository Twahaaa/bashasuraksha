import torch
import librosa
from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2Model
from pathlib import Path

SAMPLE_RATE = 16000

def load_embedding_model(model_name="facebook/wav2vec2-large-xlsr-53"):
    # Get absolute path to models directory
    base_path = Path(__file__).resolve().parent.parent / "models" / "indicwav2vec"
    
    feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained(
        model_name,
        cache_dir=str(base_path)
    )
    model = Wav2Vec2Model.from_pretrained(
        model_name,
        cache_dir=str(base_path)
    )
    return feature_extractor, model

def extract_embedding(feature_extractor, model, audio):
    
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
