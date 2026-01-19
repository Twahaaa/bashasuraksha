# orchestrator/services/remote_encoder.py
import requests
import os
from utils.logger import get_logger
from utils.env import ENCODER_URL

logger = get_logger(__name__)
  
def get_audio_embedding(file_path: str):
    """
    Sends an audio file to the Encoder service and returns the vector.
    """
    
    url = f"{ENCODER_URL}/vectorize"

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"AudioFIle not found at:{file_path}")

    logger.info(f"Sending {file_path} to Encoder service at {url}...")

    try:
        with open(file_path,"rb") as f:
            files = {"file": f}
            response = requests.post(url, files=files)

        response.raise_for_status()
        data = response.json()

        return data["embedding"]

    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to contact Encoder service: {e}")
        raise

    except KeyError:
        logger.error(f"Encoder response did not contain 'embedding' field. Response: {data}")
        raise ValueError("Invalid response format from Encoder")