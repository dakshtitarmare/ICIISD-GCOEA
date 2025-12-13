import jwt
from flask import request, g
from functools import wraps
from config import Config

def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return {"error": "Missing Authorization header"}, 401
        
        try:
            token = auth_header.split(" ")[1]
            decoded = jwt.decode(
                token,
                Config.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )

            g.user_id = decoded.get("sub")
            if g.user_id is None:
                return {"error": "Invalid token - no sub field"}, 401

        except Exception as e:
            return {"error": "Token invalid", "details": str(e)}, 401

        return f(*args, **kwargs)
    
    return wrapper
