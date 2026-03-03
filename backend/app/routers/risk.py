"""
Health Risk Assessment Router
"""

from fastapi import APIRouter, HTTPException
from app.schemas import (
    DiabetesRiskRequest,
    HeartDiseaseRiskRequest,
    StrokeRiskRequest,
    RiskAssessmentResponse,
)
from app.services.risk_service import risk_assessor

router = APIRouter()


@router.post("/diabetes", response_model=RiskAssessmentResponse)
async def assess_diabetes_risk(request: DiabetesRiskRequest):
    """Assess diabetes risk based on health parameters."""
    try:
        result = risk_assessor.assess("diabetes", request.model_dump())
        return RiskAssessmentResponse(results=[result])
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/heart", response_model=RiskAssessmentResponse)
async def assess_heart_risk(request: HeartDiseaseRiskRequest):
    """Assess heart disease risk based on cardiac parameters."""
    try:
        result = risk_assessor.assess("heart_disease", request.model_dump())
        return RiskAssessmentResponse(results=[result])
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stroke", response_model=RiskAssessmentResponse)
async def assess_stroke_risk(request: StrokeRiskRequest):
    """Assess stroke risk based on health parameters."""
    try:
        result = risk_assessor.assess("stroke", request.model_dump())
        return RiskAssessmentResponse(results=[result])
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/all", response_model=RiskAssessmentResponse)
async def assess_all_risks(
    diabetes: DiabetesRiskRequest = None,
    heart: HeartDiseaseRiskRequest = None,
    stroke: StrokeRiskRequest = None,
):
    """Assess all available health risks at once."""
    results = []
    try:
        if diabetes:
            results.append(risk_assessor.assess("diabetes", diabetes.model_dump()))
        if heart:
            results.append(risk_assessor.assess("heart_disease", heart.model_dump()))
        if stroke:
            results.append(risk_assessor.assess("stroke", stroke.model_dump()))

        if not results:
            raise HTTPException(
                status_code=400,
                detail="Provide at least one health assessment (diabetes, heart, or stroke)",
            )

        return RiskAssessmentResponse(results=results)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
