"""
Risk Assessment Service — Health risk prediction for chronic diseases.
"""

import pickle
import numpy as np
from typing import Dict, List, Optional
from app.config import settings


RISK_RECOMMENDATIONS = {
    "diabetes": {
        "high": [
            "Consult an endocrinologist immediately",
            "Monitor blood glucose levels daily",
            "Adopt a low-glycemic diet",
            "Exercise at least 150 minutes per week",
            "Reduce refined sugar and processed food intake",
        ],
        "moderate": [
            "Schedule a fasting glucose test",
            "Maintain a balanced diet with whole grains",
            "Stay physically active — aim for 30 min/day",
            "Monitor weight and BMI regularly",
        ],
        "low": [
            "Continue healthy eating habits",
            "Get annual blood sugar screenings",
            "Maintain regular physical activity",
        ],
    },
    "heart_disease": {
        "high": [
            "See a cardiologist for comprehensive evaluation",
            "Get an ECG and stress test",
            "Monitor blood pressure and cholesterol daily",
            "Follow a heart-healthy (DASH) diet",
            "Avoid smoking and limit alcohol",
        ],
        "moderate": [
            "Check cholesterol and blood pressure regularly",
            "Reduce saturated fat and sodium intake",
            "Incorporate cardiovascular exercise",
            "Manage stress through meditation or yoga",
        ],
        "low": [
            "Maintain a balanced diet",
            "Stay active with regular exercise",
            "Get annual cardiac screenings",
        ],
    },
    "stroke": {
        "high": [
            "Seek immediate neurological consultation",
            "Monitor blood pressure multiple times daily",
            "Take prescribed anticoagulants if advised",
            "Control blood sugar and cholesterol",
            "Learn to recognize FAST stroke signs",
        ],
        "moderate": [
            "Manage hypertension through medication and diet",
            "Quit smoking if applicable",
            "Reduce alcohol consumption",
            "Stay physically active",
        ],
        "low": [
            "Maintain healthy blood pressure",
            "Exercise regularly",
            "Eat a balanced, low-sodium diet",
        ],
    },
}


class RiskAssessor:
    """Health risk assessment service."""

    def __init__(self):
        self.models = None
        self.loaded = False

    def load(self):
        try:
            with open(settings.RISK_MODEL_PATH, "rb") as f:
                self.models = pickle.load(f)
            self.loaded = True
            print("[OK] Risk assessment models loaded")
        except Exception as e:
            print(f"[ERR] Failed to load risk models: {e}")
            self.loaded = False

    def _identify_risk_factors(self, disease: str, data: Dict) -> List[str]:
        """Identify which input values are concerning."""
        factors = []

        if disease == "diabetes":
            if data.get("glucose", 0) > 140:
                factors.append("Elevated glucose level")
            if data.get("bmi", 0) > 30:
                factors.append("High BMI (obese range)")
            if data.get("age", 0) > 45:
                factors.append("Age over 45")
            if data.get("blood_pressure", 0) > 90:
                factors.append("Elevated blood pressure")
            if data.get("insulin", 0) > 150:
                factors.append("High insulin level")
            if data.get("diabetes_pedigree", 0) > 0.8:
                factors.append("Family history of diabetes")

        elif disease == "heart_disease":
            if data.get("age", 0) > 55:
                factors.append("Age over 55")
            if data.get("cholesterol", 0) > 240:
                factors.append("High cholesterol")
            if data.get("resting_bp", 0) > 140:
                factors.append("High resting blood pressure")
            if data.get("max_heart_rate", 999) < 120:
                factors.append("Low maximum heart rate")
            if data.get("exercise_angina", 0) == 1:
                factors.append("Exercise-induced chest pain")
            if data.get("oldpeak", 0) > 2:
                factors.append("Significant ST depression")

        elif disease == "stroke":
            if data.get("age", 0) > 60:
                factors.append("Age over 60")
            if data.get("hypertension", 0) == 1:
                factors.append("History of hypertension")
            if data.get("heart_disease", 0) == 1:
                factors.append("History of heart disease")
            if data.get("avg_glucose_level", 0) > 180:
                factors.append("High glucose level")
            if data.get("bmi", 0) > 35:
                factors.append("Very high BMI")
            if data.get("smoking_status", 0) == 2:
                factors.append("Current smoker")

        return factors if factors else ["No significant risk factors identified"]

    def assess(self, disease: str, data: Dict) -> Dict:
        """Assess risk for a single disease."""
        if not self.loaded:
            self.load()
        if not self.loaded:
            raise RuntimeError("Risk models not loaded. Run training first.")

        model_data = self.models[disease]
        scaler = model_data["scaler"]
        rf = model_data["rf_model"]
        feature_names = model_data["feature_names"]

        # Build feature vector
        features = np.array([[data.get(f, 0) for f in feature_names]])
        features_scaled = scaler.transform(features)

        # Get prediction probability
        proba = rf.predict_proba(features_scaled)[0]
        risk_score = float(proba[1]) if len(proba) > 1 else 0.0

        # Determine risk level
        if risk_score >= 0.7:
            risk_level = "High"
        elif risk_score >= 0.4:
            risk_level = "Moderate"
        else:
            risk_level = "Low"

        # Get risk factors and recommendations
        risk_factors = self._identify_risk_factors(disease, data)
        recommendations = RISK_RECOMMENDATIONS.get(disease, {}).get(risk_level.lower(), [])

        display_name = disease.replace("_", " ").title()

        return {
            "disease": display_name,
            "risk_level": risk_level,
            "risk_score": round(risk_score, 4),
            "confidence": round(model_data["rf_accuracy"], 4),
            "risk_factors": risk_factors,
            "recommendations": recommendations,
        }


# Singleton
risk_assessor = RiskAssessor()
