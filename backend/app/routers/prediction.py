"""
Symptom-Based Disease Prediction Router
"""

from fastapi import APIRouter, HTTPException
from app.schemas import (
    SymptomPredictionRequest,
    SymptomPredictionResponse,
    MetadataResponse,
)
from app.services.ml_service import symptom_predictor

router = APIRouter()


@router.post("/symptoms", response_model=SymptomPredictionResponse)
async def predict_from_symptoms(request: SymptomPredictionRequest):
    """
    Predict diseases based on provided symptoms.
    Returns top-5 most likely diseases with confidence scores.
    """
    try:
        predictions = symptom_predictor.predict(request.symptoms, top_k=5)

        if not predictions:
            raise HTTPException(
                status_code=400,
                detail="No valid symptoms provided. Please check symptom names.",
            )

        return SymptomPredictionResponse(
            predictions=predictions,
            model_used="Random Forest + Gradient Boosting Ensemble",
            model_accuracy=symptom_predictor.rf_accuracy,
            input_symptoms=request.symptoms,
        )
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/metadata", response_model=MetadataResponse)
async def get_metadata():
    """Get available symptoms, diseases, and model info."""
    try:
        meta = symptom_predictor.get_metadata()
        return MetadataResponse(
            **meta,
            risk_models=["diabetes", "heart_disease", "stroke"],
            region_types=["tropical", "subtropical", "temperate", "arid", "mediterranean"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
