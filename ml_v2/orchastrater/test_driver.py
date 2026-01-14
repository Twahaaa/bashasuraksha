# orchestrator/test_driver.py
import sys
# Fix python path to find 'services'
sys.path.append(".") 

from services.remote_encoder import get_audio_embedding

# Make a dummy file to test
with open("test_audio.txt", "w") as f:
    f.write("This is fake audio data")

try:
    print("Attempting to talk to Encoder...")
    vector = get_audio_embedding("test_audio.txt")
    print("\nSUCCESS! Received Vector:")
    print(vector)
except Exception as e:
    print(f"\nFAILED: {e}")