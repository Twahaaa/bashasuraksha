import time
import mimetypes
from supabase import create_client, Client, ClientOptions
from utils.env import SUPABASE_URL, SUPABASE_KEY, SUPABASE_BUCKET
from utils.logger import get_logger

logger = get_logger("supabase_storage")

# Initialize the Supabase client with a longer timeout for storage
supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY,
    options=ClientOptions(storage_client_timeout=60)
)

def upload_audio_file(file_path: str, original_filename: str) -> str:
    try:
        # Check if the file is an audio file
        content_type, _ = mimetypes.guess_type(original_filename)
        if not content_type or not content_type.startswith("audio/"):
            raise ValueError(f"File '{original_filename}' is not an audio file.")

        timestamp = int(time.time())
        unique_name = f"{timestamp}_{original_filename}"

        logger.info(f"Uploading {unique_name} to Supabase bucket '{SUPABASE_BUCKET}'...")

        # Upload the file using the Supabase client
        with open(file_path, "rb") as f:
            response = supabase.storage.from_(SUPABASE_BUCKET).upload(
                path=unique_name,
                file=f,
                file_options={"x-upsert": "false", "content-type": content_type}
            )

        # The key for the uploaded object is in the response JSON
        logger.info(f"Supabase upload response: {response}")


        # Get the public URL
        public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(unique_name)

        logger.info(f"Upload successful. Public URL: {public_url}")
        return public_url

    except Exception as e:
        # Log the full error from Supabase if available
        logger.error(f"Supabase upload failed: {e}")
        raise e
        
