"""Train every model and persist to ml/models/.

Strategy: Random Forest + Gradient Boosting voting ensemble for symptom & risk
models. The weather model uses RF + GBM voting too (multi-class)."""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier, VotingClassifier
from sklearn.metrics import accuracy_score, classification_report, f1_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
MODELS = ROOT / "models"
MODELS.mkdir(parents=True, exist_ok=True)


def voting_ensemble(seed: int = 42, n_estimators: int = 250) -> VotingClassifier:
    rf = RandomForestClassifier(
        n_estimators=n_estimators, max_depth=None, min_samples_leaf=2,
        n_jobs=-1, random_state=seed, class_weight="balanced",
    )
    gb = GradientBoostingClassifier(
        n_estimators=180, max_depth=3, learning_rate=0.08, random_state=seed,
    )
    return VotingClassifier(estimators=[("rf", rf), ("gb", gb)], voting="soft", n_jobs=-1)


def train_symptom() -> None:
    df = pd.read_csv(DATA / "symptoms.csv")
    y = df["disease"]
    X = df.drop(columns=["disease"])
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    model = voting_ensemble(n_estimators=200)
    print("Training symptom ensemble...")
    model.fit(Xtr, ytr)
    pred = model.predict(Xte)
    acc = accuracy_score(yte, pred)
    f1 = f1_score(yte, pred, average="weighted")
    print(f"  symptom  accuracy={acc:.4f}  f1={f1:.4f}")

    joblib.dump({
        "model": model,
        "feature_names": list(X.columns),
        "classes": list(model.classes_),
        "metrics": {"accuracy": acc, "f1": f1},
    }, MODELS / "symptom.joblib")


def train_binary(name: str, target: str, n_estimators: int = 250) -> None:
    df = pd.read_csv(DATA / f"{name}.csv")
    y = df[target]
    X = df.drop(columns=[target])
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", voting_ensemble(n_estimators=n_estimators)),
    ])
    print(f"Training {name} ensemble...")
    pipeline.fit(Xtr, ytr)
    pred = pipeline.predict(Xte)
    proba = pipeline.predict_proba(Xte)[:, 1]
    acc = accuracy_score(yte, pred)
    f1 = f1_score(yte, pred)
    auc = float(roc_auc_score(yte, proba))
    print(f"  {name}  accuracy={acc:.4f}  f1={f1:.4f}  auc={auc:.4f}")

    joblib.dump({
        "model": pipeline,
        "feature_names": list(X.columns),
        "metrics": {"accuracy": acc, "f1": f1, "auc": auc},
    }, MODELS / f"{name}.joblib")


def train_weather() -> None:
    df = pd.read_csv(DATA / "weather.csv")
    y = df["risk_level"]
    X = df.drop(columns=["risk_level"])
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", voting_ensemble(n_estimators=200)),
    ])
    print("Training weather ensemble...")
    pipeline.fit(Xtr, ytr)
    pred = pipeline.predict(Xte)
    acc = accuracy_score(yte, pred)
    f1 = f1_score(yte, pred, average="weighted")
    print(f"  weather  accuracy={acc:.4f}  f1={f1:.4f}")

    joblib.dump({
        "model": pipeline,
        "feature_names": list(X.columns),
        "classes": ["Low", "Moderate", "High"],
        "metrics": {"accuracy": acc, "f1": f1},
    }, MODELS / "weather.joblib")


def main() -> None:
    train_symptom()
    train_binary("diabetes", "outcome")
    train_binary("heart", "target")
    train_binary("stroke", "stroke")
    train_weather()

    summary = {}
    for f in MODELS.glob("*.joblib"):
        bundle = joblib.load(f)
        summary[f.stem] = bundle.get("metrics", {})
    (MODELS / "summary.json").write_text(json.dumps(summary, indent=2))
    print("\nAll models written to ml/models/")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
