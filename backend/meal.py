from flask import Blueprint, request
from db import get_connection
from utils import response
from dotenv import load_dotenv
load_dotenv()
meal = Blueprint("meal", __name__, url_prefix="/api")


# -------------------------------------------------------
# GET /api/meal/status
# -------------------------------------------------------
@meal.get("/meal/status")
def meal_status():
    qr_hash = request.args.get("qr_hash")
    if not qr_hash:
        return response(False, "qr_hash required", None, 400)

    conn = get_connection()
    cur = conn.cursor()

    try:
        # 1) Check if QR exists
        cur.execute("SELECT * FROM qr_pool WHERE qr_hash=%s", (qr_hash,))
        qr_row = cur.fetchone()

        if not qr_row:
            conn.close()
            return response(False, "QR not found", None, 404)

        assigned_email = qr_row.get("assigned_to_email")
        if not assigned_email:
            conn.close()
            return response(False, "QR not assigned to participant", None, 400)

        # 2) Fetch participant
        cur.execute("SELECT * FROM participants WHERE email=%s", (assigned_email,))
        participant_row = cur.fetchone()

        if not participant_row:
            conn.close()
            return response(False, "Participant not found", None, 404)

        # 3) Fetch meal row
        cur.execute("SELECT * FROM meal WHERE email=%s", (assigned_email,))
        meal_row = cur.fetchone()

        # Create EMPTY meal object if not found
        if not meal_row:
            meal_row = {
                "day1_breakfast": False,
                "day1_lunch": False,
                "day1_hitea": False,
                "day2_breakfast": False,
                "day2_lunch": False,
                "day2_hitea": False,
            }

        conn.close()

        return response(True, "Meal status", {
            "email": assigned_email,
            "participant": participant_row,
            "meals": meal_row
        })

    except Exception as e:
        conn.close()
        return response(False, f"DB error: {str(e)}", None, 500)



# -------------------------------------------------------
# POST /api/meal/update
# -------------------------------------------------------
@meal.post("/meal/update")
def update_meal():
    body = request.get_json()

    qr_hash = body.get("qr_hash")
    meal_type = body.get("meal_type")    # breakfast / lunch / hitea
    day = body.get("day")                # 1 or 2

    if not qr_hash or not meal_type or not day:
        return response(False, "qr_hash, meal_type, day required", None, 400)

    if meal_type not in ["breakfast", "lunch", "hitea"]:
        return response(False, "Invalid meal_type", None, 400)

    if day not in [1, 2]:
        return response(False, "Invalid day. Must be 1 or 2", None, 400)

    # Determine correct column
    col = f"day{day}_" + meal_type

    conn = get_connection()
    cur = conn.cursor()

    try:
        # 1) Find assigned user
        cur.execute("SELECT * FROM qr_pool WHERE qr_hash=%s", (qr_hash,))
        qr_row = cur.fetchone()

        if not qr_row:
            conn.close()
            return response(False, "QR not found", None, 404)

        assigned_email = qr_row.get("assigned_to_email")
        if not assigned_email:
            conn.close()
            return response(False, "QR not assigned", None, 400)

        # 2) Insert or Update meal record
        cur.execute(f"""
            INSERT INTO meal (email, {col})
            VALUES (%s, TRUE)
            ON CONFLICT (email)
            DO UPDATE SET {col} = TRUE, updated_at = NOW()
        """, (assigned_email,))

        # 3) Fetch updated data
        cur.execute("SELECT * FROM meal WHERE email=%s", (assigned_email,))
        updated_meal = cur.fetchone()

        conn.commit()
        conn.close()

        return response(True, "Meal updated successfully", updated_meal)

    except Exception as e:
        conn.rollback()
        conn.close()
        return response(False, f"DB error: {str(e)}", None, 500)
