"""
Disease Prediction System — Weather-Based Disease Risk Model Training
Predicts risk of vector-borne diseases (Dengue, Malaria, Chikungunya)
based on weather conditions and geographic/seasonal factors.
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
from sklearn.multioutput import MultiOutputClassifier
import warnings
warnings.filterwarnings("ignore")


# Risk profiles: how weather conditions affect each disease
DISEASE_WEATHER_PROFILES = {
    "dengue": {
        "temp_range": (25, 35),      # Aedes mosquitoes thrive
        "humidity_min": 60,
        "rainfall_range": (100, 300), # Standing water for breeding
        "peak_months": [6, 7, 8, 9, 10, 11],  # Monsoon & post-monsoon
    },
    "malaria": {
        "temp_range": (20, 33),      # Anopheles mosquitoes
        "humidity_min": 55,
        "rainfall_range": (80, 400),
        "peak_months": [7, 8, 9, 10, 11],
    },
    "chikungunya": {
        "temp_range": (26, 37),      # Similar to dengue
        "humidity_min": 65,
        "rainfall_range": (100, 350),
        "peak_months": [7, 8, 9, 10],
    },
}

REGIONS = {
    "tropical": {"base_temp": 30, "base_humidity": 75, "base_rainfall": 200},
    "subtropical": {"base_temp": 25, "base_humidity": 65, "base_rainfall": 120},
    "temperate": {"base_temp": 18, "base_humidity": 55, "base_rainfall": 80},
    "arid": {"base_temp": 35, "base_humidity": 30, "base_rainfall": 20},
    "mediterranean": {"base_temp": 22, "base_humidity": 50, "base_rainfall": 50},
}


def calculate_disease_risk(temp, humidity, rainfall, month, region_type):
    """Calculate risk level for each disease based on conditions."""
    risks = {}

    for disease, profile in DISEASE_WEATHER_PROFILES.items():
        score = 0.0

        # Temperature factor
        t_min, t_max = profile["temp_range"]
        if t_min <= temp <= t_max:
            # Peak at center of range
            center = (t_min + t_max) / 2
            score += 1.0 - abs(temp - center) / (t_max - t_min)
        elif temp > t_max:
            score += max(0, 0.3 - (temp - t_max) * 0.05)

        # Humidity factor
        if humidity >= profile["humidity_min"]:
            score += min(1.0, (humidity - profile["humidity_min"]) / 30)

        # Rainfall factor
        r_min, r_max = profile["rainfall_range"]
        if r_min <= rainfall <= r_max:
            score += 0.8
        elif rainfall > r_max:
            score += 0.4  # Too much can wash away breeding sites
        elif rainfall > r_min * 0.5:
            score += 0.3

        # Seasonal factor
        if month in profile["peak_months"]:
            score += 0.8
        elif month in [(m - 1) % 12 or 12 for m in profile["peak_months"][:2]]:
            score += 0.3

        # Region factor
        if region_type in ["tropical", "subtropical"]:
            score += 0.5
        elif region_type == "temperate":
            score -= 0.3

        risks[disease] = 1 if score > 2.0 else 0

    return risks


def generate_weather_data(n: int = 5000) -> pd.DataFrame:
    """Generate synthetic weather-disease dataset."""
    np.random.seed(42)
    rows = []

    region_types = list(REGIONS.keys())

    for _ in range(n):
        region = np.random.choice(region_types)
        base = REGIONS[region]
        month = np.random.randint(1, 13)

        # Seasonal variation
        seasonal_factor = np.sin((month - 1) * np.pi / 6)  # peaks mid-year

        temp = base["base_temp"] + seasonal_factor * 5 + np.random.normal(0, 3)
        humidity = base["base_humidity"] + seasonal_factor * 10 + np.random.normal(0, 8)
        rainfall = max(0, base["base_rainfall"] + seasonal_factor * 80 + np.random.normal(0, 30))

        temp = np.clip(temp, 5, 45)
        humidity = np.clip(humidity, 10, 100)
        rainfall = np.clip(rainfall, 0, 500)

        risks = calculate_disease_risk(temp, humidity, rainfall, month, region)

        # Add noise
        for disease in risks:
            if np.random.random() < 0.05:
                risks[disease] = 1 - risks[disease]

        region_encoded = region_types.index(region)

        rows.append({
            "temperature": round(temp, 1),
            "humidity": round(humidity, 1),
            "rainfall": round(rainfall, 1),
            "month": month,
            "region_type": region_encoded,
            "dengue_risk": risks["dengue"],
            "malaria_risk": risks["malaria"],
            "chikungunya_risk": risks["chikungunya"],
        })

    return pd.DataFrame(rows)


def train_model():
    """Train weather-based disease risk model."""
    print("=" * 60)
    print("  Weather-Based Disease Risk — Model Training")
    print("=" * 60)

    # Generate data
    print("\n[1/4] Generating weather-disease dataset...")
    df = generate_weather_data(8000)
    print(f"  - Dataset shape: {df.shape}")
    print(f"  - Dengue positives:      {df['dengue_risk'].mean():.2%}")
    print(f"  - Malaria positives:     {df['malaria_risk'].mean():.2%}")
    print(f"  - Chikungunya positives: {df['chikungunya_risk'].mean():.2%}")

    # Prepare features
    feature_cols = ["temperature", "humidity", "rainfall", "month", "region_type"]
    target_cols = ["dengue_risk", "malaria_risk", "chikungunya_risk"]

    X = df[feature_cols].values
    y = df[target_cols].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    # Train multi-output Random Forest
    print("\n[2/4] Training multi-output Random Forest...")
    rf = MultiOutputClassifier(
        RandomForestClassifier(n_estimators=150, max_depth=12, random_state=42, n_jobs=-1)
    )
    rf.fit(X_train, y_train)
    rf_pred = rf.predict(X_test)

    for i, disease in enumerate(target_cols):
        acc = accuracy_score(y_test[:, i], rf_pred[:, i])
        print(f"  - {disease:25s} Accuracy: {acc:.4f}")

    # Train multi-output Gradient Boosting
    print("\n[3/4] Training multi-output Gradient Boosting...")
    gb = MultiOutputClassifier(
        GradientBoostingClassifier(n_estimators=100, max_depth=6, random_state=42)
    )
    gb.fit(X_train, y_train)
    gb_pred = gb.predict(X_test)

    for i, disease in enumerate(target_cols):
        acc = accuracy_score(y_test[:, i], gb_pred[:, i])
        print(f"  - {disease:25s} Accuracy: {acc:.4f}")

    # Save
    print("\n[4/4] Saving model artifacts...")
    os.makedirs("models", exist_ok=True)

    artifacts = {
        "rf_model": rf,
        "gb_model": gb,
        "scaler": scaler,
        "feature_names": feature_cols,
        "target_names": target_cols,
        "region_types": list(REGIONS.keys()),
        "disease_profiles": DISEASE_WEATHER_PROFILES,
    }

    with open("models/weather_model.pkl", "wb") as f:
        pickle.dump(artifacts, f)

    # Metadata
    meta = {
        "features": feature_cols,
        "targets": target_cols,
        "region_types": list(REGIONS.keys()),
        "disease_profiles": {
            k: {
                "temp_range": v["temp_range"],
                "humidity_min": v["humidity_min"],
                "rainfall_range": v["rainfall_range"],
                "peak_months": v["peak_months"],
            }
            for k, v in DISEASE_WEATHER_PROFILES.items()
        },
    }
    with open("models/weather_metadata.json", "w") as f:
        json.dump(meta, f, indent=2)

    print(f"\n[OK] Model saved to models/weather_model.pkl")
    print(f"[OK] Metadata saved to models/weather_metadata.json")


if __name__ == "__main__":
    train_model()
