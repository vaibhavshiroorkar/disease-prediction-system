"""
Disease Prediction System — Health Risk Assessment Model Training
Trains models for predicting risk of:
  - Diabetes (Type 2)
  - Heart Disease
  - Stroke
Uses synthetic data modeled on real-world medical datasets.
"""

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score
import warnings
warnings.filterwarnings("ignore")


def generate_diabetes_data(n: int = 2000) -> pd.DataFrame:
    """Generate synthetic diabetes dataset based on Pima Indians features."""
    np.random.seed(42)
    data = {
        "pregnancies": np.random.randint(0, 15, n),
        "glucose": np.random.normal(120, 30, n).clip(50, 200),
        "blood_pressure": np.random.normal(72, 12, n).clip(40, 130),
        "skin_thickness": np.random.normal(25, 10, n).clip(0, 60),
        "insulin": np.random.normal(80, 60, n).clip(0, 500),
        "bmi": np.random.normal(28, 7, n).clip(15, 55),
        "diabetes_pedigree": np.random.exponential(0.5, n).clip(0.05, 2.5),
        "age": np.random.randint(18, 80, n),
    }
    df = pd.DataFrame(data)

    # Realistic risk scoring
    risk = (
        (df["glucose"] > 140).astype(float) * 2
        + (df["bmi"] > 30).astype(float) * 1.5
        + (df["age"] > 45).astype(float) * 1.2
        + (df["diabetes_pedigree"] > 0.8).astype(float) * 1.0
        + (df["blood_pressure"] > 90).astype(float) * 0.5
        + (df["insulin"] > 150).astype(float) * 0.8
        + np.random.normal(0, 0.5, n)
    )
    df["outcome"] = (risk > 3.0).astype(int)
    return df


def generate_heart_data(n: int = 2000) -> pd.DataFrame:
    """Generate synthetic heart disease dataset based on Cleveland dataset features."""
    np.random.seed(43)
    data = {
        "age": np.random.randint(25, 80, n),
        "sex": np.random.randint(0, 2, n),
        "chest_pain_type": np.random.randint(0, 4, n),
        "resting_bp": np.random.normal(130, 18, n).clip(90, 200),
        "cholesterol": np.random.normal(240, 50, n).clip(120, 400),
        "fasting_blood_sugar": np.random.randint(0, 2, n),
        "resting_ecg": np.random.randint(0, 3, n),
        "max_heart_rate": np.random.normal(150, 25, n).clip(70, 210),
        "exercise_angina": np.random.randint(0, 2, n),
        "oldpeak": np.random.exponential(1.0, n).clip(0, 6),
        "slope": np.random.randint(0, 3, n),
    }
    df = pd.DataFrame(data)

    risk = (
        (df["age"] > 55).astype(float) * 1.5
        + (df["cholesterol"] > 280).astype(float) * 1.5
        + (df["resting_bp"] > 150).astype(float) * 1.2
        + (df["max_heart_rate"] < 120).astype(float) * 1.3
        + df["exercise_angina"].astype(float) * 2.0
        + (df["oldpeak"] > 2).astype(float) * 1.5
        + (df["chest_pain_type"] == 0).astype(float) * 1.0
        + np.random.normal(0, 0.5, n)
    )
    df["outcome"] = (risk > 3.5).astype(int)
    return df


def generate_stroke_data(n: int = 2000) -> pd.DataFrame:
    """Generate synthetic stroke prediction dataset."""
    np.random.seed(44)
    data = {
        "age": np.random.randint(18, 85, n),
        "sex": np.random.randint(0, 2, n),
        "hypertension": np.random.choice([0, 1], n, p=[0.85, 0.15]),
        "heart_disease": np.random.choice([0, 1], n, p=[0.9, 0.1]),
        "avg_glucose_level": np.random.normal(105, 40, n).clip(50, 280),
        "bmi": np.random.normal(28, 7, n).clip(15, 55),
        "smoking_status": np.random.randint(0, 3, n),  # 0=never, 1=former, 2=current
    }
    df = pd.DataFrame(data)

    risk = (
        (df["age"] > 60).astype(float) * 2.0
        + df["hypertension"].astype(float) * 2.5
        + df["heart_disease"].astype(float) * 2.0
        + (df["avg_glucose_level"] > 180).astype(float) * 1.5
        + (df["bmi"] > 35).astype(float) * 1.0
        + (df["smoking_status"] == 2).astype(float) * 1.5
        + np.random.normal(0, 0.5, n)
    )
    df["outcome"] = (risk > 4.0).astype(int)
    return df


def train_single_model(name: str, df: pd.DataFrame):
    """Train and return model artifacts for a single disease."""
    print(f"\n  >> Training {name} model...")

    X = df.drop("outcome", axis=1).values
    y = df["outcome"].values
    feature_names = [c for c in df.columns if c != "outcome"]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    # Random Forest
    rf = RandomForestClassifier(
        n_estimators=150, max_depth=10, random_state=42, n_jobs=-1
    )
    rf.fit(X_train, y_train)
    rf_acc = accuracy_score(y_test, rf.predict(X_test))
    rf_auc = roc_auc_score(y_test, rf.predict_proba(X_test)[:, 1])

    # Gradient Boosting
    gb = GradientBoostingClassifier(
        n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42
    )
    gb.fit(X_train, y_train)
    gb_acc = accuracy_score(y_test, gb.predict(X_test))
    gb_auc = roc_auc_score(y_test, gb.predict_proba(X_test)[:, 1])

    # Feature importances
    importances = dict(zip(feature_names, rf.feature_importances_))
    sorted_imp = dict(sorted(importances.items(), key=lambda x: x[1], reverse=True))

    print(f"    RF  — Accuracy: {rf_acc:.4f}, AUC: {rf_auc:.4f}")
    print(f"    GB  — Accuracy: {gb_acc:.4f}, AUC: {gb_auc:.4f}")
    print(f"    Top features: {list(sorted_imp.keys())[:3]}")

    return {
        "rf_model": rf,
        "gb_model": gb,
        "scaler": scaler,
        "feature_names": feature_names,
        "rf_accuracy": rf_acc,
        "rf_auc": rf_auc,
        "gb_accuracy": gb_acc,
        "gb_auc": gb_auc,
        "feature_importances": sorted_imp,
    }


def train_all():
    """Train all risk assessment models."""
    print("=" * 60)
    print("  Health Risk Assessment — Model Training")
    print("=" * 60)

    # Generate datasets
    print("\n[1/4] Generating datasets...")
    diabetes_df = generate_diabetes_data(3000)
    heart_df = generate_heart_data(3000)
    stroke_df = generate_stroke_data(3000)

    print(f"  - Diabetes: {diabetes_df.shape}, positive rate: {diabetes_df['outcome'].mean():.2%}")
    print(f"  - Heart:    {heart_df.shape}, positive rate: {heart_df['outcome'].mean():.2%}")
    print(f"  - Stroke:   {stroke_df.shape}, positive rate: {stroke_df['outcome'].mean():.2%}")

    # Train models
    print("\n[2/4] Training models...")
    models = {
        "diabetes": train_single_model("Diabetes", diabetes_df),
        "heart_disease": train_single_model("Heart Disease", heart_df),
        "stroke": train_single_model("Stroke", stroke_df),
    }

    # Save
    print("\n[3/4] Saving models...")
    os.makedirs("models", exist_ok=True)
    with open("models/risk_models.pkl", "wb") as f:
        pickle.dump(models, f)

    # Save metadata
    meta = {}
    for name, m in models.items():
        meta[name] = {
            "features": m["feature_names"],
            "rf_accuracy": round(m["rf_accuracy"], 4),
            "rf_auc": round(m["rf_auc"], 4),
            "feature_importances": {k: round(v, 4) for k, v in m["feature_importances"].items()},
        }

    import json
    with open("models/risk_metadata.json", "w") as f:
        json.dump(meta, f, indent=2)

    print(f"\n[OK] Models saved to models/risk_models.pkl")
    print(f"[OK] Metadata saved to models/risk_metadata.json")

    # Summary
    print(f"\n{'='*60}")
    print("  Final Results:")
    for name, m in models.items():
        print(f"    {name:15s}  RF={m['rf_accuracy']:.4f}  GB={m['gb_accuracy']:.4f}  AUC={m['rf_auc']:.4f}")
    print(f"{'='*60}")


if __name__ == "__main__":
    train_all()
