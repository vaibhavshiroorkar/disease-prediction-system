# MediPredict AI

### Intelligent Disease Prediction System

> Early detection saves lives. MediPredict AI brings together three machine learning models into one clean interface — helping users understand symptoms, assess chronic disease risk, and stay aware of weather-driven outbreaks in their region.

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.3-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)

---

## The Problem

Healthcare access isn't equal everywhere. Millions of people lack timely access to preliminary health guidance — especially in regions prone to seasonal, vector-borne diseases like dengue and malaria. While nothing replaces a doctor's diagnosis, an intelligent screening tool can point people in the right direction faster.

## What This Project Does

MediPredict AI is a **full-stack machine learning application** that tackles disease prediction from three different angles:

### 1. Symptom-Based Disease Prediction

Users select from **130+ clinically relevant symptoms**, and the system maps them against **41 diseases** using an ensemble of Random Forest and Gradient Boosting classifiers. Each prediction includes:

- A ranked list of probable diseases with **confidence percentages**
- The specific symptoms that matched each disease profile
- A brief clinical description to help the user understand what the condition involves

The model achieves **97.2% accuracy** on the test set with a cross-validation score of 97.1%.

### 2. Health Risk Assessment

Three separate models evaluate a user's risk for major chronic conditions:

| Condition | Key Inputs | Model Accuracy | AUC Score |
|---|---|---|---|
| **Type 2 Diabetes** | Glucose, BMI, age, insulin, family history | 90.5% | 0.96 |
| **Heart Disease** | Cholesterol, blood pressure, ECG, exercise tolerance | 88.8% | 0.96 |
| **Stroke** | Hypertension history, glucose, smoking, heart disease history | 94.7% | 0.98 |

Each assessment returns a clear **risk level** (Low / Moderate / High), identifies the **specific risk factors** driving the score, and provides **actionable health recommendations** tailored to the result.

### 3. Weather-Based Disease Alerts

Vector-borne diseases like **dengue, malaria, and chikungunya** are heavily influenced by environmental conditions. This module takes five inputs — temperature, humidity, rainfall, month, and region type — and predicts outbreak risk using a multi-output classifier.

- Supports 5 region types: Tropical, Subtropical, Temperate, Arid, Mediterranean
- Factors in seasonal monsoon patterns and mosquito breeding conditions
- Provides targeted **prevention tips** and **seasonal alerts**
- Model accuracy ranges from **93% to 95%** across all three diseases

---

## How It Works

```
                         ┌──────────────────────────────────┐
                         │       React + TailwindCSS        │
                         │                                  │
                         │  Symptom    Health     Weather   │
                         │  Checker    Risk       Alerts    │
                         └──────┬────────┬──────────┬───────┘
                                │        │          │
                           ─────┼────────┼──────────┼───── REST API (JSON)
                                │        │          │
                         ┌──────┴────────┴──────────┴───────┐
                         │         FastAPI Backend          │
                         │                                  │
                         │  ┌──────┐  ┌───────┐  ┌───────┐ │
                         │  │ RF+GB│  │RF+GB  │  │Multi- │ │
                         │  │Ensem.│  │  x 3  │  │Output │ │
                         │  │      │  │Models │  │  RF   │ │
                         │  └──────┘  └───────┘  └───────┘ │
                         │     ▲          ▲          ▲      │
                         └─────┼──────────┼──────────┼──────┘
                               │          │          │
                         ┌─────┴──────────┴──────────┴──────┐
                         │    Trained Model Artifacts (.pkl) │
                         │         ml/models/                │
                         └──────────────────────────────────┘
```

The frontend sends requests to the FastAPI backend, which loads pre-trained scikit-learn models from disk. Each model was trained on carefully constructed synthetic datasets that mirror real-world medical data distributions (Pima Indians for diabetes, Cleveland dataset patterns for heart disease, WHO epidemiological profiles for weather-disease correlations).

---

## Getting Started

### Prerequisites

- **Python 3.11+** with pip
- **Node.js 18+** with npm

### Step 1 — Clone the Repository

```bash
git clone https://github.com/yourusername/disease-prediction-system.git
cd disease-prediction-system
```

### Step 2 — Train the ML Models

This generates the `.pkl` model files that the backend loads at runtime.

```bash
cd ml
pip install -r requirements.txt

python train_symptom_model.py      # ~10s — trains on 10,250 samples across 41 diseases
python train_risk_model.py         # ~8s  — trains diabetes, heart, and stroke models
python train_weather_model.py      # ~6s  — trains multi-output weather risk model

cd ..
```

You'll see accuracy metrics printed for each model as it trains.

### Step 3 — Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API docs are automatically available at **http://localhost:8000/docs** (Swagger UI).

### Step 4 — Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

### Step 5 — Open the App

Navigate to **http://localhost:5173** and you're ready to go.

---

## Docker (Alternative Setup)

If you prefer containers, train the models first (Step 2), then:

```bash
docker-compose up --build
```

This spins up both the backend (port 8000) and frontend (port 5173).

---

## Project Structure

```
disease-prediction-system/
│
├── ml/                              # ML Training Pipeline
│   ├── train_symptom_model.py       # Symptom → Disease (41 classes, RF+GB)
│   ├── train_risk_model.py          # Health risk models (diabetes, heart, stroke)
│   ├── train_weather_model.py       # Weather → Outbreak risk (multi-output)
│   ├── models/                      # Generated .pkl artifacts (gitignored)
│   └── requirements.txt
│
├── backend/                         # FastAPI REST API
│   ├── app/
│   │   ├── main.py                  # Application entry point & CORS config
│   │   ├── config.py                # Paths, settings, environment vars
│   │   ├── schemas.py               # Pydantic request/response models
│   │   ├── routers/
│   │   │   ├── prediction.py        # POST /api/predict/symptoms
│   │   │   ├── risk.py              # POST /api/risk/{diabetes,heart,stroke}
│   │   │   └── weather.py           # POST /api/weather/risk
│   │   └── services/
│   │       ├── ml_service.py        # Symptom model loading & inference
│   │       ├── risk_service.py      # Risk scoring & recommendations
│   │       └── weather_service.py   # Weather risk prediction & alerts
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                        # React SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page with feature overview
│   │   │   ├── SymptomChecker.jsx   # Multi-select symptom input + results
│   │   │   ├── RiskAssessment.jsx   # Tabbed form for 3 risk models
│   │   │   ├── WeatherAlerts.jsx    # Weather input + risk visualization
│   │   │   └── About.jsx           # Architecture & tech docs
│   │   ├── components/layout/       # Navbar, Footer, Layout wrapper
│   │   └── api/axios.js             # Centralized API client
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## API Reference

All endpoints accept and return JSON. The backend runs at `http://localhost:8000` by default.

| Endpoint | Method | What It Does |
|---|---|---|
| `/api/predict/symptoms` | POST | Takes a list of symptom keys, returns ranked disease predictions |
| `/api/predict/metadata` | GET | Returns all available symptoms, diseases, and model info |
| `/api/risk/diabetes` | POST | Evaluates Type 2 diabetes risk from clinical parameters |
| `/api/risk/heart` | POST | Evaluates heart disease risk from cardiac measurements |
| `/api/risk/stroke` | POST | Evaluates stroke risk from health history |
| `/api/weather/risk` | POST | Predicts dengue, malaria, chikungunya risk from weather data |
| `/api/weather/regions` | GET | Returns the 5 supported geographic region types |
| `/health` | GET | Health check endpoint |

**Example — Symptom Prediction Request:**

```json
POST /api/predict/symptoms
{
  "symptoms": ["high_fever", "severe_headache", "joint_pain", "rash"]
}
```

**Response (abbreviated):**

```json
{
  "predictions": [
    {
      "disease": "Dengue",
      "confidence": 0.5141,
      "matching_symptoms": ["high_fever", "severe_headache", "joint_pain", "rash"],
      "description": "A mosquito-borne tropical disease caused by the dengue virus."
    }
  ],
  "model_used": "Random Forest + Gradient Boosting Ensemble",
  "model_accuracy": 0.9722
}
```

---

## Model Performance Summary

These are the actual metrics from training on the generated datasets:

| Model | Algorithm | Coverage | Test Accuracy | AUC |
|---|---|---|---|---|
| Symptom Predictor | RF + Gradient Boosting Ensemble | 41 diseases, 129 features | 97.2% | — |
| Diabetes Risk | Random Forest (150 trees) | Binary classification | 90.5% | 0.962 |
| Heart Disease Risk | Random Forest (150 trees) | Binary classification | 88.8% | 0.963 |
| Stroke Risk | Random Forest (150 trees) | Binary classification | 94.7% | 0.982 |
| Weather Risk (Dengue) | Multi-Output Random Forest | Binary per disease | 92.9% | — |
| Weather Risk (Malaria) | Multi-Output Random Forest | Binary per disease | 94.3% | — |
| Weather Risk (Chikungunya) | Multi-Output Random Forest | Binary per disease | 94.7% | — |

> Models are trained on synthetic datasets that replicate the statistical distributions of well-known medical datasets. This is an educational project — real-world deployment would require training on actual clinical data with proper validation.

---

## Tech Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend** | React 18, TailwindCSS, Framer Motion, Recharts, React Select | Interactive UI with animations and data visualization |
| **Backend** | FastAPI, Pydantic, Uvicorn | High-performance async API with automatic validation |
| **Machine Learning** | scikit-learn, NumPy, Pandas | Model training, data processing, inference |
| **Infrastructure** | Docker, Docker Compose | Containerized deployment |

---

## What I Learned Building This

- Designing **ensemble ML pipelines** that combine multiple classifiers for higher accuracy
- Building **multi-output classifiers** for predicting multiple diseases simultaneously
- Structuring a **clean service layer** pattern in FastAPI (routers → services → models)
- Creating **synthetic training datasets** that approximate real medical data distributions
- Implementing **explainable AI** concepts — showing users *why* a prediction was made, not just *what* it is
- Bridging the gap between ML model outputs and **user-friendly health recommendations**

---

## Disclaimer

This project is built for **educational and portfolio purposes**. It is **not** a medical device, and its predictions should **never** be used as a substitute for professional medical advice, diagnosis, or treatment. The models are trained on synthetic data and are intended to demonstrate machine learning concepts in a healthcare context. If you have health concerns, please consult a qualified healthcare provider.

---

## License

MIT
