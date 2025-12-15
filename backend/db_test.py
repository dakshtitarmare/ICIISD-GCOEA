import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    try:
        # Get DB URL from environment variables
        db_url = os.getenv("SUPABASE_DB_URL")
        if not db_url:
            raise ValueError("SUPABASE_DB_URL not found in environment variables.")
        
        # Connect to PostgreSQL
        conn = psycopg2.connect(db_url, cursor_factory=RealDictCursor)
        print("✅ Successfully connected to the database!")
        return conn

    except Exception as e:
        print("❌ Error connecting to the database:", e)
        return None

# Example usage
if __name__ == "__main__":
    connection = get_connection()
    if connection:
        connection.close()
        print("Connection closed.")
