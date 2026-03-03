"""
Symptom-Based Disease Prediction Router
"""

from fastapi import APIRouter, BackgroundTasks, HTTPException
from app.schemas import (
    SymptomPredictionRequest,
    SymptomPredictionResponse,
    MetadataResponse,
)
from app.services.ml_service import symptom_predictor
from app.services.supabase_service import log_symptom_prediction

router = APIRouter()


@router.post("/symptoms", response_model=SymptomPredictionResponse)
async def predict_from_symptoms(
    request: SymptomPredictionRequest,
    background_tasks: BackgroundTasks,
):
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

        response = SymptomPredictionResponse(
            predictions=predictions,
            model_used="Random Forest + Gradient Boosting Ensemble",
            model_accuracy=symptom_predictor.rf_accuracy,
            input_symptoms=request.symptoms,
        )

        # Log to Supabase in the background (non-blocking)
        background_tasks.add_task(
            log_symptom_prediction,
            request.symptoms,
            [p.model_dump() if hasattr(p, "model_dump") else dict(p) for p in predictions],
            symptom_predictor.rf_accuracy,
        )

        return response
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

