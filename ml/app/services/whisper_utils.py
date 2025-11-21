import whisper
from functools import lru_cache
from pathlib import Path

@lru_cache()
def load_whisper_model(model_name="small"):
    base_path = Path(__file__).resolve().parent.parent / "models" / "whisper"
    return whisper.load_model(model_name, download_root=str(base_path))


def detect_language(audio):
    model = load_whisper_model()

    audio = whisper.pad_or_trim(audio)
    mel = whisper.log_mel_spectrogram(audio).to(model.device)

    _, probs = model.detect_language(mel)
    lang = max(probs, key=probs.get)
    confidence = float(probs[lang])
    
    return lang, confidence


def transcribe_audio(path: str):
    """
    Whisper speech-to-text.
    """
    model = load_whisper_model()
    result = model.transcribe(path)
    return result["text"]
