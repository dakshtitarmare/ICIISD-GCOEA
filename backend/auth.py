from flask import Blueprint, request
from db import get_connection
from utils import response
# from flask_jwt_extended import create_access_token
from datetime import timedelta

auth = Blueprint("auth", __name__, url_prefix="/api")

# JWT secret (set in your config normally)

@auth.post("/login")
def login():
    body = request.get_json()
    if not body:
        return response(False, "Invalid JSON body", None, 400)

    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        return response(False, "email and password required", None, 400)

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM members WHERE email=%s", (email,))
    user = cur.fetchone()
    conn.close()

    if not user:
        return response(False, "Invalid email", None, 401)

    if password != user.get("password"):
        return response(False, "Invalid password", None, 401)

    # # ✅ Create JWT token (expires in 1 day)
    # access_token = create_access_token(
    #     identity=user.get("id"),
    #     expires_delta=timedelta(days=1)
    # )

    # Return user info + token
    return response(True, "Login successful", {
        "role": user.get("role"),
        "email": user.get("email"),
        "id": user.get("id")
    })
