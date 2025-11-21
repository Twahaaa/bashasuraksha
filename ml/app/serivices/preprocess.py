import librosa

SAMPLE_RATE = 16000

def preprocess_audio(path: str):
    """
    Loads and normalizes audio. Returns (waveform, sample_rate).
    """
    audio, sr = librosa.load(path, sr=SAMPLE_RATE, mono=True)
    return audio, sr
