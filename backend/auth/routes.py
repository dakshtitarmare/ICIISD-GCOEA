from flask import Blueprint, request
from utils.supabase_client import supabase
from utils.qr_generator import generate_qr_image
from config import Config

auth_bp = Blueprint("auth", __name__)

# REGISTER
@auth_bp.post("/register")
def register():
    data = request.get_json()
    name = data.get("name")
    phone = data.get("phone")
    email = data.get("email")
    password = data.get("password")

    if not all([name, phone, email, password]):
        return {"error": "Missing fields"}, 400

    # 1. Create user in Supabase Auth
    try:
        auth_res = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
    except Exception as e:
        return {"error": f"Auth signup failed: {str(e)}"}, 400

    user = auth_res.user
    if user is None:
        return {"error": "Auth signup returned no user"}, 400
    user_id = user.id


    # 2. Generate QR + Upload
    try:
        qr_id, img_buf = generate_qr_image(user_id)
        file_path = f"{qr_id}.png"

        upload_res = supabase.storage.from_(Config.BUCKET).upload(
            file_path,
            img_buf.getvalue()
        )
    except Exception as e:
        # rollback auth user if QR upload failed
        supabase.auth.admin.delete_user(user_id)
        return {"error(qr_generator)": f"QR upload failed: {str(e)}"}, 500

    # 3. Insert into custom users table
    try:
        profile_insert = supabase.table("users").insert({
            "id": user_id,
            "name": name,
            "email": email,
            "phone": phone,
            "role":1,
            "password": password,
            "qr_code": file_path
        }).execute()
        if not profile_insert:
            supabase.auth.admin.delete_user(user_id)
            supabase.storage.from_(Config.BUCKET).remove([file_path])

            return {"error(profile_insert)": profile_insert.error.message}, 500

    except Exception as e:
        return {"error(profile)": str(e)}, 500

    # 4. Return success
    return {
        "message": "User registered successfully",
        "user_id": user_id,
        "access_token": auth_res.session.access_token if auth_res.session else None,
        "expires_at": auth_res.session.expires_at if auth_res.session else None,
        "qr_code": f"https://mtbmbygzcezmhpizhfjz.supabase.co/storage/v1/object/public/{upload_res.full_path}"
    }, 200



# LOGIN
@auth_bp.post("/login")
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    res = supabase.auth.sign_in_with_password({"email": email, "password": password})

    if res.get("error"):
        return {"error": res.error.message}, 400

    return {
        "access_token": res.session.access_token,
        "refresh_token": res.session.refresh_token,
        "user": res.user
    }


# Protected user info route
from auth.middleware import require_auth

@auth_bp.get("/me")
@require_auth
def me():
    return {"user_id": g.user_id}
