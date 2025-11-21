from transformers import Wav2Vec2FeatureExtractor, Wav2Vec2Model

model_id = "ai4bharat/indicwav2vec_v1"

feature = Wav2Vec2FeatureExtractor.from_pretrained(model_id, cache_dir="ml/app/models/indicwav2vec")
model = Wav2Vec2Model.from_pretrained(model_id, cache_dir="ml/app/models/indicwav2vec")
