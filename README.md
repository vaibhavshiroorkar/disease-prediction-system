# Disease Prediction System

A full-stack ML application for symptom checking, chronic disease risk assessment, and weather-driven outbreak alerts. Built to explore what it actually takes to bring machine learning into a healthcare context — not just the modelling, but the whole thing: a fast API, a UI someone would actually use, and predictions that explain themselves.

It won't replace your doctor. But it might help you ask better questions.

Try it out at **[diseasepredictionsystem.vercel.app](https://diseasepredictionsystem.vercel.app)**

> The backend runs on Render's free tier, so the first request after inactivity can take 30–60 seconds to respond.

---

## What it does

### Symptom checker

Pick from 130+ symptoms and the system runs them through a Random Forest + Gradient Boosting ensemble trained across 41 diseases. You get a ranked list of probable conditions with confidence percentages, which of your symptoms matched each one, and a plain-English description of the condition.

Test accuracy: **97.2%** (cross-validated at 97.1%).

### Health risk assessment

Three separate models for Type 2 diabetes, heart disease, and stroke. Fill in a short form with clinical measurements and get a risk level (Low / Moderate / High), the specific factors driving your score, and recommendations.

| Condition | Accuracy | AUC |
|---|---|---|
| Type 2 Diabetes | 90.5% | 0.96 |
| Heart Disease | 88.8% | 0.96 |
| Stroke | 94.7% | 0.98 |

### Weather disease alerts

Dengue, malaria, and chikungunya follow environmental patterns closely. Enter your temperature, humidity, rainfall, month, and region type — the system predicts outbreak risk using a multi-output classifier trained on those correlations. Also surfaces prevention tips and seasonal context.

Accuracy across the three diseases: **93–95%**.

---

## Architecture

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
                         │     (baked into Docker image)     │
                         └──────────────────────────────────┘
```

The frontend (Vercel) hits the FastAPI backend (Render) over HTTPS. Models are trained as part of the Docker build so no separate storage is needed. Prediction logs are written to Supabase as a background task — never touching response latency.

---

## Running locally

### Requirements

- Python 3.11+
- Node.js 18+

### Clone and train the models

```bash
git clone https://github.com/vaibhavshiroorkar/disease-prediction-system.git
cd disease-prediction-system

cd ml
pip install -r requirements.txt
python train_symptom_model.py   # ~10s
python train_risk_model.py      # ~8s
python train_weather_model.py   # ~6s
cd ..
```

Each script prints accuracy and cross-validation scores as it runs.

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Swagger docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App at `http://localhost:5173`.

### Docker

```bash
docker-compose up --build
```

Backend on :8000, frontend on :5173.

---

## Deployment

| Service | Role |
|---|---|
| Vercel | React frontend |
| Render | FastAPI backend (Docker) |
| Supabase | Prediction logs (PostgreSQL) |

The backend Dockerfile trains all models during the image build, so the deployed container is self-contained. See [render.yaml](render.yaml) for the Render config and [supabase/schema.sql](supabase/schema.sql) for the DB schema.

---

## Project layout

```
disease-prediction-system/
│
├── ml/
│   ├── train_symptom_model.py       # 41-class RF + Gradient Boosting ensemble
│   ├── train_risk_model.py          # Binary classifiers for 3 chronic conditions
│   ├── train_weather_model.py       # Multi-output RF for outbreak risk
│   └── models/                      # .pkl files — generated at train time
│
├── backend/
│   ├── app/
│   │   ├── main.py                  # Entry point, CORS, router registration
│   │   ├── config.py                # Settings, paths, env vars
│   │   ├── schemas.py               # Pydantic request/response models
│   │   ├── routers/                 # One file per feature domain
│   │   └── services/                # ML loading, inference, Supabase logging
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/                   # SymptomChecker, RiskAssessment, WeatherAlerts, About
│   │   ├── components/layout/       # Navbar, Footer, Layout wrapper
│   │   └── api/axios.js             # Centralized API client
│   └── vercel.json
│
├── supabase/schema.sql
├── render.yaml
└── docker-compose.yml
```

---

## API

| Endpoint | Method | Description |
|---|---|---|
| `/api/predict/symptoms` | POST | Ranked disease predictions from symptoms |
| `/api/predict/metadata` | GET | All available symptoms, diseases, model info |
| `/api/risk/diabetes` | POST | Type 2 diabetes risk score |
| `/api/risk/heart` | POST | Heart disease risk score |
| `/api/risk/stroke` | POST | Stroke risk score |
| `/api/weather/risk` | POST | Outbreak risk from weather + region |
| `/api/weather/regions` | GET | Supported region types |
| `/health` | GET | Health check |

**Example:**

```json
POST /api/predict/symptoms
{ "symptoms": ["high_fever", "severe_headache", "joint_pain", "rash"] }

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

## Stack

**Frontend** — React 18, TailwindCSS, Framer Motion, Recharts, React Select

**Backend** — FastAPI, Pydantic, Uvicorn

**ML** — scikit-learn, NumPy, Pandas

**Infra** — Docker, Render, Vercel, Supabase

---

## What I actually learned

Not the polished version:

- Ensemble models are genuinely better than solo classifiers, but the gains plateau quickly. Most of the accuracy improvement came from dataset design, not algorithm choice.
- Synthetic datasets let you control class balance and noise perfectly — but you're essentially training a model to learn the rules you wrote. Real clinical data is messier and more interesting.
- FastAPI background tasks are underrated. Logging to Supabase without touching response latency was a small but satisfying win.
- `VITE_*` env vars are baked in at build time. Updating them in the host dashboard does nothing until you redeploy. Learned that the hard way.
- Docker build context matters more than you'd think. Sharing model artifacts between a training directory and a serving app in a single image requires a root-level build context.

---

## Disclaimer

Educational project. The predictions are not medically validated and should never replace professional medical judgment. Models were trained on synthetic data. If you're unwell, see a doctor.

---

## License

MIT
