from faster_whisper import WhisperModel
from utils.logger import get_logger
import os

logger = get_logger("whisper-app")

MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE","small")
DEVICE = "cpu"
COMPUTE_TYPE = "int8"

class WhisperService:
    _instance = None 
    
    @classmethod
    def get_instance(cls):
        
        if cls._instance is None:
            logger.info(f"Loading whisper model '{MODEL_SIZE}' on {DEVICE}")
            cls._instance = WhisperModel(MODEL_SIZE,device=DEVICE,compute_type=COMPUTE_TYPE)
            logger.info(f"Loaded whisper model successfully")
        return cls._instance

def transcribe_audio(file_path: str):
    model = WhisperService.get_instance()

    try:

        segments, info = model.transcribe(
            file_path,
            beam_size = 5,
            vad_filter = True,
            vad_parameters = dict(min_silence_duration_ms = 500)
        )

        full_text = " ".join([segment.text for segment in segments]).strip()

        result = {
            "text" : full_text,
            "language" : info.language,
            "probability" : info.language_probability
        }

        logger.info(f"Transcribed audio successfully: {info.language} ({info.language_probability:.2f})")

        return result
    
    except Exception as e:
        logger.error(f"Failed to transcribe audio: {e}")
        raise

