from app.services.preprocess import preprocess_audio
import os

SAMPLE = "ml/tests/sample_audio/sample.wav"

def test_preprocess():
    assert os.path.exists(SAMPLE), "Sample audio missing! Add sample.wav to tests"
    
    audio, sr = preprocess_audio(SAMPLE)

    assert isinstance(audio, list) or hasattr(audio, "__len__")
    assert sr == 16000
    assert len(audio) > 0
