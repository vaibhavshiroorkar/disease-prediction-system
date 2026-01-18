# 🦟 Dengue Outbreak Prediction System

AI-powered dashboard to predict Dengue outbreaks based on environmental factors using Machine Learning.

![Tech Stack](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/ScikitLearn-F7931E?style=flat&logo=scikit-learn&logoColor=white)

## 🎯 Features

- **ML-Powered Predictions**: RandomForestClassifier trained on weather/disease correlation data
- **Real-time Risk Assessment**: Get instant outbreak risk levels (Low/Moderate/High)
- **Interactive Dashboard**: Modern React UI with glassmorphism design
- **Historical Tracking**: View past predictions with trend visualization
- **RESTful API**: FastAPI backend with automatic OpenAPI documentation

## 🏗️ Project Structure

```
disease-prediction-system/
├── ml/
│   ├── train_model.py      # Model training script
│   ├── synthetic_data.csv  # Generated training data
│   └── dengue_model.pkl    # Trained model
├── backend/
│   ├── main.py             # FastAPI application
│   ├── database.py         # SQLAlchemy config
│   ├── models.py           # Database models
│   ├── schemas.py          # Pydantic schemas
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.jsx         # Main app
│   │   └── index.css       # Tailwind styles
│   └── package.json        # Node dependencies
└── docker-compose.yml      # PostgreSQL container
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker Desktop

### Step 1: Start PostgreSQL Database

```bash
docker-compose up -d
```

### Step 2: Train the ML Model

```bash
cd ml
pip install numpy pandas scikit-learn joblib
python train_model.py
```

### Step 3: Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Step 4: Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at `http://localhost:5173`

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict_outbreak` | Make a prediction |
| GET | `/predictions` | Get prediction history |
| DELETE | `/predictions/{id}` | Delete a prediction |
| GET | `/stats` | Get statistics |

### Example Request

```bash
curl -X POST http://localhost:8000/predict_outbreak \
  -H "Content-Type: application/json" \
  -d '{
    "region_name": "Mumbai",
    "temperature": 32,
    "humidity": 85,
    "rainfall": 150,
    "population_density": 6000
  }'
```

### Example Response

```json
{
  "region_name": "Mumbai",
  "temperature": 32,
  "humidity": 85,
  "rainfall": 150,
  "population_density": 6000,
  "predicted_risk_level": "HIGH",
  "risk_score": 2,
  "probabilities": {
    "low": 5.5,
    "moderate": 22.3,
    "high": 72.2
  },
  "message": "High risk alert! Immediate action recommended."
}
```

## 🧠 ML Model Logic

The prediction model considers:

| Factor | High Risk Condition |
|--------|-------------------|
| Temperature | 25-35°C (ideal for mosquitoes) |
| Humidity | ≥80% |
| Rainfall | 100-200mm (standing water) |
| Population Density | ≥5000/km² |

## 🎨 Screenshots

The dashboard features:
- Modern dark theme with glassmorphism
- Color-coded risk cards (Green/Yellow/Red)
- Interactive charts with Recharts
- Responsive design

## 📝 License

MIT License - feel free to use for educational purposes!

---

Built with ❤️ for Disease Prevention
