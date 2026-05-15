"""FastAPI inference server for disease-prediction-system.

Deploys to HuggingFace Spaces (Docker SDK). Models are loaded once on
startup from /app/models. Endpoints return calibrated probabilities and
human-readable explanations alongside the raw prediction."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parents[1]
MODELS_DIR = ROOT / "models"
META_PATH = ROOT / "data" / "symptom_meta.json"

app = FastAPI(
    title="Disease Prediction API",
    description="Ensemble ML inference for symptom-based diagnosis, risk scoring, and outbreak prediction.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Bundle:
    """Lazy-loaded joblib bundle."""

    def __init__(self, name: str) -> None:
        self.name = name
        self._bundle: dict[str, Any] | None = None

    def load(self) -> dict[str, Any]:
        if self._bundle is None:
            path = MODELS_DIR / f"{self.name}.joblib"
            if not path.exists():
                raise HTTPException(503, f"Model '{self.name}' not loaded")
            self._bundle = joblib.load(path)
        return self._bundle


SYMPTOM = Bundle("symptom")
DIABETES = Bundle("diabetes")
HEART = Bundle("heart")
STROKE = Bundle("stroke")
WEATHER = Bundle("weather")


def load_meta() -> dict[str, Any]:
    if META_PATH.exists():
        return json.loads(META_PATH.read_text())
    return {"symptoms": [], "diseases": [], "disease_symptoms": {}}


META = load_meta()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class SymptomRequest(BaseModel):
    symptoms: list[str] = Field(..., description="List of symptom keys present in the patient.")
    top_k: int = Field(5, ge=1, le=10)


class DiabetesRequest(BaseModel):
    pregnancies: int = Field(..., ge=0, le=20)
    glucose: float = Field(..., ge=40, le=400)
    blood_pressure: float = Field(..., ge=30, le=200)
    skin_thickness: float = Field(..., ge=0, le=100)
    insulin: float = Field(..., ge=0, le=900)
    bmi: float = Field(..., ge=10, le=70)
    diabetes_pedigree: float = Field(..., ge=0, le=3)
    age: int = Field(..., ge=1, le=120)


class HeartRequest(BaseModel):
    age: int = Field(..., ge=1, le=120)
    sex: int = Field(..., ge=0, le=1)
    cp: int = Field(..., ge=0, le=3)
    trestbps: float = Field(..., ge=60, le=240)
    chol: float = Field(..., ge=100, le=700)
    fbs: int = Field(..., ge=0, le=1)
    restecg: int = Field(..., ge=0, le=2)
    thalach: float = Field(..., ge=50, le=240)
    exang: int = Field(..., ge=0, le=1)
    oldpeak: float = Field(..., ge=0, le=10)
    slope: int = Field(..., ge=0, le=2)
    ca: int = Field(..., ge=0, le=4)
    thal: int = Field(..., ge=0, le=3)


class StrokeRequest(BaseModel):
    gender: int = Field(..., ge=0, le=1)
    age: int = Field(..., ge=1, le=120)
    hypertension: int = Field(..., ge=0, le=1)
    heart_disease: int = Field(..., ge=0, le=1)
    avg_glucose_level: float = Field(..., ge=40, le=400)
    bmi: float = Field(..., ge=10, le=70)
    smoking_status: int = Field(..., ge=0, le=2, description="0=never, 1=former, 2=current")


class WeatherRequest(BaseModel):
    temperature_c: float = Field(..., ge=-10, le=55)
    humidity_pct: float = Field(..., ge=0, le=100)
    rainfall_mm: float = Field(..., ge=0, le=1000)
    stagnant_water: int = Field(..., ge=0, le=1)
    population_density: float = Field(..., ge=1, le=50000)
    prior_cases_30d: int = Field(..., ge=0, le=1000)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _risk_band(p: float) -> str:
    if p < 0.20:
        return "Low"
    if p < 0.50:
        return "Moderate"
    if p < 0.75:
        return "High"
    return "Very High"


def _binary_predict(bundle: Bundle, payload: dict[str, Any]) -> dict[str, Any]:
    b = bundle.load()
    feat_order = b["feature_names"]
    X = pd.DataFrame([[payload[f] for f in feat_order]], columns=feat_order)
    proba = float(b["model"].predict_proba(X)[0, 1])
    return {
        "probability": round(proba, 4),
        "risk_band": _risk_band(proba),
        "prediction": int(proba >= 0.5),
        "model_metrics": b.get("metrics", {}),
    }


def _feature_contributions(bundle: Bundle, payload: dict[str, Any]) -> list[dict[str, Any]]:
    """Return top features by RF importance, paired with the patient's value."""
    b = bundle.load()
    pipeline = b["model"]
    # last step is voting clf; access RF importances
    clf = pipeline.named_steps["clf"] if hasattr(pipeline, "named_steps") else pipeline
    rf = dict(clf.named_estimators_).get("rf")
    if rf is None:
        return []
    importances = rf.feature_importances_
    items = sorted(
        zip(b["feature_names"], importances, strict=False),
        key=lambda x: x[1],
        reverse=True,
    )[:5]
    return [
        {"feature": name, "importance": round(float(imp), 4), "value": payload[name]}
        for name, imp in items
    ]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
def root() -> dict[str, Any]:
    return {
        "service": "disease-prediction-api",
        "status": "ok",
        "endpoints": [
            "/health", "/meta/symptoms",
            "/predict/symptom", "/predict/diabetes",
            "/predict/heart", "/predict/stroke", "/predict/weather",
        ],
    }


@app.get("/health")
def health() -> dict[str, Any]:
    available = {f.stem: f.exists() for f in MODELS_DIR.glob("*.joblib")}
    return {"status": "ok", "models": available}


@app.get("/meta/symptoms")
def meta_symptoms() -> dict[str, Any]:
    return {
        "symptoms": META.get("symptoms", []),
        "diseases": META.get("diseases", []),
    }


@app.post("/predict/symptom")
def predict_symptom(req: SymptomRequest) -> dict[str, Any]:
    bundle = SYMPTOM.load()
    feat_names: list[str] = bundle["feature_names"]
    classes: list[str] = bundle["classes"]
    valid = set(feat_names)

    unknown = [s for s in req.symptoms if s not in valid]
    known = [s for s in req.symptoms if s in valid]
    if not known:
        raise HTTPException(400, f"No valid symptoms provided. Unknown: {unknown}")

    x = np.zeros(len(feat_names), dtype=np.int8)
    for s in known:
        x[feat_names.index(s)] = 1
    X = pd.DataFrame([x], columns=feat_names)

    proba = bundle["model"].predict_proba(X)[0]
    order = np.argsort(proba)[::-1][: req.top_k]
    predictions = [
        {
            "disease": classes[i],
            "probability": round(float(proba[i]), 4),
            "matching_symptoms": [s for s in known if s in META["disease_symptoms"].get(classes[i], [])],
        }
        for i in order
    ]
    return {
        "predictions": predictions,
        "input_symptoms": known,
        "unknown_symptoms": unknown,
        "model_metrics": bundle.get("metrics", {}),
    }


@app.post("/predict/diabetes")
def predict_diabetes(req: DiabetesRequest) -> dict[str, Any]:
    payload = req.model_dump()
    out = _binary_predict(DIABETES, payload)
    out["top_features"] = _feature_contributions(DIABETES, payload)
    return out


@app.post("/predict/heart")
def predict_heart(req: HeartRequest) -> dict[str, Any]:
    payload = req.model_dump()
    out = _binary_predict(HEART, payload)
    out["top_features"] = _feature_contributions(HEART, payload)
    return out


@app.post("/predict/stroke")
def predict_stroke(req: StrokeRequest) -> dict[str, Any]:
    payload = req.model_dump()
    out = _binary_predict(STROKE, payload)
    out["top_features"] = _feature_contributions(STROKE, payload)
    return out


@app.post("/predict/weather")
def predict_weather(req: WeatherRequest) -> dict[str, Any]:
    bundle = WEATHER.load()
    feat_order = bundle["feature_names"]
    payload = req.model_dump()
    X = pd.DataFrame([[payload[f] for f in feat_order]], columns=feat_order)
    proba = bundle["model"].predict_proba(X)[0]
    classes = bundle["classes"]
    pred_idx = int(np.argmax(proba))
    return {
        "risk_level": classes[pred_idx],
        "risk_index": pred_idx,
        "probabilities": {classes[i]: round(float(proba[i]), 4) for i in range(len(classes))},
        "diseases_at_risk": ["Malaria", "Dengue", "Chikungunya"],
        "advice": _weather_advice(classes[pred_idx], payload),
        "model_metrics": bundle.get("metrics", {}),
    }


def _weather_advice(risk: str, p: dict[str, Any]) -> list[str]:
    tips = []
    if risk in ("Moderate", "High"):
        tips.append("Use mosquito repellent and wear long sleeves at dawn and dusk.")
        tips.append("Install or repair window screens; sleep under treated nets if available.")
    if p.get("stagnant_water"):
        tips.append("Drain stagnant water around your home, the most common breeding site.")
    if p.get("rainfall_mm", 0) > 100:
        tips.append("Heavy recent rainfall increases breeding; inspect gutters and containers.")
    if risk == "High":
        tips.append("Watch for fever, joint pain, or rash. Seek testing within 24 hours if any appear.")
    if not tips:
        tips.append("Conditions are unfavorable for outbreaks. Maintain routine precautions.")
    return tips
