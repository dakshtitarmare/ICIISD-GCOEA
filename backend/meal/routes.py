from flask import Blueprint, request
from datetime import date, datetime
from utils.supabase_client import supabase

food_bp = Blueprint("food", __name__)

@food_bp.get("/look_up/<qr_hash>")
def lookup_qr(qr_hash):
    try:
        # Step 1: Fetch QR data
        qr_res = supabase.table("qr_codes") \
            .select("*") \
            .eq("qr_hash", qr_hash) \
            .single() \
            .execute()

        if qr_res.get("error"):
            return {"error": "Invalid QR"}, 404

        qr = qr_res["data"]

        # Step 2: Check assignment
        assigned_to = qr["assigned_to"]

        if not assigned_to:
            return {
                "status": "unassigned",
                "message": "QR not assigned to anyone 😶‍🌫️"
            }, 200

        # Step 3: Fetch assigned user
        user_res = supabase.table("users").select("*").eq("id", assigned_to).single().execute()

        if user_res.get("error"):
            return {"error": "User assigned but record missing"}, 500

        user = user_res["data"]

        # Step 4: Fetch today's meal record
        today = date.today().isoformat()
        meal_res = supabase.table("meals") \
            .select("*") \
            .eq("user_id", assigned_to) \
            .eq("date", today) \
            .single() \
            .execute()

        if meal_res.get("error"):
            # User exists but today's meal entry missing → fallback
            meal_data = {
                "breakfast": False,
                "lunch": False,
                "tea": False
            }
        else:
            meal = meal_res["data"]
            meal_data = {
                "breakfast": meal["breakfast_consume"],
                "lunch": meal["lunch_consume"],
                "tea": meal["tea_consumed"]
            }

        return {
            "status": "assigned",
            "assigned_to": assigned_to,
            "user": user,
            "meals_today": meal_data
        }

    except Exception as e:
        return {"error": str(e)}, 500



@food_bp.post("/mark")
def mark_meal():
    try:
        data = request.json
        user_id = data.get("user_id")
        staff_id = data.get("staff_id")

        if not user_id or not staff_id:
            return {"error": "Missing user_id or staff_id"}, 400

        today = date.today().isoformat()

        # Fetch today’s meal entry
        meal_res = supabase.table("meals").select("*") \
            .eq("user_id", user_id) \
            .eq("date", today) \
            .single() \
            .execute()

        meal_exists = not meal_res.error

        # If not found → create new entry
        if not meal_exists:
            new_entry = {
                "user_id": user_id,
                "date": today,
                "breakfast_consume": True,
                "lunch_consume": False,
                "tea_consumed": False,
                "last_updated_by": staff_id
            }
            created = supabase.table("meals").insert(new_entry).execute()

            return {
                "message": "Breakfast marked",
                "meal": "breakfast",
                "data": new_entry
            }

        # If exists → check what’s pending
        meal = meal_res["data"]

        if not meal["breakfast_consume"]:
            update = {"breakfast_consume": True, "last_updated_by": staff_id}
            supabase.table("meals").update(update).eq("id", meal["id"]).execute()
            return {"message": "Breakfast marked !", "meal": "breakfast"}

        if not meal["lunch_consume"]:
            update = {"lunch_consume": True, "last_updated_by": staff_id}
            supabase.table("meals").update(update).eq("id", meal["id"]).execute()
            return {"message": "Lunch marked !", "meal": "lunch"}

        if not meal["tea_consumed"]:
            update = {"tea_consumed": True, "last_updated_by": staff_id}
            supabase.table("meals").update(update).eq("id", meal["id"]).execute()
            return {"message": "Hi-tea marked !", "meal": "hitea"}

        # All done
        return {"error": "All meals already consumed"}, 400

    except Exception as e:
        return {"error": str(e)}, 500
