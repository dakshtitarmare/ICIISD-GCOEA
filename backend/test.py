import os
from dotenv import load_dotenv

load_dotenv()
print("DATABASE_URL exists:", bool(os.getenv("SUPABASE_DB_URL")))
