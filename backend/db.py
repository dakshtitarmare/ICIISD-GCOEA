# db.py
import os
from psycopg2 import pool
import psycopg2.extras
from contextlib import contextmanager

DB_URL = os.getenv("DATABASE_URL")  # Supabase Postgres connection string

_conn_pool = None

def init_pool(minconn=1, maxconn=10):
    global _conn_pool
    if _conn_pool is None:
        _conn_pool = pool.ThreadedConnectionPool(minconn, maxconn, dsn=DB_URL)

@contextmanager
def get_conn():
    conn = _conn_pool.getconn()
    try:
        yield conn
    finally:
        _conn_pool.putconn(conn)

def execute_batch(query, argslist):
    """argslist is list of tuples; runs in a single transaction"""
    with get_conn() as conn:
        with conn.cursor() as cur:
            psycopg2.extras.execute_batch(cur, query, argslist)
        conn.commit()
