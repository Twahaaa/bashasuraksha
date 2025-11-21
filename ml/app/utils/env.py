import os
from dotenv import load_dotenv

load_dotenv()

def get_env(key: str, default=None):
    """
    Fetch environment variables safely.
    """
    return os.getenv(key, default)
