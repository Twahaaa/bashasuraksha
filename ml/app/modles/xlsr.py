from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2Model

model_id = "facebook/wav2vec2-large-xlsr-53"

feature = Wav2Vec2FeatureExtractor.from_pretrained(model_id, cache_dir="ml/app/models/xlsr")
model = Wav2Vec2Model.from_pretrained(model_id, cache_dir="ml/app/models/xlsr")
