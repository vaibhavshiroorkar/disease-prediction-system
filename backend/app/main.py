"""
Disease Prediction System — FastAPI Backend
Main application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import prediction, risk, weather
from app.config import settings

app = FastAPI(
    title="Disease Prediction System API",
    description="AI-powered disease prediction with symptom analysis, health risk assessment, and weather-based alerts",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "Disease Prediction System API",
        "version": "1.0.0",
        "endpoints": {
            "symptom_prediction": "/api/predict/symptoms",
            "health_risk": "/api/risk/assess",
            "weather_risk": "/api/weather/risk",
            "metadata": "/api/metadata",
        },
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Register routers
app.include_router(prediction.router, prefix="/api/predict", tags=["Symptom Prediction"])
app.include_router(risk.router, prefix="/api/risk", tags=["Health Risk Assessment"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather Disease Risk"])
