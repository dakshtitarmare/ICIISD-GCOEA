from flask import Flask
from auth.routes import auth_bp
from qr_lookups.routes import qr_bp
from meal.routes import food_bp
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(qr_bp, url_prefix="/qr")
    app.register_blueprint(food_bp, url_prefix="/food")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(port=5000, debug=True)



# # app.py
# import os
# import time
# import json
# import requests
# from functools import wraps
# from datetime import datetime, timedelta, date
# from flask import Flask, request, jsonify, g
# import jwt  # PyJWT
# from jwt import PyJWKClient
# import redis
# from flask_limiter import Limiter
# from flask_limiter.util import get_remote_address
# from db import init_pool, get_conn, execute_batch

# # config (env)
# SUPABASE_URL = os.getenv("SUPABASE_URL") 
# SUPABASE_JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
# REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
# DATABASE_URL = os.getenv("DATABASE_URL")
# BATCH_QUEUE_KEY = "attendance:queue"

# # init
# app = Flask(__name__)
# init_pool(minconn=1, maxconn=int(os.getenv("DB_POOL_MAX", "10")))
# r = redis.from_url(REDIS_URL, decode_responses=True)

# # rate limiter using redis storage
# limiter = Limiter(
#     key_func=lambda: getattr(g, "user_id", get_remote_address()),
#     storage_uri=REDIS_URL,
#     default_limits=[]
# )
# limiter.init_app(app)

# # JWK loader with simple caching in Redis
# JWKS_CACHE_KEY = "supabase:jwks"
# JWKS_CACHE_TTL = 60 * 60  # 1 hour

# def get_jwk_client():
#     # store the jwks in redis to avoid repeated network calls
#     jwks = r.get(JWKS_CACHE_KEY)
#     if jwks:
#         jwks_json = json.loads(jwks)
#         # PyJWKClient expects a URL, but we can make a local one by writing to memory;
#         # simpler: use the URL directly if no redis cached value (we already cached though).
#         # We'll just use the remote URL and let PyJWKClient cache internally.
#         pass
#     return PyJWKClient(SUPABASE_JWKS_URL)

# # auth decorator: verify token, extract sub as user_id
# def require_auth(f):
#     @wraps(f)
#     def wrapped(*args, **kwargs):
#         auth = request.headers.get("Authorization") or request.headers.get("X-Client-Token")
#         if not auth:
#             return jsonify({"error": "missing token"}), 401
#         # allow "Bearer <token>"
#         if auth.lower().startswith("bearer "):
#             token = auth.split(" ", 1)[1].strip()
#         else:
#             token = auth.strip()

#         # optional cached validation: store token -> user_id mapping short TTL
#         cache_key = f"tokenmap:{token[:40]}"
#         cached = r.get(cache_key)
#         if cached:
#             g.user_id = cached
#             return f(*args, **kwargs)

#         try:
#             jwk_client = get_jwk_client()
#             signing_key = jwk_client.get_signing_key_from_jwt(token)
#             claims = jwt.decode(token, signing_key.key, algorithms=["RS256"], audience=None, options={"verify_aud": False})
#             # supabase puts user id in sub
#             user_id = claims.get("sub")
#             exp = claims.get("exp")
#             if not user_id:
#                 return jsonify({"error": "token missing sub"}), 401
#             if exp and time.time() > exp:
#                 return jsonify({"error": "token expired"}), 401
#             g.user_id = user_id
#             # cache mapping short time
#             r.setex(cache_key, 30, user_id)
#         except Exception as e:
#             return jsonify({"error": "invalid token", "detail": str(e)}), 401

#         return f(*args, **kwargs)
#     return wrapped

# ########## Helpers: caching patterns ##########

# def attendance_cache_key(user_id, day: date):
#     return f"attendance:{user_id}:{day.isoformat()}"

# def tasks_cache_key(user_id):
#     return f"tasks:{user_id}"

# ########## Endpoints ##########

# @app.route("/checkin", methods=["POST"])
# @require_auth
# @limiter.limit("120/minute")  # per-user limit (adjust)
# def checkin():
#     """High-QPS insert for attendance. We push to a Redis queue and return quickly.
#        Write-around approach: queue -> batch writer writes to DB -> invalidate cache after DB write.
#     """
#     payload = request.get_json() or {}
#     meta = payload.get("meta", {})
#     user_id = g.user_id
#     day = date.today().isoformat()
#     item = {"user_id": user_id, "day": day, "checkin_ts": datetime.utcnow().isoformat(), "meta": meta}
#     # push JSON to a Redis list (right push)
#     r.rpush(BATCH_QUEUE_KEY, json.dumps(item))
#     # optimistic response
#     return jsonify({"status": "queued"}), 202

# @app.route("/tasks/<task_name>", methods=["PUT"])
# @require_auth
# @limiter.limit("60/minute")
# def update_task(task_name):
#     """Write-Through approach for tasks: update DB immediately and then update Redis cache"""
#     user_id = g.user_id
#     payload = request.get_json() or {}
#     status = payload.get("status")
#     data = payload.get("data", {})
#     if status is None:
#         return jsonify({"error": "missing status"}), 400

#     # Upsert into Postgres
#     upsert_q = """
#     INSERT INTO user_tasks (user_id, task_name, status, data, last_updated)
#       VALUES (%s, %s, %s, %s, NOW())
#     ON CONFLICT (user_id, task_name) DO UPDATE
#       SET status = EXCLUDED.status, data = EXCLUDED.data, last_updated = NOW()
#     RETURNING id, status, last_updated;
#     """
#     with get_conn() as conn:
#         with conn.cursor() as cur:
#             cur.execute(upsert_q, (user_id, task_name, status, json.dumps(data)))
#             row = cur.fetchone()
#         conn.commit()

#     # update Redis write-through
#     key = tasks_cache_key(user_id)
#     # store a single JSON per user with tasks map (hash)
#     r.hset(key, task_name, json.dumps({"status": status, "data": data, "last_updated": row[2].isoformat() if row[2] else None}))
#     r.expire(key, 60 * 60 * 6)  # 6 hours TTL

#     return jsonify({"task": task_name, "status": status}), 200

# @app.route("/tasks", methods=["GET"])
# @require_auth
# def get_tasks():
#     user_id = g.user_id
#     key = tasks_cache_key(user_id)
#     # read-through: check Redis first
#     if r.exists(key):
#         tasks = {k: json.loads(v) for k, v in r.hgetall(key).items()}
#         return jsonify({"tasks": tasks, "source": "redis"}), 200

#     # else load from DB and populate cache
#     q = "SELECT task_name, status, data, last_updated FROM user_tasks WHERE user_id = %s"
#     with get_conn() as conn:
#         with conn.cursor() as cur:
#             cur.execute(q, (user_id,))
#             rows = cur.fetchall()
#     if rows:
#         mapping = {}
#         for task_name, status, data, last_updated in rows:
#             mapping[task_name] = {"status": status, "data": data or {}, "last_updated": last_updated.isoformat() if last_updated else None}
#             # write into redis hash
#             r.hset(key, task_name, json.dumps(mapping[task_name]))
#         r.expire(key, 60 * 60 * 6)
#     else:
#         mapping = {}
#     return jsonify({"tasks": mapping, "source": "db"}), 200

# @app.route("/attendance/<user_id>/<iso_day>", methods=["GET"])
# @require_auth
# def get_attendance(user_id, iso_day):
#     """Read attendance; validate caller can only read own attendance or admin (not implemented)"""
#     if user_id != g.user_id:
#         return jsonify({"error": "forbidden"}), 403
#     key = attendance_cache_key(user_id, date.fromisoformat(iso_day))
#     cached = r.get(key)
#     if cached:
#         return jsonify({"attendance": json.loads(cached), "source": "redis"}), 200

#     q = "SELECT user_id, day, checkin_ts, meta FROM attendance WHERE user_id = %s AND day = %s LIMIT 1"
#     with get_conn() as conn:
#         with conn.cursor() as cur:
#             cur.execute(q, (user_id, iso_day))
#             row = cur.fetchone()
#     if row:
#         rec = {"user_id": row[0], "day": row[1].isoformat(), "checkin_ts": row[2].isoformat(), "meta": row[3]}
#         r.setex(key, 60 * 60 * 2, json.dumps(rec))
#         return jsonify({"attendance": rec, "source": "db"}), 200
#     else:
#         return jsonify({"attendance": None}), 200

# # admin endpoint to flush queue length (for monitoring)
# @app.route("/health/queue-length", methods=["GET"])
# @require_auth
# def queue_len():
#     ln = r.llen(BATCH_QUEUE_KEY)
#     return jsonify({"queue_length": ln}), 200

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")))
