"""
BioSentinel Configuration
Environment-based configuration for database, Redis, and API settings.
"""

import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database
    database_url: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://biosentinel_user:biosentinel_pass@localhost:5432/biosentinel"
    )
    
    # Redis
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # API Settings
    api_title: str = "BioSentinel API"
    api_version: str = "1.0.0"
    api_description: str = "Autonomous Epidemiological Surveillance & Context-Aware Triage System"
    
    # Celery
    celery_broker_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    celery_result_backend: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # ML Model Paths
    weather_model_path: str = "ml/weather_model.pkl"
    
    # Risk Score Weights
    weather_weight: float = 0.7
    news_weight: float = 0.3
    
    # Threat Level Thresholds
    high_threat_threshold: float = 0.7
    moderate_threat_threshold: float = 0.4

    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()


settings = get_settings()
