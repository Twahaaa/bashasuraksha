from app.services.whisper_utils import load_whisper_model, detect_language
from app.services.preprocess import preprocess_audio

SAMPLE = "ml/tests/sample_audio/sample.wav"

def test_whisper_lid():
    model = load_whisper_model("tiny")
    audio, _ = preprocess_audio(SAMPLE)

    lang, conf = detect_language(model, audio)

    assert isinstance(lang, str)
    assert 0 <= conf <= 1
