"""
ML Service — Loads and serves the symptom-based disease prediction model.
"""

import pickle
import numpy as np
from typing import List, Dict, Tuple
from app.config import settings

# Disease descriptions for richer output
DISEASE_DESCRIPTIONS = {
    "Common Cold": "A viral infection of the upper respiratory tract. Usually harmless and resolves within 7-10 days.",
    "Influenza (Flu)": "A contagious respiratory illness caused by influenza viruses. Can cause mild to severe illness.",
    "COVID-19": "Respiratory illness caused by the SARS-CoV-2 coronavirus. Symptoms range from mild to severe.",
    "Pneumonia": "Infection that inflames the air sacs in one or both lungs. Can be life-threatening.",
    "Bronchitis": "Inflammation of the bronchial tubes that carry air to and from the lungs.",
    "Asthma": "A chronic condition in which the airways narrow and swell, producing extra mucus.",
    "Tuberculosis": "A serious infectious disease mainly affecting the lungs. Caused by Mycobacterium tuberculosis.",
    "Dengue": "A mosquito-borne tropical disease caused by the dengue virus. Can develop into severe dengue.",
    "Malaria": "A life-threatening disease caused by Plasmodium parasites transmitted by Anopheles mosquitoes.",
    "Typhoid": "A bacterial infection caused by Salmonella typhi, spread through contaminated food and water.",
    "Cholera": "An acute diarrheal infection caused by Vibrio cholerae. Spread through contaminated water.",
    "Hepatitis A": "A highly contagious liver infection caused by the hepatitis A virus.",
    "Hepatitis B": "A serious liver infection caused by the hepatitis B virus. Can become chronic.",
    "Diabetes (Type 2)": "A chronic condition affecting how the body processes blood sugar (glucose).",
    "Hypertension": "A chronic condition where blood pressure in the arteries is persistently elevated.",
    "Heart Disease": "A range of conditions affecting the heart, including coronary artery disease.",
    "Stroke": "Occurs when blood supply to part of the brain is interrupted or reduced.",
    "Migraine": "A neurological condition causing intense, debilitating headaches, often with other symptoms.",
    "Gastroenteritis": "Inflammation of the stomach and intestines, typically from a viral or bacterial infection.",
    "Food Poisoning": "Illness caused by eating contaminated food. Usually mild but can be serious.",
    "Urinary Tract Infection": "An infection in any part of the urinary system — kidneys, bladder, ureters, urethra.",
    "Kidney Stones": "Hard deposits of minerals and salts that form inside the kidneys.",
    "Appendicitis": "Inflammation of the appendix. A medical emergency requiring surgical removal.",
    "Arthritis": "Inflammation of one or more joints, causing pain and stiffness that worsen with age.",
    "Allergic Rhinitis": "An allergic response causing itchy, watery eyes, sneezing, and nasal symptoms.",
    "Sinusitis": "Inflammation of the sinuses, often caused by infection, allergies, or chemical irritation.",
    "Tonsillitis": "Inflammation of the tonsils, usually caused by a viral or bacterial infection.",
    "Chickenpox": "A highly contagious viral infection causing an itchy, blister-like rash.",
    "Measles": "A childhood infection caused by a virus. Once common, now preventable by vaccine.",
    "Mumps": "A viral infection primarily affecting the salivary glands near the ears.",
    "Anemia": "A condition where you lack enough healthy red blood cells to carry adequate oxygen.",
    "Hyperthyroidism": "A condition where the thyroid gland produces too much thyroid hormone.",
    "Hypothyroidism": "A condition where the thyroid gland doesn't produce enough thyroid hormone.",
    "Peptic Ulcer": "Sores that develop on the lining of the stomach, small intestine, or esophagus.",
    "GERD": "Gastroesophageal reflux disease — chronic acid reflux that irritates the esophagus.",
    "Irritable Bowel Syndrome": "A common disorder affecting the large intestine with cramping and bloating.",
    "Conjunctivitis": "Inflammation of the conjunctiva (pink eye). Can be caused by viruses, bacteria, or allergies.",
    "Psoriasis": "A chronic autoimmune condition causing rapid buildup of skin cells.",
    "Eczema": "A condition that makes skin red, inflamed, and itchy. Common in children but can occur at any age.",
    "Scabies": "A skin infestation caused by a tiny burrowing mite called Sarcoptes scabiei.",
    "Chikungunya": "A viral disease transmitted by Aedes mosquitoes. Causes fever and severe joint pain.",
}


class SymptomPredictor:
    """Loads the trained symptom model and serves predictions."""

    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.symptom_list = None
        self.disease_list = None
        self.disease_symptom_map = None
        self.loaded = False

    def load(self):
        """Load model artifacts from disk."""
        try:
            with open(settings.SYMPTOM_MODEL_PATH, "rb") as f:
                artifacts = pickle.load(f)

            self.rf_model = artifacts["rf_model"]
            self.gb_model = artifacts["gb_model"]
            self.label_encoder = artifacts["label_encoder"]
            self.symptom_list = artifacts["symptom_list"]
            self.disease_list = artifacts["disease_list"]
            self.disease_symptom_map = artifacts["disease_symptom_map"]
            self.rf_accuracy = artifacts["rf_accuracy"]
            self.gb_accuracy = artifacts["gb_accuracy"]
            self.loaded = True
            print(f"[OK] Symptom model loaded (RF acc: {self.rf_accuracy:.4f})")
        except Exception as e:
            print(f"[ERR] Failed to load symptom model: {e}")
            self.loaded = False

    def predict(self, symptoms: List[str], top_k: int = 5) -> List[Dict]:
        """
        Predict diseases given a list of symptoms.
        Returns top_k predictions with confidence scores.
        """
        if not self.loaded:
            self.load()
        if not self.loaded:
            raise RuntimeError("Symptom model not loaded. Run training first.")

        # Build feature vector
        feature_vector = np.zeros(len(self.symptom_list))
        valid_symptoms = []
        for symptom in symptoms:
            if symptom in self.symptom_list:
                idx = self.symptom_list.index(symptom)
                feature_vector[idx] = 1
                valid_symptoms.append(symptom)

        if not valid_symptoms:
            return []

        X = feature_vector.reshape(1, -1)

        # Get probabilities from both models
        rf_probs = self.rf_model.predict_proba(X)[0]
        gb_probs = self.gb_model.predict_proba(X)[0]

        # Ensemble average
        avg_probs = (rf_probs * 0.6 + gb_probs * 0.4)

        # Get top-k predictions
        top_indices = np.argsort(avg_probs)[::-1][:top_k]

        results = []
        for idx in top_indices:
            disease_name = self.label_encoder.inverse_transform([idx])[0]
            confidence = float(avg_probs[idx])

            if confidence < 0.01:
                continue

            # Find matching symptoms
            disease_symptoms = self.disease_symptom_map.get(disease_name, [])
            matching = [s for s in valid_symptoms if s in disease_symptoms]

            results.append({
                "disease": disease_name,
                "confidence": round(confidence, 4),
                "matching_symptoms": matching,
                "description": DISEASE_DESCRIPTIONS.get(disease_name, ""),
            })

        return results

    def get_metadata(self) -> Dict:
        """Return model metadata."""
        if not self.loaded:
            self.load()
        return {
            "symptoms": [s.replace("_", " ").title() for s in self.symptom_list],
            "symptom_keys": self.symptom_list,
            "diseases": self.disease_list,
            "total_symptoms": len(self.symptom_list),
            "total_diseases": len(self.disease_list),
        }


# Singleton
symptom_predictor = SymptomPredictor()
