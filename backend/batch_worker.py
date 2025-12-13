# batch_worker.py
import os
import time
import json
from db import init_pool, execute_batch, get_conn
import redis
from datetime import datetime
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
BATCH_QUEUE_KEY = "attendance:queue"
BATCH_SIZE = int(os.getenv("BATCH_SIZE", "200"))   # flush when this many queued entries
BATCH_INTERVAL = float(os.getenv("BATCH_INTERVAL", "0.5")) # seconds
r = redis.from_url(REDIS_URL, decode_responses=True)

init_pool(minconn=1, maxconn=int(os.getenv("DB_POOL_MAX", "10")))

def drain_batch(max_items):
    items = []
    # use pipeline + LPOP in loop (atomic via redis)
    for _ in range(max_items):
        raw = r.lpop(BATCH_QUEUE_KEY)
        if not raw:
            break
        items.append(json.loads(raw))
    return items

def flush_to_db(items):
    if not items:
        return 0
    # group by user/day to produce upserts
    args = []
    for it in items:
        user_id = it["user_id"]
        day = it["day"]
        ts = it.get("checkin_ts") or datetime.utcnow().isoformat()
        meta = it.get("meta", {})
        args.append((user_id, day, ts, json.dumps(meta), ts, json.dumps(meta)))
    # We'll perform bulk upsert using INSERT ... ON CONFLICT
    # Query with placeholders for execute_batch
    sql = """
    INSERT INTO attendance (user_id, day, checkin_ts, meta)
      VALUES (%s, %s, %s, %s)
    ON CONFLICT (user_id, day) DO UPDATE
      SET checkin_ts = EXCLUDED.checkin_ts, meta = EXCLUDED.meta
    """
    execute_batch(sql, args)
    # after DB commit we must invalidate attendance cache per user/day
    pipe = r.pipeline()
    for it in items:
        key = f"attendance:{it['user_id']}:{it['day']}"
        pipe.delete(key)
    pipe.execute()
    return len(items)

def main_loop():
    while True:
        qlen = r.llen(BATCH_QUEUE_KEY)
        if qlen == 0:
            time.sleep(BATCH_INTERVAL)
            continue
        # if queue is large, drain up to BATCH_SIZE
        max_take = min(qlen, BATCH_SIZE)
        items = drain_batch(max_take)
        count = flush_to_db(items)
        print(f"flushed {count} attendance rows")
        # small sleep to avoid tight loop
        time.sleep(0.01)

if __name__ == "__main__":
    print("starting batch worker")
    main_loop()
