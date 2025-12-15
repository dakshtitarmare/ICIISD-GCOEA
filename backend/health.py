from flask import Blueprint
from db import get_connection
from utils import response

health = Blueprint("health", __name__, url_prefix="/api")

@health.get("/health")
def health_check():
    """
    Returns the list of tables in the database for health check.
    """
    try:
        conn = get_connection()
        if not conn:
            return response(False, "Failed to connect to the database", None, 500)

        cur = conn.cursor()
        cur.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        """)
        tables = [row["table_name"] for row in cur.fetchall()]
        cur.close()
        conn.close()

        return response(True, "Database is reachable", {"tables": tables}, 200)

    except Exception as e:
        return response(False, f"Error fetching tables: {str(e)}", None, 500)
