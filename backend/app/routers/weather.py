"""
Weather-Based Disease Risk Router
"""

from fastapi import APIRouter, HTTPException
from app.schemas import WeatherRiskRequest, WeatherRiskResponse
from app.services.weather_service import weather_predictor

router = APIRouter()


@router.post("/risk", response_model=WeatherRiskResponse)
async def predict_weather_risk(request: WeatherRiskRequest):
    """
    Predict vector-borne disease risk (Dengue, Malaria, Chikungunya)
    based on weather conditions and geographic region.
    """
    try:
        result = weather_predictor.predict(
            temperature=request.temperature,
            humidity=request.humidity,
            rainfall=request.rainfall,
            month=request.month,
            region_type=request.region_type,
        )
        return WeatherRiskResponse(**result)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/regions")
async def get_regions():
    """Get available region types for weather risk prediction."""
    return {
        "regions": [
            {"key": "tropical", "label": "Tropical", "description": "Hot and humid, heavy rainfall (e.g., Mumbai, Bangkok, Lagos)"},
            {"key": "subtropical", "label": "Subtropical", "description": "Warm with moderate humidity (e.g., Delhi, São Paulo, Sydney)"},
            {"key": "temperate", "label": "Temperate", "description": "Mild with distinct seasons (e.g., London, New York, Tokyo)"},
            {"key": "arid", "label": "Arid / Desert", "description": "Hot and dry with minimal rainfall (e.g., Jaipur, Dubai, Phoenix)"},
            {"key": "mediterranean", "label": "Mediterranean", "description": "Warm dry summers, mild wet winters (e.g., Barcelona, Cape Town)"},
        ]
    }
