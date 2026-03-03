"""Pydantic schemas for API requests and responses."""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional


# ─── Symptom Prediction ──────────────────────────────

class SymptomPredictionRequest(BaseModel):
    symptoms: List[str] = Field(..., min_length=1, description="List of symptom keys")

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"symptoms": ["high_fever", "severe_headache", "joint_pain", "rash"]}
            ]
        }
    }


class DiseasePrediction(BaseModel):
    disease: str
    confidence: float
    matching_symptoms: List[str]
    description: str = ""


class SymptomPredictionResponse(BaseModel):
    predictions: List[DiseasePrediction]
    model_used: str
    model_accuracy: float
    input_symptoms: List[str]


# ─── Health Risk Assessment ──────────────────────────

class DiabetesRiskRequest(BaseModel):
    pregnancies: int = Field(0, ge=0, le=20)
    glucose: float = Field(..., ge=50, le=250)
    blood_pressure: float = Field(..., ge=40, le=200)
    skin_thickness: float = Field(25, ge=0, le=100)
    insulin: float = Field(80, ge=0, le=800)
    bmi: float = Field(..., ge=10, le=60)
    diabetes_pedigree: float = Field(0.5, ge=0, le=3)
    age: int = Field(..., ge=1, le=120)


class HeartDiseaseRiskRequest(BaseModel):
    age: int = Field(..., ge=1, le=120)
    sex: int = Field(..., ge=0, le=1, description="0=Female, 1=Male")
    chest_pain_type: int = Field(..., ge=0, le=3)
    resting_bp: float = Field(..., ge=60, le=250)
    cholesterol: float = Field(..., ge=100, le=600)
    fasting_blood_sugar: int = Field(0, ge=0, le=1)
    resting_ecg: int = Field(0, ge=0, le=2)
    max_heart_rate: float = Field(..., ge=60, le=220)
    exercise_angina: int = Field(0, ge=0, le=1)
    oldpeak: float = Field(0, ge=0, le=10)
    slope: int = Field(1, ge=0, le=2)


class StrokeRiskRequest(BaseModel):
    age: int = Field(..., ge=1, le=120)
    sex: int = Field(..., ge=0, le=1)
    hypertension: int = Field(0, ge=0, le=1)
    heart_disease: int = Field(0, ge=0, le=1)
    avg_glucose_level: float = Field(..., ge=50, le=300)
    bmi: float = Field(..., ge=10, le=60)
    smoking_status: int = Field(0, ge=0, le=2, description="0=never, 1=former, 2=current")


class RiskAssessmentRequest(BaseModel):
    diabetes: Optional[DiabetesRiskRequest] = None
    heart_disease: Optional[HeartDiseaseRiskRequest] = None
    stroke: Optional[StrokeRiskRequest] = None


class RiskResult(BaseModel):
    disease: str
    risk_level: str  # "Low", "Moderate", "High"
    risk_score: float  # 0-1
    confidence: float
    risk_factors: List[str]
    recommendations: List[str]


class RiskAssessmentResponse(BaseModel):
    results: List[RiskResult]


# ─── Weather-Based Risk ──────────────────────────────

class WeatherRiskRequest(BaseModel):
    temperature: float = Field(..., ge=-10, le=50, description="Temperature in °C")
    humidity: float = Field(..., ge=0, le=100, description="Humidity in %")
    rainfall: float = Field(..., ge=0, le=500, description="Rainfall in mm")
    month: int = Field(..., ge=1, le=12)
    region_type: str = Field(
        ..., description="One of: tropical, subtropical, temperate, arid, mediterranean"
    )


class WeatherDiseaseRisk(BaseModel):
    disease: str
    risk_level: str  # "Low", "Moderate", "High", "Very High"
    risk_score: float
    contributing_factors: List[str]
    prevention_tips: List[str]


class WeatherRiskResponse(BaseModel):
    risks: List[WeatherDiseaseRisk]
    weather_summary: Dict[str, float]
    region: str
    season_alert: str


# ─── Metadata ────────────────────────────────────────

class MetadataResponse(BaseModel):
    symptoms: List[str]
    symptom_keys: List[str]
    diseases: List[str]
    total_symptoms: int
    total_diseases: int
    risk_models: List[str]
    region_types: List[str]
