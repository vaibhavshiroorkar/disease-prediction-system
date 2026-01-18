"""
Database Models - SQLAlchemy ORM Models
"""

from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from database import Base

class OutbreakPrediction(Base):
    """Model for storing outbreak predictions"""
    __tablename__ = "outbreak_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    region_name = Column(String(100), nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    rainfall = Column(Float, nullable=False)
    population_density = Column(Float, nullable=True, default=1000.0)
    predicted_risk_level = Column(String(20), nullable=False)
    risk_score = Column(Integer, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<OutbreakPrediction(id={self.id}, region={self.region_name}, risk={self.predicted_risk_level})>"
