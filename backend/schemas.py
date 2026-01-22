"""
BioSentinel Pydantic Schemas
Request/Response models for API validation.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class ThreatLevelEnum(str, Enum):
    """Threat level enumeration for API responses."""
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"


# ============ Region Schemas ============

class RegionBase(BaseModel):
    """Base region schema."""
    name: str
    latitude: float
    longitude: float


class RegionCreate(RegionBase):
    """Schema for creating a new region."""
    pass


class RegionResponse(RegionBase):
    """Region response with ID."""
    id: int
    
    class Config:
        from_attributes = True


class RegionStatus(BaseModel):
    """Region with current threat status for map display."""
    id: int
    name: str
    latitude: float
    longitude: float
    threat_level: ThreatLevelEnum
    weather_risk: float
    news_risk: float
    last_updated: Optional[datetime] = None


# ============ Risk Snapshot Schemas ============

class RiskSnapshotBase(BaseModel):
    """Base risk snapshot schema."""
    temp_c: float
    humidity_pct: float
    weather_risk_score: float = Field(ge=0.0, le=1.0)
    news_sentiment_score: float = Field(ge=0.0, le=1.0)
    final_threat_level: ThreatLevelEnum


class RiskSnapshotCreate(RiskSnapshotBase):
    """Schema for creating a risk snapshot."""
    region_id: int


class RiskSnapshotResponse(RiskSnapshotBase):
    """Risk snapshot response with metadata."""
    id: int
    region_id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True


# ============ Triage Schemas ============

class TriageRequest(BaseModel):
    """Symptom triage request from frontend."""
    region_id: int
    symptoms: List[str] = Field(..., min_length=1)


class TriageResponse(BaseModel):
    """Context-aware triage response."""
    region_name: str
    regional_threat_level: ThreatLevelEnum
    symptoms_reported: List[str]
    urgency_level: str  # "ROUTINE", "ELEVATED", "URGENT"
    recommendation: str
    context_warning: Optional[str] = None


# ============ Geo Status Schemas ============

class GeoStatusResponse(BaseModel):
    """Response for /api/geo/status endpoint."""
    regions: List[RegionStatus]
    last_pipeline_run: Optional[datetime] = None


# ============ Trend Schemas ============

class TrendDataPoint(BaseModel):
    """Single data point for trend chart."""
    timestamp: datetime
    weather_risk: float
    news_risk: float
    threat_level: ThreatLevelEnum


class TrendResponse(BaseModel):
    """Historical trend data for a region."""
    region_id: int
    region_name: str
    data_points: List[TrendDataPoint]
