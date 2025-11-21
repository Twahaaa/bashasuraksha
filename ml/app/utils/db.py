import os
from contextlib import contextmanager
from typing import Optional
import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Global connection pool
_connection_pool: Optional[pool.SimpleConnectionPool] = None


def get_database_url() -> str:
    """Get database URL from environment variable."""
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError(
            "DATABASE_URL environment variable is not set. "
            "Please provide a PostgreSQL connection string."
        )
    return db_url


def initialize_pool(minconn: int = 1, maxconn: int = 10):
    """Initialize the connection pool."""
    global _connection_pool
    
    if _connection_pool is not None:
        logger.warning("Connection pool already initialized")
        return
    
    try:
        db_url = get_database_url()
        _connection_pool = pool.SimpleConnectionPool(
            minconn,
            maxconn,
            dsn=db_url
        )
        logger.info("Database connection pool initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize connection pool: {e}")
        raise


def close_pool():
    """Close all connections in the pool."""
    global _connection_pool
    
    if _connection_pool is not None:
        _connection_pool.closeall()
        _connection_pool = None
        logger.info("Database connection pool closed")


@contextmanager
def get_db_connection():
    """
    Context manager for database connections.
    
    Usage:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM table")
                results = cursor.fetchall()
    """
    global _connection_pool
    
    if _connection_pool is None:
        initialize_pool()
    
    conn = None
    try:
        conn = _connection_pool.getconn()
        yield conn
        conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        if conn:
            _connection_pool.putconn(conn)


def execute_query(query: str, params: tuple = None, fetch: bool = True):
    """
    Execute a SQL query and optionally fetch results.
    
    Args:
        query: SQL query string
        params: Query parameters (for parameterized queries)
        fetch: Whether to fetch and return results
        
    Returns:
        List of dictionaries if fetch=True, None otherwise
    """
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, params)
            
            if fetch:
                return cursor.fetchall()
            return None
