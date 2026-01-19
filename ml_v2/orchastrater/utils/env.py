import os
import sys
from dotenv import load_dotenv

load_dotenv()

def get_env_variable(key: str, default: str = None, required: bool = False) -> str:
    value = os.getenv(key, default)
    if required and not value:
        print(f"CRITICAL ERROR: Missing environment variable '{key}'")
        sys.exit(1)
    return value

DATABASE_URL = get_env_variable("DATABASE_URL", required=True)
ENCODER_URL = get_env_variable("ENCODER_URL", "http://localhost:8001")

SUPABASE_URL = get_env_variable("SUPABASE_URL", required=True)
SUPABASE_KEY = get_env_variable("SUPABASE_KEY", required=True)
SUPABASE_BUCKET = get_env_variable("SUPABASE_BUCKET", "audio-uploads")