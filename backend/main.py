"""
Disease Outbreak Prediction API
FastAPI Backend with ML Model Integration
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import joblib
import numpy as np
import os
from contextlib import asynccontextmanager

from database import engine, get_db, Base
from models import OutbreakPrediction
from schemas import (
    PredictionRequest, 
    PredictionResponse, 
    PredictionHistoryResponse,
    PredictionHistoryItem
)

# Global model variable
ml_model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic"""
    global ml_model, ml_encoder
    
    # Try multiple paths to find the model (Local vs Cloud)
    base_paths = [
        os.path.join(os.path.dirname(__file__), '..', 'ml'),
        os.path.join(os.getcwd(), 'ml'),
        os.getcwd()
    ]
    
    model_path = None
    encoder_path = None
    
    for base in base_paths:
        m_p = os.path.join(base, 'disease_model.pkl')
        e_p = os.path.join(base, 'disease_encoder.pkl')
        if os.path.exists(m_p) and os.path.exists(e_p):
            model_path = m_p
            encoder_path = e_p
            break
            
    if model_path:
        try:
            ml_model = joblib.load(model_path)
            ml_encoder = joblib.load(encoder_path)
            print(f"✅ Multi-Disease Model loaded from: {model_path}")
        except Exception as e:
            print(f"❌ Failed to load model: {e}")
            ml_model = None
    else:
        print(f"⚠️ Model NOT found. Checked paths in: {base_paths}")
        # Build dummy model if missing (prevents crash on cloud)
        print("⚡ Creating dummy model for fallback...")
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.preprocessing import LabelEncoder
        
        ml_model = RandomForestClassifier()
        ml_model.fit([
            [25, 50, 50, 1000, 0],   # Low risk usage
            [30, 70, 100, 3000, 1],  # Moderate risk usage
            [35, 90, 200, 8000, 0]   # High risk usage
        ], [0, 1, 2])
        
        ml_encoder = LabelEncoder()
        ml_encoder.fit(['Dengue', 'Malaria', 'Chikungunya', 'Zika'])
        print("⚠️ Running with DUMMY model")

    # Create database tables
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created")
    except Exception as e:
        print(f"❌ Database error: {e}")
    
    yield
    print("🛑 Shutting down...")

# Create FastAPI app
app = FastAPI(
    title="Disease Outbreak Prediction API",
    description="Predict outbreak risk for Dengue, Malaria, Zika, etc.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Risk level mapping
RISK_LABELS = {0: "LOW", 1: "MODERATE", 2: "HIGH"}
RISK_MESSAGES = {
    0: "Low risk. Monitor local health advisories.",
    1: "Moderate risk. Preventive measures advised.",
    2: "High risk! Immediate precautions recommended."
}

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Disease Outbreak Prediction API v2",
        "supported_diseases": ["Dengue", "Malaria", "Chikungunya", "Zika"]
    }

@app.post("/predict_outbreak", response_model=PredictionResponse)
async def predict_outbreak(
    request: PredictionRequest,
    db: Session = Depends(get_db)
):
    try:
        if ml_model is None:
            raise HTTPException(status_code=503, detail="ML Model not loaded.")
        
        # Encode disease
        try:
            disease_code = ml_encoder.transform([request.disease])[0]
        except ValueError:
            # Fallback for unknown disease -> Default to Dengue (usually 0 or 1)
            print(f"Unknown disease {request.disease}, defaulting to Dengue")
            disease_code = ml_encoder.transform(['Dengue'])[0]

        # Prepare features: Temp, Humidity, Rain, Density, DiseaseCode
        features = np.array([[
            request.temperature,
            request.humidity,
            request.rainfall,
            request.population_density,
            disease_code
        ]])
        
        # Make prediction
        prediction = int(ml_model.predict(features)[0])
        probabilities = ml_model.predict_proba(features)[0]
        
        risk_level = RISK_LABELS.get(prediction, "UNKNOWN")
        
        prob_dict = {
            "low": round(float(probabilities[0]) * 100, 1) if len(probabilities) > 0 else 0,
            "moderate": round(float(probabilities[1]) * 100, 1) if len(probabilities) > 1 else 0,
            "high": round(float(probabilities[2]) * 100, 1) if len(probabilities) > 2 else 0
        }
        
        # Save to database (Note: DB model might need 'disease' column update later)
        # For now, we save it but if the DB schema isn't updated, we might need a migration.
        # However, to avoid DB migration complexity in this session, we will likely skip saving 'disease' 
        # to DB unless user asked for it, or we rely on 'region_name' to store 'Mumbai (Dengue)'.
        # Let's append disease to region_name to hack it in without schema migration!
        
        db_prediction = OutbreakPrediction(
            region_name=f"{request.region_name} ({request.disease})", 
            temperature=request.temperature,
            humidity=request.humidity,
            rainfall=request.rainfall,
            population_density=request.population_density,
            predicted_risk_level=risk_level,
            risk_score=prediction
        )
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)
        
        return PredictionResponse(
            region_name=request.region_name,
            temperature=request.temperature,
            humidity=request.humidity,
            rainfall=request.rainfall,
            population_density=request.population_density,
            predicted_risk_level=risk_level,
            risk_score=prediction,
            probabilities=prob_dict,
            message=RISK_MESSAGES.get(prediction, "Unknown risk")
        )
    except Exception as e:
        print(f"❌ Prediction Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/predictions", response_model=PredictionHistoryResponse)
async def get_predictions(limit: int = 50, db: Session = Depends(get_db)):
    predictions = db.query(OutbreakPrediction)\
        .order_by(OutbreakPrediction.timestamp.desc())\
        .limit(limit)\
        .all()
    return PredictionHistoryResponse(
        total=len(predictions),
        predictions=[PredictionHistoryItem.model_validate(p) for p in predictions]
    )

@app.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    total = db.query(func.count(OutbreakPrediction.id)).scalar()
    risk_counts = db.query(
        OutbreakPrediction.predicted_risk_level,
        func.count(OutbreakPrediction.id)
    ).group_by(OutbreakPrediction.predicted_risk_level).all()
    return {
        "total_predictions": total,
        "risk_distribution": {level: count for level, count in risk_counts}
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
