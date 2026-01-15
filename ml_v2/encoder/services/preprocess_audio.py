from fastapi import UploadFile
import numpy as np
import librosa
import tempfile
import os
import shutil


def preprocess_audio(file: UploadFile):
    SAMPLE_RATE = 16000
    filename = file.filename or "audio.wav"
    file_ext = os.path.splitext(filename)[1] 
    
    try:

        with tempfile.NamedTemporaryFile(suffix=file_ext) as tmp:
            
            shutil.copyfileobj(file.file, tmp)
            tmp.flush()

            audio, sr = librosa.load(tmp.name, sr=SAMPLE_RATE, mono=True)

            return audio


    except Exception as e:
        raise ValueError(f"Failed to procces audio:{e}")
