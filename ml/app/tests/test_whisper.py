from app.services.whisper_utils import load_whisper_model, detect_language
from app.services.preprocess import preprocess_audio

from pathlib import Path

SAMPLE = str(Path(__file__).resolve().parent / "sample_audio" / "beary.m4a")

def test_whisper_lid():
    model = load_whisper_model("tiny")
    audio, _ = preprocess_audio(SAMPLE)

    lang, conf = detect_language(model, audio)

    assert isinstance(lang, str)
    assert 0 <= conf <= 1
