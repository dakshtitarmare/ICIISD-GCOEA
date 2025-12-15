from flask import Blueprint, request
from db import get_connection
from utils import response
import os

auth = Blueprint("auth", __name__, url_prefix="/api")

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

    # NOTE: DB stores plain password — comparing directly
    if password != user.get("password"):
        return response(False, "Invalid password", None, 401)

    # Return user info only, no JWT token
    return response(True, "Login successful", {
        "role": user.get("role"),
        "email": user.get("email"),
        "id": user.get("id")
    })
