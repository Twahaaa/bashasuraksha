# orchestrator/test_driver.py
import sys
import os
# Fix python path to find 'services'
sys.path.append(".") 

from services.remote_encoder import get_audio_embedding

try:
    print("Attempting to talk to Encoder...")
    vector = get_audio_embedding("../audios/English.m4a")
    print("\nSUCCESS! Received Vector:")
    print(vector)
except Exception as e:
    print(f"\nFAILED: {e}")