import psycopg2
from psycopg2.extras import RealDictCursor
from utils.logger import get_logger
from utils.env import DATABASE_URL

logger = get_logger("db")

def get_db_connection():

    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        logger.error("Failed to connect to the db")
        raise

def excecute_query(query: str, params: tuple = None, fetch_one = False, fetch_all = False):

    conn = None

    try:
        conn = get_db_connection()

        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params)

            if fetch_one:
                result = cur.fetch_one()

            elif fetch_all:
                result = cur.fetch_all()

            else:
                result = None

            conn.commit()

            return result

    except Exception as e:
        if conn: 
            conn.rollback()
        logger.error(f"DB Query Failed: {e} | Query: {query}")
        raise

    finally: 
        if conn:
            conn.close()
