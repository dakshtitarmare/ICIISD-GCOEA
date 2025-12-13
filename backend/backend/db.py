import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    conn = psycopg2.connect(os.getenv("SUPABASE_DB_URL"), cursor_factory=RealDictCursor)
    return conn
