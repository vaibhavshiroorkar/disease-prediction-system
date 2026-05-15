"""Generate realistic training datasets for all models.

Builds:
- data/symptoms.csv      symptom -> disease (multi-class)
- data/diabetes.csv      Pima-style features
- data/heart.csv         Cleveland-style features
- data/stroke.csv        Kaggle-style features
- data/weather.csv       climate -> mosquito-borne outbreak risk
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd

RNG = np.random.default_rng(42)
DATA = Path(__file__).resolve().parents[1] / "data"
DATA.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# Symptom -> Disease
# ---------------------------------------------------------------------------

DISEASE_SYMPTOMS: dict[str, list[str]] = {
    "Common Cold": ["runny_nose", "sneezing", "sore_throat", "cough", "mild_fever", "headache", "fatigue", "congestion"],
    "Influenza": ["high_fever", "chills", "body_ache", "fatigue", "headache", "cough", "sore_throat", "runny_nose"],
    "COVID-19": ["fever", "dry_cough", "loss_of_taste", "loss_of_smell", "shortness_of_breath", "fatigue", "headache", "body_ache"],
    "Pneumonia": ["high_fever", "chest_pain", "shortness_of_breath", "productive_cough", "chills", "fatigue", "rapid_breathing"],
    "Bronchitis": ["persistent_cough", "chest_discomfort", "fatigue", "mild_fever", "wheezing", "mucus_production"],
    "Asthma": ["wheezing", "shortness_of_breath", "chest_tightness", "cough", "rapid_breathing"],
    "Tuberculosis": ["persistent_cough", "weight_loss", "night_sweats", "chest_pain", "fatigue", "low_grade_fever", "blood_in_cough"],
    "Migraine": ["severe_headache", "nausea", "sensitivity_to_light", "sensitivity_to_sound", "visual_aura", "vomiting"],
    "Tension Headache": ["dull_headache", "neck_pain", "muscle_tension", "fatigue"],
    "Sinusitis": ["facial_pain", "congestion", "headache", "runny_nose", "post_nasal_drip", "loss_of_smell"],
    "Allergic Rhinitis": ["sneezing", "runny_nose", "itchy_eyes", "watery_eyes", "congestion"],
    "Gastroenteritis": ["diarrhea", "vomiting", "abdominal_cramps", "nausea", "mild_fever", "dehydration"],
    "Food Poisoning": ["nausea", "vomiting", "diarrhea", "abdominal_pain", "fever", "weakness"],
    "Acid Reflux": ["heartburn", "chest_pain", "regurgitation", "sour_taste", "difficulty_swallowing"],
    "Peptic Ulcer": ["abdominal_pain", "bloating", "nausea", "loss_of_appetite", "weight_loss", "dark_stools"],
    "Appendicitis": ["abdominal_pain", "right_lower_pain", "nausea", "vomiting", "loss_of_appetite", "fever"],
    "Urinary Tract Infection": ["burning_urination", "frequent_urination", "cloudy_urine", "pelvic_pain", "low_grade_fever"],
    "Kidney Stones": ["severe_back_pain", "blood_in_urine", "nausea", "vomiting", "frequent_urination", "burning_urination"],
    "Diabetes Type 2": ["frequent_urination", "excessive_thirst", "fatigue", "blurred_vision", "slow_healing", "weight_loss"],
    "Hypothyroidism": ["fatigue", "weight_gain", "cold_intolerance", "dry_skin", "constipation", "depression"],
    "Hyperthyroidism": ["weight_loss", "rapid_heartbeat", "anxiety", "sweating", "heat_intolerance", "tremors"],
    "Anemia": ["fatigue", "pale_skin", "shortness_of_breath", "dizziness", "cold_hands", "rapid_heartbeat"],
    "Hypertension": ["headache", "dizziness", "blurred_vision", "chest_pain", "shortness_of_breath", "nosebleeds"],
    "Heart Attack": ["chest_pain", "left_arm_pain", "shortness_of_breath", "cold_sweat", "nausea", "jaw_pain"],
    "Stroke": ["facial_drooping", "arm_weakness", "speech_difficulty", "sudden_confusion", "vision_loss", "severe_headache"],
    "Anxiety": ["restlessness", "rapid_heartbeat", "sweating", "trembling", "shortness_of_breath", "fear", "insomnia"],
    "Depression": ["persistent_sadness", "loss_of_interest", "fatigue", "insomnia", "weight_changes", "hopelessness"],
    "Insomnia": ["difficulty_sleeping", "fatigue", "irritability", "difficulty_concentrating", "headache"],
    "Malaria": ["high_fever", "chills", "sweating", "headache", "body_ache", "nausea", "fatigue", "shivering"],
    "Dengue": ["high_fever", "severe_headache", "joint_pain", "muscle_pain", "rash", "pain_behind_eyes", "bleeding_gums"],
    "Chikungunya": ["high_fever", "severe_joint_pain", "muscle_pain", "headache", "rash", "fatigue"],
    "Typhoid": ["sustained_fever", "abdominal_pain", "weakness", "headache", "loss_of_appetite", "rose_spots", "diarrhea"],
    "Hepatitis": ["jaundice", "fatigue", "abdominal_pain", "loss_of_appetite", "nausea", "dark_urine", "joint_pain"],
    "Chickenpox": ["itchy_rash", "fever", "fatigue", "loss_of_appetite", "headache", "blisters"],
    "Measles": ["high_fever", "rash", "cough", "runny_nose", "red_eyes", "white_spots_in_mouth"],
    "Eczema": ["itchy_skin", "red_patches", "dry_skin", "skin_inflammation", "blisters"],
    "Psoriasis": ["scaly_patches", "itchy_skin", "dry_skin", "joint_pain", "thickened_nails"],
    "Arthritis": ["joint_pain", "joint_stiffness", "swelling", "reduced_motion", "fatigue", "joint_warmth"],
    "Osteoporosis": ["back_pain", "loss_of_height", "stooped_posture", "bone_fractures"],
    "GERD": ["heartburn", "chest_pain", "regurgitation", "difficulty_swallowing", "chronic_cough", "sour_taste"],
}

ALL_SYMPTOMS = sorted({s for syms in DISEASE_SYMPTOMS.values() for s in syms})


def make_symptom_dataset(samples_per_disease: int = 220) -> pd.DataFrame:
    rows = []
    for disease, core in DISEASE_SYMPTOMS.items():
        for _ in range(samples_per_disease):
            present = set()
            # core symptoms appear with high probability
            for s in core:
                if RNG.random() < 0.78:
                    present.add(s)
            # ensure at least 2 core symptoms
            if len(present) < 2:
                present.update(RNG.choice(core, size=2, replace=False))
            # noise: a few unrelated symptoms
            noise_n = int(RNG.integers(0, 3))
            noise = RNG.choice(ALL_SYMPTOMS, size=noise_n, replace=False)
            present.update(noise)
            row = {sym: int(sym in present) for sym in ALL_SYMPTOMS}
            row["disease"] = disease
            rows.append(row)
    df = pd.DataFrame(rows)
    return df.sample(frac=1, random_state=42).reset_index(drop=True)


# ---------------------------------------------------------------------------
# Diabetes (Pima-style)
# ---------------------------------------------------------------------------

def make_diabetes(n: int = 3000) -> pd.DataFrame:
    pregnancies = RNG.integers(0, 12, n)
    glucose = RNG.normal(120, 32, n).clip(50, 250)
    bp = RNG.normal(72, 14, n).clip(40, 130)
    skin = RNG.normal(22, 12, n).clip(0, 60)
    insulin = RNG.normal(85, 70, n).clip(0, 500)
    bmi = RNG.normal(30, 7, n).clip(15, 60)
    pedigree = RNG.gamma(2, 0.3, n).clip(0.05, 2.5)
    age = RNG.integers(21, 80, n)

    # logistic risk based on real Pima coefficients
    z = (
        0.12 * (glucose - 117)
        + 0.07 * (bmi - 32)
        + 0.04 * (age - 33)
        + 0.9 * pedigree
        + 0.03 * pregnancies
        - 7.0
    )
    p = 1 / (1 + np.exp(-z / 4))
    outcome = (RNG.random(n) < p).astype(int)

    return pd.DataFrame({
        "pregnancies": pregnancies,
        "glucose": glucose.round(0),
        "blood_pressure": bp.round(0),
        "skin_thickness": skin.round(0),
        "insulin": insulin.round(0),
        "bmi": bmi.round(1),
        "diabetes_pedigree": pedigree.round(3),
        "age": age,
        "outcome": outcome,
    })


# ---------------------------------------------------------------------------
# Heart Disease (Cleveland-style)
# ---------------------------------------------------------------------------

def make_heart(n: int = 3000) -> pd.DataFrame:
    age = RNG.integers(29, 80, n)
    sex = RNG.integers(0, 2, n)  # 1=male
    cp = RNG.integers(0, 4, n)   # chest-pain type
    trestbps = RNG.normal(132, 18, n).clip(90, 200).round(0)
    chol = RNG.normal(246, 52, n).clip(120, 560).round(0)
    fbs = (RNG.random(n) < 0.15).astype(int)
    restecg = RNG.integers(0, 3, n)
    thalach = RNG.normal(150, 23, n).clip(70, 210).round(0)
    exang = (RNG.random(n) < 0.33).astype(int)
    oldpeak = RNG.gamma(1.2, 0.9, n).clip(0, 6.5).round(1)
    slope = RNG.integers(0, 3, n)
    ca = RNG.integers(0, 4, n)
    thal = RNG.integers(1, 4, n)

    z = (
        0.04 * (age - 54)
        + 0.7 * sex
        + 0.55 * cp
        + 0.018 * (trestbps - 130)
        + 0.006 * (chol - 240)
        - 0.025 * (thalach - 150)
        + 1.0 * exang
        + 0.7 * oldpeak
        + 0.6 * ca
        + 0.4 * (thal == 3)
        - 1.5
    )
    p = 1 / (1 + np.exp(-z / 2.5))
    target = (RNG.random(n) < p).astype(int)

    return pd.DataFrame({
        "age": age, "sex": sex, "cp": cp, "trestbps": trestbps, "chol": chol,
        "fbs": fbs, "restecg": restecg, "thalach": thalach, "exang": exang,
        "oldpeak": oldpeak, "slope": slope, "ca": ca, "thal": thal, "target": target,
    })


# ---------------------------------------------------------------------------
# Stroke (Kaggle-style)
# ---------------------------------------------------------------------------

def make_stroke(n: int = 4000) -> pd.DataFrame:
    age = RNG.integers(20, 88, n)
    hypertension = (RNG.random(n) < 0.18).astype(int)
    heart_disease = (RNG.random(n) < 0.09).astype(int)
    avg_glucose = RNG.normal(106, 45, n).clip(55, 280).round(1)
    bmi = RNG.normal(28.5, 7, n).clip(14, 55).round(1)
    smoking = RNG.choice([0, 1, 2], n, p=[0.55, 0.25, 0.20])  # never, former, current
    gender = RNG.integers(0, 2, n)

    z = (
        0.075 * (age - 50)
        + 1.4 * hypertension
        + 1.2 * heart_disease
        + 0.012 * (avg_glucose - 105)
        + 0.025 * (bmi - 28)
        + 0.5 * (smoking == 2)
        + 0.25 * (smoking == 1)
        - 5.0
    )
    p = 1 / (1 + np.exp(-z / 2.5))
    stroke = (RNG.random(n) < p).astype(int)

    return pd.DataFrame({
        "gender": gender,
        "age": age,
        "hypertension": hypertension,
        "heart_disease": heart_disease,
        "avg_glucose_level": avg_glucose,
        "bmi": bmi,
        "smoking_status": smoking,
        "stroke": stroke,
    })


# ---------------------------------------------------------------------------
# Weather -> Mosquito-borne outbreak risk
# ---------------------------------------------------------------------------

def make_weather(n: int = 5000) -> pd.DataFrame:
    """Predict outbreak risk for malaria/dengue/chikungunya from climate."""
    temp = RNG.normal(27, 6, n).clip(5, 42).round(1)
    humidity = RNG.normal(65, 20, n).clip(10, 100).round(0)
    rainfall = RNG.gamma(2, 40, n).clip(0, 500).round(0)
    stagnant_water = (RNG.random(n) < 0.35).astype(int)
    population_density = RNG.gamma(2.5, 600, n).clip(50, 8000).round(0)
    prior_cases = RNG.poisson(3, n)

    # mosquitoes thrive at 22-32C, humidity > 60, rainfall recent
    temp_score = np.exp(-((temp - 28) ** 2) / 30)
    humid_score = 1 / (1 + np.exp(-(humidity - 60) / 10))
    rain_score = np.tanh(rainfall / 100)

    z = (
        3.0 * temp_score
        + 2.5 * humid_score
        + 2.0 * rain_score
        + 1.4 * stagnant_water
        + 0.0004 * population_density
        + 0.18 * prior_cases
        - 4.5
    )
    p = 1 / (1 + np.exp(-z))
    # 3 risk classes
    risk = np.where(p < 0.35, 0, np.where(p < 0.70, 1, 2))

    return pd.DataFrame({
        "temperature_c": temp,
        "humidity_pct": humidity,
        "rainfall_mm": rainfall,
        "stagnant_water": stagnant_water,
        "population_density": population_density,
        "prior_cases_30d": prior_cases,
        "risk_level": risk,  # 0=Low, 1=Moderate, 2=High
    })


def main() -> None:
    print("Generating symptom dataset...")
    sym = make_symptom_dataset()
    sym.to_csv(DATA / "symptoms.csv", index=False)
    print(f"  symptoms.csv  rows={len(sym)}  features={len(ALL_SYMPTOMS)}  classes={sym['disease'].nunique()}")

    # save metadata for backend
    (DATA / "symptom_meta.json").write_text(json.dumps({
        "symptoms": ALL_SYMPTOMS,
        "diseases": sorted(DISEASE_SYMPTOMS.keys()),
        "disease_symptoms": DISEASE_SYMPTOMS,
    }, indent=2))

    for name, fn in [
        ("diabetes", make_diabetes),
        ("heart", make_heart),
        ("stroke", make_stroke),
        ("weather", make_weather),
    ]:
        df = fn()
        df.to_csv(DATA / f"{name}.csv", index=False)
        target_col = df.columns[-1]
        print(f"  {name}.csv  rows={len(df)}  positive_rate={df[target_col].mean():.3f}")


if __name__ == "__main__":
    main()
