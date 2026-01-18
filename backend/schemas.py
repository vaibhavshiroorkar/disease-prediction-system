"""
Pydantic Schemas - Request/Response Models
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class PredictionRequest(BaseModel):
    """Request schema for prediction endpoint"""
    region_name: str = Field(..., description="Name of the region/city")
    temperature: float = Field(..., ge=0, le=50, description="Temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Humidity percentage")
    rainfall: float = Field(..., ge=0, description="Precipitation in mm")
    population_density: Optional[float] = Field(default=1000.0, ge=0, description="Population per sq km")
    
    class Config:
        json_schema_extra = {
            "example": {
                "region_name": "Mumbai",
                "temperature": 32.5,
                "humidity": 85.0,
                "rainfall": 150.0,
                "population_density": 6000.0
            }
        }

class PredictionResponse(BaseModel):
    """Response schema for prediction endpoint"""
    region_name: str
    temperature: float
    humidity: float
    rainfall: float
    population_density: float
    predicted_risk_level: str
    risk_score: int
    probabilities: dict
    message: str
    
class PredictionHistoryItem(BaseModel):
    """Schema for prediction history items"""
    id: int
    region_name: str
    temperature: float
    humidity: float
    rainfall: float
    population_density: Optional[float]
    predicted_risk_level: str
    risk_score: Optional[int]
    timestamp: datetime
    
    class Config:
        from_attributes = True

class PredictionHistoryResponse(BaseModel):
    """Response schema for prediction history"""
    total: int
    predictions: List[PredictionHistoryItem]
