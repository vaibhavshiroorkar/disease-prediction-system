# BioSentinel - Autonomous Epidemiological Surveillance System

Real-time disease outbreak monitoring and context-aware health triage powered by ML.

![BioSentinel](https://img.shields.io/badge/BioSentinel-v1.0-green)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-teal)
![React](https://img.shields.io/badge/React-18-blue)

## 🎯 Overview

BioSentinel is an automated system that monitors environmental and social signals in real-time to predict disease outbreaks (Dengue, Malaria, etc.) in specific geographic regions. It provides context-aware symptom triage for users based on their location's current threat level.

### Two Core Loops

**Loop A: Background Intelligence Pipeline (Autonomous)**
- Celery worker runs hourly
- Fetches weather data and news headlines
- Runs ML weather risk prediction
- Performs NLP sentiment analysis on news
- Stores aggregated threat level in PostgreSQL

**Loop B: User-Facing Triage (Interactive)**
- User enters symptoms on frontend
- Backend checks user's region threat level
- Returns context-aware health recommendation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      DOCKER COMPOSE                              │
├───────────┬───────────┬───────────┬───────────┬────────────────┤
│  FastAPI  │   Celery  │   Celery  │   Redis   │   PostgreSQL   │
│   (web)   │  (worker) │   (beat)  │  (broker) │      (db)      │
│  :8000    │           │           │   :6379   │     :5432      │
└───────────┴───────────┴───────────┴───────────┴────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.11+ (for local development)

### 1. Start the Backend Stack

```bash
# Start all services (PostgreSQL, Redis, FastAPI, Celery)
docker-compose up --build

# Verify services are running
docker-compose ps
```

### 2. Train the ML Model (Optional)

```bash
# Inside backend container or locally
cd ml
python train_weather_model.py
```

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 to view the dashboard.

### 4. Trigger Initial Data Pipeline

```bash
# Via API
curl -X POST http://localhost:8000/api/admin/trigger-pipeline

# Or via Celery directly
docker-compose exec worker celery -A tasks call tasks.update_regional_risks
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/geo/status` | Get all regions with current threat levels |
| POST | `/api/triage/check` | Context-aware symptom analysis |
| GET | `/api/trends/{region_id}` | Historical risk data for charts |
| GET | `/api/regions` | List all monitored regions |
| POST | `/api/admin/trigger-pipeline` | Manually trigger risk update |

### Example: Symptom Triage

```bash
curl -X POST http://localhost:8000/api/triage/check \
  -H "Content-Type: application/json" \
  -d '{
    "region_id": 1,
    "symptoms": ["fever", "joint pain", "headache"]
  }'
```

## 🗂️ Project Structure

```
disease-prediction-system/
├── backend/
│   ├── main.py          # FastAPI application
│   ├── database.py      # SQLAlchemy models
│   ├── tasks.py         # Celery worker tasks
│   ├── schemas.py       # Pydantic schemas
│   ├── config.py        # Configuration
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── ThreatMap.jsx     # react-leaflet map
│   │   │   ├── SymptomModal.jsx  # Triage form
│   │   │   ├── TrendChart.jsx    # recharts visualization
│   │   │   └── StatusPanel.jsx   # Region list
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── ml/
│   ├── train_weather_model.py    # Model training script
│   ├── nlp_analyzer.py           # News sentiment analysis
│   └── weather_model.pkl         # Trained model
├── docker-compose.yml
└── README.md
```

## 🧠 ML Pipeline

### Weather Risk Model
- **Algorithm**: RandomForestClassifier
- **Features**: Temperature (°C), Humidity (%)
- **Output**: Risk level (LOW, MODERATE, HIGH)

### News Sentiment Analyzer
- **Method**: Keyword-based NLP
- **Trigger Words**: outbreak, epidemic, surge, hospitals, fever, warning...
- **Output**: Sentiment score (0.0 - 1.0)

### Score Aggregation
```python
final_score = (0.7 * weather_risk) + (0.3 * news_risk)
```

## 🎨 Frontend Features

- **Interactive Map**: react-leaflet with pulsating threat markers
- **Symptom Triage**: Context-aware health recommendations
- **Trend Charts**: Historical risk visualization with recharts
- **Real-time Updates**: Auto-refresh every 5 minutes

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| web | 8000 | FastAPI application |
| worker | - | Celery task worker |
| beat | - | Celery scheduler |
| redis | 6379 | Message broker |
| postgres | 5432 | Database |

## 📊 Database Schema

### Region
```sql
id          INTEGER PRIMARY KEY
name        VARCHAR(100) UNIQUE
latitude    FLOAT
longitude   FLOAT
```

### RiskSnapshot
```sql
id                   INTEGER PRIMARY KEY
region_id            INTEGER FOREIGN KEY
timestamp            DATETIME
temp_c               FLOAT
humidity_pct         FLOAT
weather_risk_score   FLOAT (0.0-1.0)
news_sentiment_score FLOAT (0.0-1.0)
final_threat_level   ENUM (LOW, MODERATE, HIGH)
```

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | postgresql://... | PostgreSQL connection |
| REDIS_URL | redis://localhost:6379/0 | Redis connection |
| VITE_API_URL | http://localhost:8000 | Frontend API URL |

## 📝 License

MIT License

---

Built with ❤️ for public health surveillance
