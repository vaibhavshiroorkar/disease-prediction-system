"""
Weather Disease Risk Service — Predicts vector-borne disease risk from weather data.
"""

import pickle
import numpy as np
from typing import Dict, List
from app.config import settings


PREVENTION_TIPS = {
    "dengue": [
        "Eliminate standing water around your home",
        "Use mosquito repellents containing DEET or picaridin",
        "Wear long sleeves and pants in the evening",
        "Install or repair window screens",
        "Use mosquito nets while sleeping",
        "Apply larvicides in water storage containers",
    ],
    "malaria": [
        "Sleep under insecticide-treated bed nets (ITNs)",
        "Take antimalarial prophylaxis if traveling to endemic areas",
        "Use indoor residual spraying (IRS) in your home",
        "Wear protective clothing during dusk and dawn",
        "Clear bushes and stagnant water near living areas",
        "Seek medical attention immediately if you develop fever",
    ],
    "chikungunya": [
        "Prevent mosquito breeding by removing water-filled containers",
        "Use personal mosquito repellents throughout the day",
        "Cover water storage tanks and barrels",
        "Community fogging and spraying during outbreaks",
        "Wear light-colored, long-sleeved clothing",
        "Stay in air-conditioned or well-screened rooms",
    ],
}

REGION_TYPES = ["tropical", "subtropical", "temperate", "arid", "mediterranean"]


class WeatherRiskPredictor:
    """Weather-based disease risk prediction service."""

    def __init__(self):
        self.model = None
        self.loaded = False

    def load(self):
        try:
            with open(settings.WEATHER_MODEL_PATH, "rb") as f:
                artifacts = pickle.load(f)

            self.rf_model = artifacts["rf_model"]
            self.gb_model = artifacts["gb_model"]
            self.scaler = artifacts["scaler"]
            self.feature_names = artifacts["feature_names"]
            self.target_names = artifacts["target_names"]
            self.region_types = artifacts["region_types"]
            self.disease_profiles = artifacts["disease_profiles"]
            self.loaded = True
            print("[OK] Weather risk model loaded")
        except Exception as e:
            print(f"[ERR] Failed to load weather model: {e}")
            self.loaded = False

    def _get_contributing_factors(self, disease_key: str, temp: float, humidity: float,
                                  rainfall: float, month: int, region: str) -> List[str]:
        """Determine which weather factors contribute to risk."""
        factors = []
        profile = self.disease_profiles.get(disease_key, {})

        t_min, t_max = profile.get("temp_range", (0, 0))
        if t_min <= temp <= t_max:
            factors.append(f"Temperature ({temp}°C) is in optimal range for mosquito breeding")
        elif temp > t_max:
            factors.append(f"Temperature ({temp}°C) is above typical range but still warm")

        h_min = profile.get("humidity_min", 0)
        if humidity >= h_min:
            factors.append(f"Humidity ({humidity}%) favors mosquito survival")

        r_min, r_max = profile.get("rainfall_range", (0, 0))
        if r_min <= rainfall <= r_max:
            factors.append(f"Rainfall ({rainfall}mm) creates breeding water sources")
        elif rainfall > r_max:
            factors.append(f"Excessive rainfall ({rainfall}mm) — some breeding sites may wash away")

        peak_months = profile.get("peak_months", [])
        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        if month in peak_months:
            factors.append(f"Current month ({month_names[month-1]}) is peak season for this disease")

        if region in ["tropical", "subtropical"]:
            factors.append(f"Region type ({region}) is endemic-prone")

        return factors if factors else ["Weather conditions are not highly favorable"]

    def _get_season_alert(self, month: int, region: str) -> str:
        """Generate seasonal alert message."""
        if month in [6, 7, 8, 9] and region in ["tropical", "subtropical"]:
            return "HIGH ALERT: Monsoon season -- peak vector-borne disease transmission period"
        elif month in [10, 11] and region in ["tropical", "subtropical"]:
            return "ALERT: Post-monsoon -- stagnant water increases mosquito breeding"
        elif month in [12, 1, 2] and region == "tropical":
            return "Dry season -- reduced but ongoing risk in tropical regions"
        elif region in ["temperate", "arid"]:
            return "Lower baseline risk in this region, but stay cautious during warm months"
        else:
            return "Moderate seasonal risk -- follow standard precautions"

    def predict(self, temperature: float, humidity: float, rainfall: float,
                month: int, region_type: str) -> Dict:
        """Predict weather-based disease risk."""
        if not self.loaded:
            self.load()
        if not self.loaded:
            raise RuntimeError("Weather model not loaded. Run training first.")

        # Encode region
        if region_type not in self.region_types:
            region_type = "tropical"
        region_encoded = self.region_types.index(region_type)

        # Build features
        features = np.array([[temperature, humidity, rainfall, month, region_encoded]])
        features_scaled = self.scaler.transform(features)

        # Get predictions from both models
        rf_pred = self.rf_model.predict(features_scaled)[0]
        gb_pred = self.gb_model.predict(features_scaled)[0]

        # Get probabilities (per estimator in MultiOutput)
        rf_probas = []
        for est in self.rf_model.estimators_:
            rf_probas.append(est.predict_proba(features_scaled)[0])

        gb_probas = []
        for est in self.gb_model.estimators_:
            gb_probas.append(est.predict_proba(features_scaled)[0])

        # Build results
        disease_keys = ["dengue", "malaria", "chikungunya"]
        disease_display = ["Dengue Fever", "Malaria", "Chikungunya"]

        risks = []
        for i, (key, display) in enumerate(zip(disease_keys, disease_display)):
            # Ensemble probability
            rf_p = float(rf_probas[i][1]) if len(rf_probas[i]) > 1 else 0.0
            gb_p = float(gb_probas[i][1]) if len(gb_probas[i]) > 1 else 0.0
            risk_score = rf_p * 0.6 + gb_p * 0.4

            # Risk level
            if risk_score >= 0.75:
                risk_level = "Very High"
            elif risk_score >= 0.5:
                risk_level = "High"
            elif risk_score >= 0.25:
                risk_level = "Moderate"
            else:
                risk_level = "Low"

            factors = self._get_contributing_factors(
                key, temperature, humidity, rainfall, month, region_type
            )
            tips = PREVENTION_TIPS.get(key, [])

            risks.append({
                "disease": display,
                "risk_level": risk_level,
                "risk_score": round(risk_score, 4),
                "contributing_factors": factors,
                "prevention_tips": tips[:4] if risk_level in ["Low", "Moderate"] else tips,
            })

        season_alert = self._get_season_alert(month, region_type)

        return {
            "risks": risks,
            "weather_summary": {
                "temperature": temperature,
                "humidity": humidity,
                "rainfall": rainfall,
            },
            "region": region_type,
            "season_alert": season_alert,
        }


# Singleton
weather_predictor = WeatherRiskPredictor()
