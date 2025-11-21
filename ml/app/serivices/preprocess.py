import librosa

SAMPLE_RATE = 16000

def preprocess_audio(path: str):
    
    audio, sr = librosa.load(path, sr=SAMPLE_RATE, mono=True)
    return audio, sr
