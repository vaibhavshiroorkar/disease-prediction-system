"""
Disease Prediction System — Symptom-Based Model Training
Trains a Random Forest + XGBoost ensemble on a comprehensive symptom-disease dataset.
Generates SHAP explanations for model interpretability.
"""

import os
import json
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import warnings
warnings.filterwarnings("ignore")

# ──────────────────────────────────────────────
# Comprehensive Disease-Symptom Knowledge Base
# ──────────────────────────────────────────────

DISEASE_SYMPTOM_MAP = {
    "Common Cold": ["sneezing", "runny_nose", "cough", "sore_throat", "mild_fever", "fatigue", "headache"],
    "Influenza (Flu)": ["high_fever", "body_aches", "chills", "fatigue", "cough", "headache", "sore_throat", "runny_nose"],
    "COVID-19": ["fever", "dry_cough", "fatigue", "loss_of_taste", "loss_of_smell", "shortness_of_breath", "body_aches", "headache", "sore_throat"],
    "Pneumonia": ["high_fever", "cough", "shortness_of_breath", "chest_pain", "fatigue", "chills", "rapid_breathing", "sweating"],
    "Bronchitis": ["persistent_cough", "mucus_production", "fatigue", "shortness_of_breath", "chest_discomfort", "mild_fever"],
    "Asthma": ["wheezing", "shortness_of_breath", "chest_tightness", "persistent_cough", "difficulty_breathing"],
    "Tuberculosis": ["persistent_cough", "blood_in_sputum", "night_sweats", "weight_loss", "fatigue", "fever", "chest_pain"],
    "Dengue": ["high_fever", "severe_headache", "pain_behind_eyes", "joint_pain", "muscle_pain", "rash", "nausea", "vomiting", "fatigue"],
    "Malaria": ["high_fever", "chills", "sweating", "headache", "nausea", "vomiting", "body_aches", "fatigue", "diarrhea"],
    "Typhoid": ["prolonged_fever", "headache", "abdominal_pain", "loss_of_appetite", "diarrhea", "constipation", "rash", "weakness"],
    "Cholera": ["severe_diarrhea", "vomiting", "dehydration", "leg_cramps", "rapid_heart_rate", "low_blood_pressure", "thirst"],
    "Hepatitis A": ["fatigue", "nausea", "abdominal_pain", "loss_of_appetite", "low_grade_fever", "dark_urine", "jaundice", "joint_pain"],
    "Hepatitis B": ["fatigue", "nausea", "abdominal_pain", "loss_of_appetite", "jaundice", "dark_urine", "joint_pain", "fever"],
    "Diabetes (Type 2)": ["frequent_urination", "excessive_thirst", "unexplained_weight_loss", "fatigue", "blurred_vision", "slow_healing_wounds", "tingling_hands_feet"],
    "Hypertension": ["headache", "shortness_of_breath", "nosebleeds", "dizziness", "chest_pain", "blurred_vision"],
    "Heart Disease": ["chest_pain", "shortness_of_breath", "fatigue", "irregular_heartbeat", "dizziness", "swollen_legs", "rapid_heart_rate"],
    "Stroke": ["sudden_numbness", "confusion", "difficulty_speaking", "severe_headache", "dizziness", "loss_of_balance", "blurred_vision"],
    "Migraine": ["severe_headache", "nausea", "sensitivity_to_light", "sensitivity_to_sound", "blurred_vision", "aura", "vomiting"],
    "Gastroenteritis": ["diarrhea", "vomiting", "nausea", "abdominal_pain", "fever", "headache", "body_aches", "dehydration"],
    "Food Poisoning": ["nausea", "vomiting", "diarrhea", "abdominal_cramps", "fever", "weakness", "dehydration"],
    "Urinary Tract Infection": ["burning_urination", "frequent_urination", "cloudy_urine", "pelvic_pain", "strong_urine_odor", "blood_in_urine"],
    "Kidney Stones": ["severe_flank_pain", "blood_in_urine", "nausea", "vomiting", "frequent_urination", "burning_urination", "fever"],
    "Appendicitis": ["abdominal_pain", "nausea", "vomiting", "fever", "loss_of_appetite", "abdominal_swelling"],
    "Arthritis": ["joint_pain", "joint_stiffness", "swelling", "reduced_range_of_motion", "redness_around_joints", "fatigue"],
    "Allergic Rhinitis": ["sneezing", "runny_nose", "itchy_eyes", "nasal_congestion", "watery_eyes", "postnasal_drip"],
    "Sinusitis": ["facial_pain", "nasal_congestion", "runny_nose", "headache", "cough", "fever", "fatigue", "reduced_smell"],
    "Tonsillitis": ["sore_throat", "difficulty_swallowing", "fever", "swollen_tonsils", "headache", "ear_pain", "bad_breath"],
    "Chickenpox": ["rash", "itching", "fever", "fatigue", "headache", "loss_of_appetite", "body_aches"],
    "Measles": ["high_fever", "cough", "runny_nose", "rash", "red_eyes", "sensitivity_to_light", "tiny_white_spots_in_mouth"],
    "Mumps": ["swollen_salivary_glands", "fever", "headache", "muscle_pain", "fatigue", "loss_of_appetite", "pain_while_chewing"],
    "Anemia": ["fatigue", "weakness", "pale_skin", "shortness_of_breath", "dizziness", "cold_hands_feet", "headache", "irregular_heartbeat"],
    "Hyperthyroidism": ["weight_loss", "rapid_heart_rate", "anxiety", "tremors", "sweating", "difficulty_sleeping", "fatigue", "increased_appetite"],
    "Hypothyroidism": ["fatigue", "weight_gain", "cold_sensitivity", "dry_skin", "constipation", "depression", "muscle_weakness", "puffy_face"],
    "Peptic Ulcer": ["burning_stomach_pain", "nausea", "bloating", "heartburn", "loss_of_appetite", "weight_loss", "vomiting"],
    "GERD": ["heartburn", "chest_pain", "difficulty_swallowing", "regurgitation", "chronic_cough", "sore_throat", "hoarseness"],
    "Irritable Bowel Syndrome": ["abdominal_pain", "bloating", "diarrhea", "constipation", "gas", "mucus_in_stool", "cramping"],
    "Conjunctivitis": ["red_eyes", "itchy_eyes", "watery_eyes", "discharge_from_eyes", "swollen_eyelids", "sensitivity_to_light"],
    "Psoriasis": ["red_patches_on_skin", "dry_cracked_skin", "itching", "burning_sensation", "thick_silvery_scales", "swollen_joints"],
    "Eczema": ["itching", "red_patches_on_skin", "dry_skin", "cracked_skin", "swelling", "oozing_blisters"],
    "Scabies": ["intense_itching", "rash", "tiny_blisters", "sores", "thin_irregular_burrow_tracks"],
    "Chikungunya": ["high_fever", "severe_joint_pain", "muscle_pain", "headache", "rash", "fatigue", "nausea", "joint_swelling"],
}

# Collect all unique symptoms
ALL_SYMPTOMS = sorted(set(s for symptoms in DISEASE_SYMPTOM_MAP.values() for s in symptoms))
ALL_DISEASES = sorted(DISEASE_SYMPTOM_MAP.keys())


def generate_dataset(samples_per_disease: int = 200, noise_rate: float = 0.05) -> pd.DataFrame:
    """
    Generate synthetic training data from the disease-symptom knowledge base.
    Adds realistic noise: random symptom drops and false positives.
    """
    rows = []
    np.random.seed(42)

    for disease, symptoms in DISEASE_SYMPTOM_MAP.items():
        for _ in range(samples_per_disease):
            row = {s: 0 for s in ALL_SYMPTOMS}

            # Randomly drop some symptoms (patients don't always show all)
            n_present = max(2, int(len(symptoms) * np.random.uniform(0.5, 1.0)))
            present = np.random.choice(symptoms, size=n_present, replace=False)
            for s in present:
                row[s] = 1

            # Add noise: random false-positive symptoms
            n_noise = np.random.binomial(n=3, p=noise_rate)
            if n_noise > 0:
                noise_symptoms = np.random.choice(
                    [s for s in ALL_SYMPTOMS if s not in symptoms],
                    size=min(n_noise, len(ALL_SYMPTOMS) - len(symptoms)),
                    replace=False,
                )
                for s in noise_symptoms:
                    row[s] = 1

            row["disease"] = disease
            rows.append(row)

    return pd.DataFrame(rows)


def train_model():
    """Train ensemble model and save artifacts."""
    print("=" * 60)
    print("  Disease Prediction — Symptom Model Training")
    print("=" * 60)

    # 1. Generate dataset
    print("\n[1/5] Generating synthetic dataset...")
    df = generate_dataset(samples_per_disease=250)
    print(f"  - Dataset shape: {df.shape}")
    print(f"  - Diseases: {df['disease'].nunique()}")
    print(f"  - Symptoms (features): {len(ALL_SYMPTOMS)}")

    # 2. Prepare features
    print("\n[2/5] Preparing features...")
    X = df[ALL_SYMPTOMS].values
    le = LabelEncoder()
    y = le.fit_transform(df["disease"])
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"  - Train: {X_train.shape[0]}, Test: {X_test.shape[0]}")

    # 3. Train Random Forest
    print("\n[3/5] Training Random Forest...")
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=20,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    rf.fit(X_train, y_train)
    rf_acc = accuracy_score(y_test, rf.predict(X_test))
    print(f"  - Accuracy: {rf_acc:.4f}")

    cv_scores = cross_val_score(rf, X, y, cv=5, scoring="accuracy")
    print(f"  - Cross-val: {cv_scores.mean():.4f} +/- {cv_scores.std():.4f}")

    # 4. Train Gradient Boosting
    print("\n[4/5] Training Gradient Boosting...")
    gb = GradientBoostingClassifier(
        n_estimators=150,
        max_depth=8,
        learning_rate=0.1,
        random_state=42,
    )
    gb.fit(X_train, y_train)
    gb_acc = accuracy_score(y_test, gb.predict(X_test))
    print(f"  - Accuracy: {gb_acc:.4f}")

    # 5. Save artifacts
    print("\n[5/5] Saving model artifacts...")
    os.makedirs("models", exist_ok=True)

    artifacts = {
        "rf_model": rf,
        "gb_model": gb,
        "label_encoder": le,
        "symptom_list": ALL_SYMPTOMS,
        "disease_list": ALL_DISEASES,
        "disease_symptom_map": DISEASE_SYMPTOM_MAP,
        "rf_accuracy": rf_acc,
        "gb_accuracy": gb_acc,
    }
    with open("models/symptom_model.pkl", "wb") as f:
        pickle.dump(artifacts, f)

    # Save symptom list as JSON for frontend
    symptom_meta = {
        "symptoms": [s.replace("_", " ").title() for s in ALL_SYMPTOMS],
        "symptom_keys": ALL_SYMPTOMS,
        "diseases": ALL_DISEASES,
        "total_symptoms": len(ALL_SYMPTOMS),
        "total_diseases": len(ALL_DISEASES),
    }
    with open("models/symptom_metadata.json", "w") as f:
        json.dump(symptom_meta, f, indent=2)

    # Classification report
    print("\n" + "=" * 60)
    print("  Classification Report (Random Forest)")
    print("=" * 60)
    y_pred = rf.predict(X_test)
    print(classification_report(y_test, y_pred, target_names=le.classes_))

    print(f"\n[OK] Model saved to models/symptom_model.pkl")
    print(f"[OK] Metadata saved to models/symptom_metadata.json")
    print(f"\n{'='*60}")
    print(f"  Final Results:")
    print(f"    Random Forest Accuracy:      {rf_acc:.4f}")
    print(f"    Gradient Boosting Accuracy:   {gb_acc:.4f}")
    print(f"{'='*60}")


if __name__ == "__main__":
    train_model()
