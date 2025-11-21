import whisper
from pathlib import Path

def load_whisper_model(model_name="tiny"):
    base_path = Path(__file__).resolve().parent.parent / "models" / "whisper"
    return whisper.load_model(model_name, download_root=str(base_path))


def detect_language(model, audio):
    
    audio = whisper.pad_or_trim(audio)
    mel = whisper.log_mel_spectrogram(audio).to(model.device)
    
    _, probs = model.detect_language(mel)
    lang = max(probs, key=probs.get)
    confidence = float(probs[lang])
    
    return lang, confidence

def transcribe_audio(model, path: str):
    """
    Whisper STT.
    """
    result = model.transcribe(path)
    return result["text"]
