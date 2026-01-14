import logging
import sys

def get_logger(name="app"):
    logger = logging.getLogger(name)
    
    # Only add handler if not already added (prevents duplicate logs)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        # Log to Console (Standard Output)
        handler = logging.StreamHandler(sys.stdout)
        
        # Format: Time - ServiceName - Level - Message
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
    return logger

# Create a default instance
logger = get_logger()