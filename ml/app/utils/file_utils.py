import uuid
import os

def save_temp_file(upload_file) -> str:
    
    temp_path = f"/tmp/{uuid.uuid4()}_{upload_file.filename}"

    with open(temp_path, "wb") as f:
        f.write(upload_file)

    return temp_path


def delete_file(path: str):
    
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception:
        pass
