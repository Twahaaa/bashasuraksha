import os

def get_env(key: str, default=None):
    
    return os.getenv(key, default)
