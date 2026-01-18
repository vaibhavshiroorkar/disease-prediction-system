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
    global ml_model
    
    # Startup: Load ML model
    model_path = os.path.join(os.path.dirname(__file__), '..', 'ml', 'dengue_model.pkl')
    if os.path.exists(model_path):
        ml_model = joblib.load(model_path)
        print(f"✅ ML Model loaded from: {model_path}")
    else:
        print(f"⚠️ Model not found at {model_path}. Run ml/train_model.py first!")
        ml_model = None
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down...")

# Create FastAPI app
app = FastAPI(
    title="Disease Outbreak Prediction API",
    description="Predict Dengue outbreak risk based on environmental factors",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for public access
    allow_credentials=False, # Disable credentials to allow wildcard origin
    allow_methods=["*"],
    allow_headers=["*"],
)

# Risk level mapping
RISK_LABELS = {0: "LOW", 1: "MODERATE", 2: "HIGH"}
RISK_MESSAGES = {
    0: "Low risk of outbreak. Continue monitoring.",
    1: "Moderate risk detected. Consider preventive measures.",
    2: "High risk alert! Immediate action recommended."
}

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Disease Outbreak Prediction API",
        "model_loaded": ml_model is not None
    }

@app.post("/predict_outbreak", response_model=PredictionResponse)
async def predict_outbreak(
    request: PredictionRequest,
    db: Session = Depends(get_db)
):
    """
    Predict disease outbreak risk based on environmental factors.
    
    - **region_name**: Name of the city/region
    - **temperature**: Average temperature in Celsius (0-50)
    - **humidity**: Humidity percentage (0-100)
    - **rainfall**: Precipitation in mm
    - **population_density**: Population per sq km (optional)
    """
    if ml_model is None:
        raise HTTPException(
            status_code=503, 
            detail="ML Model not loaded. Please run train_model.py first."
        )
    
    # Prepare features
    features = np.array([[
        request.temperature,
        request.humidity,
        request.rainfall,
        request.population_density
    ]])
    
    # Make prediction
    prediction = int(ml_model.predict(features)[0])
    probabilities = ml_model.predict_proba(features)[0]
    
    risk_level = RISK_LABELS[prediction]
    
    # Save to database
    db_prediction = OutbreakPrediction(
        region_name=request.region_name,
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
        probabilities={
            "low": round(float(probabilities[0]) * 100, 2),
            "moderate": round(float(probabilities[1]) * 100, 2),
            "high": round(float(probabilities[2]) * 100, 2)
        },
        message=RISK_MESSAGES[prediction]
    )

@app.get("/predictions", response_model=PredictionHistoryResponse)
async def get_predictions(
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get prediction history from database.
    
    - **limit**: Maximum number of records to return (default: 50)
    """
    predictions = db.query(OutbreakPrediction)\
        .order_by(OutbreakPrediction.timestamp.desc())\
        .limit(limit)\
        .all()
    
    return PredictionHistoryResponse(
        total=len(predictions),
        predictions=[PredictionHistoryItem.model_validate(p) for p in predictions]
    )

@app.delete("/predictions/{prediction_id}")
async def delete_prediction(
    prediction_id: int,
    db: Session = Depends(get_db)
):
    """Delete a specific prediction by ID"""
    prediction = db.query(OutbreakPrediction).filter(
        OutbreakPrediction.id == prediction_id
    ).first()
    
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    db.delete(prediction)
    db.commit()
    
    return {"message": f"Prediction {prediction_id} deleted successfully"}

@app.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    """Get overall prediction statistics"""
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
