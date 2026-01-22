"""
BioSentinel Database Models
SQLAlchemy ORM models for Region and RiskSnapshot entities.
"""

import enum
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Float, 
    DateTime, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

from config import settings


# Create database engine
engine = create_engine(settings.database_url, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class ThreatLevel(enum.Enum):
    """Enumeration for regional threat levels."""
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"


class Region(Base):
    """
    Geographic region being monitored.
    Seeded with major Indian cities.
    """
    __tablename__ = "regions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Relationship to risk snapshots
    risk_snapshots = relationship("RiskSnapshot", back_populates="region")
    
    def __repr__(self):
        return f"<Region(name='{self.name}', lat={self.latitude}, lon={self.longitude})>"


class RiskSnapshot(Base):
    """
    Point-in-time risk assessment for a region.
    Created hourly by the Celery worker pipeline.
    """
    __tablename__ = "risk_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Weather data
    temp_c = Column(Float, nullable=False)
    humidity_pct = Column(Float, nullable=False)
    
    # ML-derived scores (0.0 to 1.0)
    weather_risk_score = Column(Float, nullable=False)
    news_sentiment_score = Column(Float, nullable=False)
    
    # Final aggregated threat level
    final_threat_level = Column(SQLEnum(ThreatLevel), nullable=False)
    
    # Relationship back to region
    region = relationship("Region", back_populates="risk_snapshots")
    
    def __repr__(self):
        return f"<RiskSnapshot(region_id={self.region_id}, level={self.final_threat_level}, time={self.timestamp})>"


def get_db():
    """Database session dependency for FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)


def seed_regions(db):
    """Seed database with initial monitored cities."""
    regions = [
        Region(name="Mumbai", latitude=19.0760, longitude=72.8777),
        Region(name="Delhi", latitude=28.6139, longitude=77.2090),
        Region(name="Bangalore", latitude=12.9716, longitude=77.5946),
        Region(name="Chennai", latitude=13.0827, longitude=80.2707),
        Region(name="Kolkata", latitude=22.5726, longitude=88.3639),
        Region(name="Hyderabad", latitude=17.3850, longitude=78.4867),
    ]
    
    for region in regions:
        existing = db.query(Region).filter(Region.name == region.name).first()
        if not existing:
            db.add(region)
    
    db.commit()
    print(f"✅ Seeded {len(regions)} regions")
