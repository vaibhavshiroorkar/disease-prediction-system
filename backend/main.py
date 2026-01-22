"""
BioSentinel FastAPI Application
Main API server with geo status and triage endpoints.
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc
from contextlib import asynccontextmanager
from typing import List, Optional
from datetime import datetime, timedelta

from config import settings
from database import engine, get_db, Base, init_db, seed_regions, Region, RiskSnapshot, ThreatLevel
from schemas import (
    RegionResponse, RegionStatus, GeoStatusResponse,
    TriageRequest, TriageResponse,
    RiskSnapshotResponse, TrendDataPoint, TrendResponse,
    ThreatLevelEnum
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic."""
    print("🚀 BioSentinel API starting up...")
    
    # Initialize database tables
    try:
        init_db()
        print("✅ Database tables created")
        
        # Seed initial regions
        db = next(get_db())
        seed_regions(db)
        db.close()
        
    except Exception as e:
        print(f"⚠️ Database initialization warning: {e}")
    
    yield
    print("🛑 BioSentinel API shutting down...")


# Create FastAPI app
app = FastAPI(
    title=settings.api_title,
    description=settings.api_description,
    version=settings.api_version,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ Health Check ============

@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "BioSentinel API",
        "version": settings.api_version,
        "description": "Autonomous Epidemiological Surveillance System"
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "ok",
        "database": "connected",
        "timestamp": datetime.utcnow().isoformat()
    }


# ============ Geo Status Endpoints ============

@app.get("/api/geo/status", response_model=GeoStatusResponse)
async def get_geo_status(db: Session = Depends(get_db)):
    """
    Get current threat status for all monitored regions.
    Returns latest risk snapshot for each region, optimized for map display.
    """
    regions = db.query(Region).all()
    region_statuses = []
    last_update = None
    
    for region in regions:
        # Get latest snapshot for this region
        latest_snapshot = (
            db.query(RiskSnapshot)
            .filter(RiskSnapshot.region_id == region.id)
            .order_by(desc(RiskSnapshot.timestamp))
            .first()
        )
        
        if latest_snapshot:
            threat_level = ThreatLevelEnum(latest_snapshot.final_threat_level.value)
            weather_risk = latest_snapshot.weather_risk_score
            news_risk = latest_snapshot.news_sentiment_score
            last_updated = latest_snapshot.timestamp
            
            if last_update is None or latest_snapshot.timestamp > last_update:
                last_update = latest_snapshot.timestamp
        else:
            # No data yet - default to LOW
            threat_level = ThreatLevelEnum.LOW
            weather_risk = 0.0
            news_risk = 0.0
            last_updated = None
        
        region_statuses.append(RegionStatus(
            id=region.id,
            name=region.name,
            latitude=region.latitude,
            longitude=region.longitude,
            threat_level=threat_level,
            weather_risk=weather_risk,
            news_risk=news_risk,
            last_updated=last_updated
        ))
    
    return GeoStatusResponse(
        regions=region_statuses,
        last_pipeline_run=last_update
    )


@app.get("/api/regions", response_model=List[RegionResponse])
async def get_regions(db: Session = Depends(get_db)):
    """Get all monitored regions."""
    regions = db.query(Region).all()
    return regions


# ============ Triage Endpoint ============

# Symptom profiles for context-aware decision making
DENGUE_SYMPTOMS = {"fever", "headache", "joint pain", "muscle pain", "rash", "fatigue", "nausea"}
MALARIA_SYMPTOMS = {"fever", "chills", "sweating", "headache", "fatigue", "nausea", "vomiting"}
COMMON_VIRAL = {"fever", "cough", "sore throat", "runny nose", "body aches"}


def analyze_symptom_match(symptoms: List[str]) -> dict:
    """Analyze symptoms for disease pattern matching."""
    symptoms_set = set(s.lower().strip() for s in symptoms)
    
    dengue_match = len(symptoms_set & DENGUE_SYMPTOMS) / len(DENGUE_SYMPTOMS)
    malaria_match = len(symptoms_set & MALARIA_SYMPTOMS) / len(MALARIA_SYMPTOMS)
    
    return {
        "dengue_match": round(dengue_match, 2),
        "malaria_match": round(malaria_match, 2),
        "is_concerning": dengue_match > 0.4 or malaria_match > 0.4
    }


@app.post("/api/triage/check", response_model=TriageResponse)
async def check_symptoms(request: TriageRequest, db: Session = Depends(get_db)):
    """
    Context-aware symptom triage.
    Combines user symptoms with regional threat level for intelligent recommendation.
    """
    # Get region
    region = db.query(Region).filter(Region.id == request.region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    
    # Get latest risk snapshot
    latest_snapshot = (
        db.query(RiskSnapshot)
        .filter(RiskSnapshot.region_id == region.id)
        .order_by(desc(RiskSnapshot.timestamp))
        .first()
    )
    
    if latest_snapshot:
        regional_threat = ThreatLevelEnum(latest_snapshot.final_threat_level.value)
    else:
        regional_threat = ThreatLevelEnum.LOW
    
    # Analyze symptom patterns
    symptom_analysis = analyze_symptom_match(request.symptoms)
    
    # Context-aware decision logic
    context_warning = None
    
    if regional_threat == ThreatLevelEnum.HIGH and symptom_analysis["is_concerning"]:
        # HIGH regional risk + concerning symptoms = URGENT
        urgency_level = "URGENT"
        recommendation = (
            "⚠️ URGENT: Your symptoms match patterns of vector-borne diseases, "
            "and your region is currently experiencing HIGH outbreak risk. "
            "Please seek medical attention immediately. Visit a hospital or clinic today."
        )
        context_warning = (
            f"🚨 {region.name} is currently under HIGH outbreak alert. "
            "Multiple fever cases have been reported in your area."
        )
    elif regional_threat == ThreatLevelEnum.HIGH or symptom_analysis["is_concerning"]:
        # Either high risk OR concerning symptoms = ELEVATED
        urgency_level = "ELEVATED"
        if regional_threat == ThreatLevelEnum.HIGH:
            recommendation = (
                "⚡ Your region has elevated disease activity. "
                "Monitor symptoms closely and consult a doctor within 24-48 hours. "
                "Stay hydrated and avoid mosquito exposure."
            )
            context_warning = f"📊 {region.name} is experiencing increased outbreak risk."
        else:
            recommendation = (
                "Your symptoms warrant medical attention. "
                "Please consult a healthcare provider within 24-48 hours. "
                "Monitor for worsening symptoms such as high fever or severe pain."
            )
    else:
        # Low risk + mild symptoms = ROUTINE
        urgency_level = "ROUTINE"
        recommendation = (
            "Your symptoms appear mild. Rest, stay hydrated, and monitor your condition. "
            "If symptoms persist beyond 3 days or worsen, please consult a doctor."
        )
    
    return TriageResponse(
        region_name=region.name,
        regional_threat_level=regional_threat,
        symptoms_reported=request.symptoms,
        urgency_level=urgency_level,
        recommendation=recommendation,
        context_warning=context_warning
    )


# ============ Trend Data Endpoint ============

@app.get("/api/trends/{region_id}", response_model=TrendResponse)
async def get_region_trends(
    region_id: int, 
    hours: int = 72,
    db: Session = Depends(get_db)
):
    """
    Get historical risk data for a region.
    Used for time-series chart visualization.
    """
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    
    # Get snapshots from last N hours
    since = datetime.utcnow() - timedelta(hours=hours)
    snapshots = (
        db.query(RiskSnapshot)
        .filter(RiskSnapshot.region_id == region_id)
        .filter(RiskSnapshot.timestamp >= since)
        .order_by(RiskSnapshot.timestamp)
        .all()
    )
    
    data_points = [
        TrendDataPoint(
            timestamp=s.timestamp,
            weather_risk=s.weather_risk_score,
            news_risk=s.news_sentiment_score,
            threat_level=ThreatLevelEnum(s.final_threat_level.value)
        )
        for s in snapshots
    ]
    
    return TrendResponse(
        region_id=region.id,
        region_name=region.name,
        data_points=data_points
    )


# ============ Admin/Debug Endpoints ============

@app.post("/api/admin/trigger-pipeline")
async def trigger_pipeline():
    """Manually trigger the risk assessment pipeline (for testing)."""
    from tasks import update_regional_risks
    
    try:
        result = update_regional_risks.delay()
        return {
            "status": "triggered",
            "task_id": result.id,
            "message": "Pipeline task queued. Check worker logs for progress."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to trigger pipeline: {str(e)}")


@app.get("/api/admin/snapshots")
async def get_recent_snapshots(limit: int = 20, db: Session = Depends(get_db)):
    """Get recent risk snapshots for debugging."""
    snapshots = (
        db.query(RiskSnapshot)
        .order_by(desc(RiskSnapshot.timestamp))
        .limit(limit)
        .all()
    )
    
    return [
        {
            "id": s.id,
            "region_id": s.region_id,
            "timestamp": s.timestamp.isoformat(),
            "temp_c": s.temp_c,
            "humidity_pct": s.humidity_pct,
            "weather_risk": s.weather_risk_score,
            "news_risk": s.news_sentiment_score,
            "threat_level": s.final_threat_level.value
        }
        for s in snapshots
    ]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
