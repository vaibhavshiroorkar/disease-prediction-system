"""
Database Configuration - SQLAlchemy Setup
Supports both PostgreSQL (Docker) and SQLite (local development)
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database URL - Try PostgreSQL first, fallback to SQLite
DATABASE_URL = os.getenv("DATABASE_URL", None)

if DATABASE_URL is None:
    # Default: Use SQLite for easy local development (no Docker needed)
    import os.path
    db_path = os.path.join(os.path.dirname(__file__), 'disease_prediction.db')
    DATABASE_URL = f"sqlite:///{db_path}"
    print(f"📁 Using SQLite database: {db_path}")
else:
    print(f"🐘 Using PostgreSQL database")

# Create engine with appropriate settings
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
