# orchestrator/test_driver.py
import sys
import os
# Fix python path to find 'services'
sys.path.append(".") 

from services.remote_encoder import get_audio_embedding
from services.whisper_utils import transcribe_audio

try:
    print("Attempting to talk to Encoder...")
    # vector = get_audio_embedding("../audios/English.m4a")
    result = transcribe_audio("../audios/English.m4a")
    print("\nSUCCESS! Received Vector:")
    # print(vector)
    print(result)
except Exception as e:
    print(f"\nFAILED: {e}")