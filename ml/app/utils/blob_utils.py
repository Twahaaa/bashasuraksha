from azure.storage.blob import BlobServiceClient
from app.utils.env import get_env
import uuid

def get_blob_client():
    conn_str = get_env("AZURE_BLOB_CONNECTION_STRING")
    return BlobServiceClient.from_connection_string(conn_str)

def upload_to_blob(container: str, file_path: str):
    """
    Uploads local file to Azure Blob Storage and returns public URL.
    """
    blob_service = get_blob_client()
    blob_name = f"{uuid.uuid4()}.wav"

    container_client = blob_service.get_container_client(container)

    with open(file_path, "rb") as data:
        container_client.upload_blob(blob_name, data)

    # Public URL (if container is public or SAS is used)
    return f"{container_client.url}/{blob_name}"
