"""Application configuration."""

import os
from typing import List


class Settings:
    PROJECT_NAME: str = "Disease Prediction System"
    VERSION: str = "1.0.0"

    # CORS — defaults + any extra origins from CORS_ORIGINS env var (comma-separated)
    # Add your Vercel URL to CORS_ORIGINS on Render, e.g.:
    #   CORS_ORIGINS=https://your-app.vercel.app
    CORS_ORIGINS: List[str] = (
        [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
        ]
        + [
            o.strip()
            for o in os.getenv("CORS_ORIGINS", "").split(",")
            if o.strip()
        ]
    )

    # Model paths
    ML_MODELS_DIR: str = os.getenv(
        "ML_MODELS_DIR",
        os.path.join(os.path.dirname(__file__), "..", "..", "ml", "models"),
    )

    SYMPTOM_MODEL_PATH: str = os.path.join(ML_MODELS_DIR, "symptom_model.pkl")
    RISK_MODEL_PATH: str = os.path.join(ML_MODELS_DIR, "risk_models.pkl")
    WEATHER_MODEL_PATH: str = os.path.join(ML_MODELS_DIR, "weather_model.pkl")

    # API keys (optional, for weather data)
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")

    # Supabase (optional — enables prediction logging)
    # Get these from your Supabase project → Settings → API
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")


settings = Settings()
