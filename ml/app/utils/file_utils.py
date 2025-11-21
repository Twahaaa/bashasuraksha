import uuid
import os

def save_temp_file(upload_file) -> str:
    """
    Saves an uploaded file to a temp location and returns the file path.
    """
    temp_path = f"/tmp/{uuid.uuid4()}_{upload_file.filename}"

    with open(temp_path, "wb") as f:
        f.write(upload_file)

    return temp_path


def delete_file(path: str):
    """
    Safely deletes a file if exists.
    """
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception:
        pass
