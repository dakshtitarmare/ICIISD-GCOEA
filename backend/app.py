from flask import Flask, request
from flask_cors import CORS
from auth import auth
from qr import qr
from participant import participant
from meal import meal
from health import health
import os
from dotenv import load_dotenv
from admin import admin_bp

load_dotenv()

app = Flask(__name__)
# app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET", "dev-secret")

# CORS: allow dev frontend; using wildcard for simplicity in dev
CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

# Register blueprints
app.register_blueprint(auth)
app.register_blueprint(qr)
app.register_blueprint(participant)
app.register_blueprint(meal)
app.register_blueprint(admin_bp)
app.register_blueprint(health)


@app.get("/")
def index():
    return {"success": True, "message": "Flask backend running"}


if __name__ == "__main__":
    app.run()
