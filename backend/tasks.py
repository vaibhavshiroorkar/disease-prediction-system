"""
BioSentinel Celery Tasks
Background intelligence pipeline for regional risk assessment.
"""

import random
from datetime import datetime
from celery import Celery
from celery.schedules import crontab
import joblib
import os

from config import settings
from database import SessionLocal, Region, RiskSnapshot, ThreatLevel


# Initialize Celery
celery_app = Celery(
    "biosentinel",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minute timeout
)

# Celery Beat schedule - run hourly
celery_app.conf.beat_schedule = {
    "update-regional-risks-hourly": {
        "task": "tasks.update_regional_risks",
        "schedule": crontab(minute=0),  # Every hour at minute 0
    },
}


# ============ Mock Data Fetchers ============

def get_weather(lat: float, lon: float) -> dict:
    """
    Mock weather API - returns realistic temperature and humidity.
    In production: Replace with OpenWeatherMap or Open-Meteo API call.
    """
    # Simulate seasonal variation based on latitude
    base_temp = 25 + (lat / 10)  # Warmer near equator
    temp_variation = random.uniform(-5, 8)
    
    return {
        "temperature_c": round(base_temp + temp_variation, 1),
        "humidity_pct": round(random.uniform(50, 95), 1),
        "rainfall_mm": round(random.uniform(0, 150), 1),
        "fetched_at": datetime.utcnow().isoformat()
    }


def get_news_headlines(city_name: str) -> list:
    """
    Mock news API - returns simulated headlines for a city.
    In production: Replace with NewsAPI or web scraping.
    """
    # Pool of possible headlines (mix of alarming and normal)
    headline_pool = [
        f"Weather remains warm in {city_name}",
        f"Traffic congestion increases in {city_name}",
        f"New metro line opens in {city_name}",
        f"Local elections scheduled next month",
        f"Tech industry booming in {city_name}",
        # Alarming headlines (trigger high news sentiment)
        f"Hospitals report surge in fever cases in {city_name}",
        f"Mystery fever outbreak concerns residents",
        f"Health officials issue dengue warning for {city_name}",
        f"Mosquito breeding sites found across {city_name}",
        f"Epidemic alert: Cases rising rapidly",
        f"Healthcare facilities overwhelmed in {city_name}",
    ]
    
    # Randomly select 3-5 headlines
    num_headlines = random.randint(3, 5)
    return random.sample(headline_pool, num_headlines)


# ============ ML Analysis Functions ============

def analyze_weather_risk(temp_c: float, humidity_pct: float) -> float:
    """
    Predict disease outbreak risk based on weather conditions.
    Uses trained model if available, otherwise falls back to heuristic.
    """
    model_path = settings.weather_model_path
    
    if os.path.exists(model_path):
        try:
            model = joblib.load(model_path)
            features = [[temp_c, humidity_pct]]
            # Model returns probability of HIGH risk class
            proba = model.predict_proba(features)[0]
            # Return the probability of high-risk class (index 2 or last)
            return float(proba[-1])
        except Exception as e:
            print(f"⚠️ Model prediction failed: {e}, using heuristic")
    
    # Heuristic fallback: High temp + high humidity = high risk
    temp_score = min((temp_c - 20) / 20, 1.0) if temp_c > 20 else 0.0
    humidity_score = min((humidity_pct - 60) / 40, 1.0) if humidity_pct > 60 else 0.0
    
    return round((temp_score * 0.4 + humidity_score * 0.6), 3)


def analyze_news_sentiment(headlines: list) -> float:
    """
    Simple keyword-based sentiment analysis for outbreak detection.
    In production: Replace with LangChain/LLM integration.
    """
    trigger_words = [
        "outbreak", "epidemic", "surge", "hospitals", "fever",
        "warning", "alert", "cases", "mystery", "overwhelmed",
        "dengue", "malaria", "chikungunya", "zika", "infection"
    ]
    
    total_triggers = 0
    for headline in headlines:
        headline_lower = headline.lower()
        for word in trigger_words:
            if word in headline_lower:
                total_triggers += 1
    
    # Normalize: assume max 10 triggers = 1.0 score
    score = min(total_triggers / 10, 1.0)
    return round(score, 3)


def calculate_threat_level(weather_score: float, news_score: float) -> ThreatLevel:
    """
    Aggregate weather and news scores into final threat level.
    Uses weighted combination (70% weather, 30% news).
    """
    combined_score = (
        settings.weather_weight * weather_score + 
        settings.news_weight * news_score
    )
    
    if combined_score >= settings.high_threat_threshold:
        return ThreatLevel.HIGH
    elif combined_score >= settings.moderate_threat_threshold:
        return ThreatLevel.MODERATE
    else:
        return ThreatLevel.LOW


# ============ Main Celery Task ============

@celery_app.task(name="tasks.update_regional_risks")
def update_regional_risks():
    """
    Main pipeline task - runs hourly to update all regional risk assessments.
    
    Pipeline steps:
    1. Fetch weather data for each region
    2. Fetch news headlines for each region
    3. Analyze weather risk using ML model
    4. Analyze news sentiment using NLP
    5. Calculate combined threat level
    6. Store RiskSnapshot in database
    """
    print("🚀 Starting regional risk update pipeline...")
    db = SessionLocal()
    
    try:
        regions = db.query(Region).all()
        print(f"📍 Processing {len(regions)} regions...")
        
        snapshots_created = 0
        
        for region in regions:
            print(f"\n--- Processing: {region.name} ---")
            
            # Step 1: Fetch weather data
            weather_data = get_weather(region.latitude, region.longitude)
            print(f"🌡️  Weather: {weather_data['temperature_c']}°C, {weather_data['humidity_pct']}% humidity")
            
            # Step 2: Fetch news headlines
            headlines = get_news_headlines(region.name)
            print(f"📰 Headlines: {len(headlines)} fetched")
            
            # Step 3: Analyze weather risk
            weather_risk = analyze_weather_risk(
                weather_data["temperature_c"],
                weather_data["humidity_pct"]
            )
            print(f"🔬 Weather Risk Score: {weather_risk}")
            
            # Step 4: Analyze news sentiment
            news_risk = analyze_news_sentiment(headlines)
            print(f"📊 News Risk Score: {news_risk}")
            
            # Step 5: Calculate threat level
            threat_level = calculate_threat_level(weather_risk, news_risk)
            print(f"⚠️  Threat Level: {threat_level.value}")
            
            # Step 6: Store snapshot
            snapshot = RiskSnapshot(
                region_id=region.id,
                temp_c=weather_data["temperature_c"],
                humidity_pct=weather_data["humidity_pct"],
                weather_risk_score=weather_risk,
                news_sentiment_score=news_risk,
                final_threat_level=threat_level
            )
            db.add(snapshot)
            snapshots_created += 1
        
        db.commit()
        print(f"\n✅ Pipeline complete! Created {snapshots_created} risk snapshots.")
        
        return {
            "status": "success",
            "regions_processed": len(regions),
            "snapshots_created": snapshots_created,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ Pipeline failed: {e}")
        raise
    finally:
        db.close()


@celery_app.task(name="tasks.update_single_region")
def update_single_region(region_id: int):
    """Update risk for a single region (for on-demand refresh)."""
    db = SessionLocal()
    
    try:
        region = db.query(Region).filter(Region.id == region_id).first()
        if not region:
            return {"status": "error", "message": f"Region {region_id} not found"}
        
        weather_data = get_weather(region.latitude, region.longitude)
        headlines = get_news_headlines(region.name)
        weather_risk = analyze_weather_risk(weather_data["temperature_c"], weather_data["humidity_pct"])
        news_risk = analyze_news_sentiment(headlines)
        threat_level = calculate_threat_level(weather_risk, news_risk)
        
        snapshot = RiskSnapshot(
            region_id=region.id,
            temp_c=weather_data["temperature_c"],
            humidity_pct=weather_data["humidity_pct"],
            weather_risk_score=weather_risk,
            news_sentiment_score=news_risk,
            final_threat_level=threat_level
        )
        db.add(snapshot)
        db.commit()
        
        return {
            "status": "success",
            "region": region.name,
            "threat_level": threat_level.value
        }
        
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()
