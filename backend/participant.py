from flask import Blueprint, request
from db import get_connection
from utils import response

participant = Blueprint("participant", __name__, url_prefix="/api")

@participant.get("/participant/search")
def search():
    email = request.args.get("email")
    if not email:
        return response(False, "email required", None, 400)

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT * FROM participants WHERE email=%s", (email,))
        row = cur.fetchone()
    except Exception as e:
        conn.close()
        return response(False, f"DB error: {str(e)}", None, 500)

    conn.close()

    if not row:
        return response(True, "Participant not found", {"exists": False})

    return response(True, "Participant found", {"exists": True, "participant": row})
