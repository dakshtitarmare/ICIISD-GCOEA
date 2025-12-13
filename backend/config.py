import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    BUCKET = "qr_codes"
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))

    # JWT verification: Supabase JWT secret (for decoding)
    SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")  
