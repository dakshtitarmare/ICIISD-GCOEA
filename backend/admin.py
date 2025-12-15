# admin.py
from flask import Blueprint, request
from db import get_connection
from utils import response
import psycopg2

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def safe_count(cur, sql, params=()):
    """Run a count query and return integer or 0 on error."""
    try:
        cur.execute(sql, params)
        r = cur.fetchone()
        if r:
            # fetchone returns a tuple or dict depending on cursor_factory
            # handle both
            if isinstance(r, dict):
                return int(next(iter(r.values())))
            return int(r[0])
    except Exception:
        return 0
    return 0


@admin_bp.get("/dashboard")
def dashboard():
    """
    Returns aggregated metrics for admin dashboard:
    - total_participants
    - total_qr_assigned
    - total_meal_updates (derived)
    - meals: counts for breakfast/lunch/hi_tea (sum of boolean columns or scan_logs fallback)
    - qr_unused
    - latest_scan_logs (if scan_logs table exists)
    """
    conn = get_connection()
    cur = conn.cursor()

    try:
        # 1) total participants
        total_participants = safe_count(cur, "SELECT COUNT(*) FROM participants")

        # 2) total QR assigned
        total_qr_assigned = safe_count(cur, "SELECT COUNT(*) FROM qr_pool WHERE is_assigned = TRUE")

        # 3) qr unused
        total_qr_unused = safe_count(cur, "SELECT COUNT(*) FROM qr_pool WHERE is_assigned = FALSE")

        # 4) meal counts: try scan_logs first (if exists) else sum meal table boolean flags
        meals = {"breakfast": 0, "lunch": 0, "hi_tea": 0, "total_meal_updates": 0}
        try:
            # Prefer authoritative scan_logs table if it exists
            cur.execute("SELECT 1 FROM information_schema.tables WHERE table_name='scan_logs'")
            if cur.fetchone():
                # count by meal_type
                cur.execute("SELECT meal_type, COUNT(*) as cnt FROM scan_logs GROUP BY meal_type")
                rows = cur.fetchall()
                for r in rows:
                    # r may be dict or tuple
                    meal_type = r["meal_type"] if isinstance(r, dict) else r[0]
                    cnt = int(r["cnt"] if isinstance(r, dict) else r[1])
                    if meal_type == "breakfast":
                        meals["breakfast"] = cnt
                    elif meal_type == "lunch":
                        meals["lunch"] = cnt
                    elif meal_type in ("hi_tea", "hitea", "hi-tea"):
                        meals["hi_tea"] = cnt
                meals["total_meal_updates"] = meals["breakfast"] + meals["lunch"] + meals["hi_tea"]
            else:
                # fallback to meal table boolean columns (sum true values)
                cur.execute("""
                    SELECT
                      COALESCE(SUM(CASE WHEN day1_breakfast THEN 1 ELSE 0 END),0)
                        + COALESCE(SUM(CASE WHEN day2_breakfast THEN 1 ELSE 0 END),0) as breakfast,
                      COALESCE(SUM(CASE WHEN day1_lunch THEN 1 ELSE 0 END),0)
                        + COALESCE(SUM(CASE WHEN day2_lunch THEN 1 ELSE 0 END),0) as lunch,
                      COALESCE(SUM(CASE WHEN day1_hitea THEN 1 ELSE 0 END),0)
                        + COALESCE(SUM(CASE WHEN day2_hitea THEN 1 ELSE 0 END),0) as hi_tea
                    FROM meal
                """)
                r = cur.fetchone()
                if r:
                    # dict or tuple
                    if isinstance(r, dict):
                        meals["breakfast"] = int(r.get("breakfast", 0))
                        meals["lunch"] = int(r.get("lunch", 0))
                        meals["hi_tea"] = int(r.get("hi_tea", 0))
                    else:
                        meals["breakfast"], meals["lunch"], meals["hi_tea"] = int(r[0]), int(r[1]), int(r[2])
                    meals["total_meal_updates"] = meals["breakfast"] + meals["lunch"] + meals["hi_tea"]
        except psycopg2.errors.UndefinedTable:
            # table meal doesn't exist -> leave zeros
            conn.rollback()
        except Exception:
            # defensive
            conn.rollback()

        # 5) Duplicate attempts or prevented attempts (if scan_logs has a flag), fallback to 0
        duplicate_attempts = 0
        try:
            cur.execute("SELECT 1 FROM information_schema.tables WHERE table_name='scan_logs'")
            if cur.fetchone():
                cur.execute("SELECT COUNT(*) FROM scan_logs WHERE duplicate = TRUE")
                r = cur.fetchone()
                duplicate_attempts = int(r[0]) if r else 0
        except Exception:
            conn.rollback()

        # 6) Latest scan logs (limit 10). If scan_logs doesn't exist, return empty list
        latest_logs = []
        try:
            cur.execute("SELECT 1 FROM information_schema.tables WHERE table_name='scan_logs'")
            if cur.fetchone():
                cur.execute("""
                    SELECT id, email, qr_hash, meal_type, duplicate, scanned_by_member_id, created_at
                    FROM scan_logs
                    ORDER BY created_at DESC
                    LIMIT 10
                """)
                rows = cur.fetchall()
                for r in rows:
                    if isinstance(r, dict):
                        latest_logs.append(r)
                    else:
                        # tuple -> map to keys
                        latest_logs.append({
                            "id": r[0],
                            "email": r[1],
                            "qr_hash": r[2],
                            "meal_type": r[3],
                            "duplicate": r[4],
                            "scanned_by_member_id": r[5],
                            "created_at": r[6].isoformat() if hasattr(r[6], "isoformat") else r[6],
                        })
        except Exception:
            conn.rollback()

        # Build response
        payload = {
            "total_participants": total_participants,
            "total_qr_assigned": total_qr_assigned,
            "total_qr_unused": total_qr_unused,
            "meals": meals,
            "duplicate_attempts": duplicate_attempts,
            "latest_scan_logs": latest_logs
        }

        conn.close()
        return response(True, "Admin dashboard metrics", payload)
    except Exception as e:
        conn.close()
        return response(False, f"DB error: {str(e)}", None, 500)
