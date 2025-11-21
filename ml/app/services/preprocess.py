import librosa
import numpy as np

SAMPLE_RATE = 16000

def preprocess_audio(path: str):
    """
    Loads audio from a file and returns:
    - audio: numpy array (float32)
    - sr: sample rate
    """

    # Handle Azure invalid paths / missing file errors
    try:
        audio, sr = librosa.load(path, sr=SAMPLE_RATE, mono=True)
    except Exception as e:
        raise ValueError(f"Failed to load audio from {path}: {e}")

    # Ensure we always return float32 (some models require this)
    audio = np.asarray(audio, dtype=np.float32)

    return audio, sr
