"""
Supabase Service — Fire-and-forget prediction logging.

Requires SUPABASE_URL and SUPABASE_ANON_KEY env vars.
If not set, logging is silently skipped so the API works without Supabase.

Supabase table setup — run supabase/schema.sql in your Supabase SQL Editor.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import httpx

from app.config import settings


async def log_symptom_prediction(
    symptoms: list[str],
    predictions: list[dict[str, Any]],
    model_accuracy: float,
) -> None:
    """Log a symptom prediction result to Supabase (non-blocking)."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        return

    top = predictions[0] if predictions else {}
    payload = {
        "symptoms": symptoms,
        "top_prediction": top.get("disease"),
        "confidence": top.get("confidence"),
        "model_accuracy": model_accuracy,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(
                f"{settings.SUPABASE_URL}/rest/v1/predictions",
                headers={
                    "apikey": settings.SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_ANON_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal",
                },
                json=payload,
            )
    except Exception:
        # Logging failures must never break the prediction API
        pass
