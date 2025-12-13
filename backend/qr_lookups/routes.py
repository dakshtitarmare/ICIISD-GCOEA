from flask import Blueprint, request, current_app
from datetime import date
from utils.supabase_client import supabase 

qr_bp = Blueprint("qr_codes", __name__)

# =====================================================
# 1. LOOKUP QR — GET USER + MEAL STATUS
# =====================================================

@qr_bp.get("/look_up/<qr_hash>")
def lookup_qr(qr_hash):

    try:
        qr = supabase.table("qr_codes") \
            .select("*") \
            .eq("qr_hash", qr_hash) \
            .single() \
            .execute().data

        if not qr:
            return {"error": "Invalid QR"}, 404

        if qr["assigned_to"] is None:
            return {
                "status": "unassigned",
                "message": "QR not assigned to anyone"
            }

        user_id = qr["assigned_to"]

        # Fetch user
        user = supabase.table("users") \
            .select("id, name, email, phone") \
            .eq("id", user_id) \
            .single() \
            .execute().data

        # Fetch today's meal
        today = date.today().isoformat()
        meal = supabase.table("meals") \
            .select("*") \
            .eq("user_id", user_id) \
            .eq("date", today) \
            .single() \
            .execute().data

        meal_info = {
            "breakfast": meal["breakfast_consume"] if meal else False,
            "lunch": meal["lunch_consume"] if meal else False,
            "tea": meal["tea_consumed"] if meal else False
        }

        return {
            "status": "assigned",
            "qr_hash": qr_hash,
            "user": user,
            "meals_today": meal_info
        }

    except Exception as e:
        return {"error": str(e)}, 500


# =====================================================
# 2. ASSIGN QR → USER
# =====================================================

@qr_bp.post("/assign")
def assign_qr():
    supabase = current_app.supabase
    data = request.json

    qr_hash = data.get("qr_hash")
    user_id = data.get("user_id")
    admin_id = data.get("admin_id")

    if not all([qr_hash, user_id]):
        return {"error": "qr_hash and user_id required"}, 400

    try:
        # Check QR exists
        qr = supabase.table("qr_codes").select("*").eq("qr_hash", qr_hash).single().execute().get("data")
        if not qr:
            return {"error": "Invalid QR"}, 404

        if qr["assigned_to"]:
            return {"error": "Already assigned"}, 409

        # Assign QR
        supabase.table("qr_codes").update({
            "assigned_to": user_id,
            "assigned_by": admin_id
        }).eq("qr_hash", qr_hash).execute()

        return {"message": "QR assigned successfully", "qr_hash": qr_hash, "assigned_to": user_id}

    except Exception as e:
        return {"error": str(e)}, 500


# =====================================================
# 3. UNASSIGN QR
# =====================================================

@qr_bp.post("/unassign")
def unassign_qr():
    supabase = current_app.supabase
    data = request.json

    qr_hash = data.get("qr_hash")

    if not qr_hash:
        return {"error": "qr_hash required"}, 400

    try:
        qr = supabase.table("qr_codes").select("*").eq("qr_hash", qr_hash).single().execute().get("data")

        if not qr:
            return {"error": "Invalid QR"}, 404

        supabase.table("qr_codes").update({
            "assigned_to": None,
            "assigned_by": None
        }).eq("qr_hash", qr_hash).execute()

        return {"message": "QR unassigned successfully"}

    except Exception as e:
        return {"error": str(e)}, 500


# =====================================================
# 4. UPDATE QR ASSIGNMENT (REASSIGN)
# =====================================================

@qr_bp.post("/update")
def update_assignment():
    supabase = current_app.supabase
    data = request.json

    qr_hash = data.get("qr_hash")
    new_user = data.get("new_user_id")
    admin_id = data.get("admin_id")

    if not all([qr_hash, new_user]):
        return {"error": "qr_hash & new_user_id required"}, 400

    try:
        qr = supabase.table("qr_codes").select("*").eq("qr_hash", qr_hash).single().execute().get("data")

        if not qr:
            return {"error": "Invalid QR"}, 404

        supabase.table("qr_codes").update({
            "assigned_to": new_user,
            "assigned_by": admin_id
        }).eq("qr_hash", qr_hash).execute()

        return {"message": "QR reassigned successfully"}

    except Exception as e:
        return {"error": str(e)}, 500


# =====================================================
# 5. GET NEXT AVAILABLE UNASSIGNED QR
# =====================================================

@qr_bp.get("/unassigned")
def get_unassigned_qr():
    supabase = current_app.supabase

    try:
        qr = supabase.table("qr_codes") \
            .select("*") \
            .is_("assigned_to", None) \
            .limit(1) \
            .execute().get("data")

        if not qr:
            return {"error": "No unassigned QR available"}

        return {"qr": qr[0]}

    except Exception as e:
        return {"error": str(e)}, 500