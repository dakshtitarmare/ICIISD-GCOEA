from flask import Blueprint, request
from db import get_connection
from utils import response
from dotenv import load_dotenv

load_dotenv()
qr = Blueprint("qr", __name__, url_prefix="/api")

# -----------------------------------------------------------
# CHECK QR STATUS
# -----------------------------------------------------------
@qr.get("/qr/check")
def check_qr():
    qr_hash = request.args.get("qr_hash")

    if not qr_hash:
        return response(False, "qr_hash required", None, 400)

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT * FROM qr_pool WHERE qr_hash=%s", (qr_hash,))
        row = cur.fetchone()
    except Exception as e:
        conn.close()
        return response(False, f"DB error: {str(e)}", None, 500)

    conn.close()

    if not row:
        return response(True, "QR not found", {"exists": False})

    return response(True, "QR found", {
        "exists": True,
        "is_assigned": row.get("is_assigned", False),
        "assigned_to_email": row.get("assigned_to_email")
    })


# -----------------------------------------------------------
# ASSIGN QR TO PARTICIPANT (NO AUTH CHECK — permissive)
# -----------------------------------------------------------

@qr.post("/qr/assign")
def assign_qr():
    body = request.get_json()

    qr_hash = body.get("qr_hash")
    email = body.get("email")

    if not qr_hash or not email:
        return response(False, "qr_hash and email are required", 422)

    try:
        conn = get_connection()
        cur = conn.cursor()

        cur.execute("""
            UPDATE qr_pool
            SET 
                is_assigned = TRUE,
                assigned_to_email = %s,
                assigned_by_member_id = NULL,  -- or add your member id
                updated_at = NOW()
            WHERE qr_hash = %s
            RETURNING id;
        """, (email, qr_hash))

        updated = cur.fetchone()
        conn.commit()
        conn.close()

        if not updated:
            return response(False, "QR not found", 404)

        return response(True, "QR assigned successfully")

    except Exception as e:
        return response(False, f"DB error: {e}")
