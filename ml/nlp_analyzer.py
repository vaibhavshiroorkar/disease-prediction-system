"""
BioSentinel NLP News Analyzer
Keyword-based sentiment analysis for outbreak detection.
In production: Replace with LangChain/LLM integration.
"""

from typing import List, Dict
import re


# Trigger word categories with weights
TRIGGER_CATEGORIES = {
    "outbreak_terms": {
        "words": ["outbreak", "epidemic", "pandemic", "surge", "spike", "cluster"],
        "weight": 1.0
    },
    "medical_facility": {
        "words": ["hospitals", "overwhelmed", "overflow", "emergency", "icu", "beds"],
        "weight": 0.8
    },
    "disease_names": {
        "words": ["dengue", "malaria", "chikungunya", "zika", "fever", "infection"],
        "weight": 0.7
    },
    "severity_indicators": {
        "words": ["critical", "severe", "death", "fatal", "rising", "spreading"],
        "weight": 0.9
    },
    "alert_terms": {
        "words": ["warning", "alert", "advisory", "caution", "emergency"],
        "weight": 0.6
    },
    "location_impact": {
        "words": ["cases", "patients", "affected", "reported", "confirmed"],
        "weight": 0.5
    }
}


def analyze_headlines(headlines: List[str]) -> Dict:
    """
    Analyze news headlines for outbreak-related sentiment.
    
    Returns:
        dict with:
        - sentiment_score: 0.0 to 1.0 (higher = more concerning)
        - triggered_words: list of trigger words found
        - category_scores: breakdown by category
    """
    triggered_words = []
    category_scores = {cat: 0 for cat in TRIGGER_CATEGORIES}
    
    combined_text = " ".join(headlines).lower()
    
    for category, config in TRIGGER_CATEGORIES.items():
        for word in config["words"]:
            # Count occurrences
            count = len(re.findall(r'\b' + word + r'\b', combined_text))
            if count > 0:
                triggered_words.append(word)
                category_scores[category] += count * config["weight"]
    
    # Calculate weighted sentiment score
    total_weight = sum(
        config["weight"] * len(config["words"]) 
        for config in TRIGGER_CATEGORIES.values()
    )
    raw_score = sum(category_scores.values())
    
    # Normalize to 0-1 range (assuming max 20 trigger hits)
    max_expected_hits = 20
    sentiment_score = min(raw_score / max_expected_hits, 1.0)
    
    return {
        "sentiment_score": round(sentiment_score, 3),
        "triggered_words": list(set(triggered_words)),
        "category_scores": {k: round(v, 2) for k, v in category_scores.items()},
        "headlines_analyzed": len(headlines),
        "risk_level": (
            "HIGH" if sentiment_score >= 0.6 else
            "MODERATE" if sentiment_score >= 0.3 else
            "LOW"
        )
    }


def analyze_single_headline(headline: str) -> Dict:
    """Analyze a single headline."""
    return analyze_headlines([headline])


# Example usage
if __name__ == "__main__":
    test_headlines = [
        "Weather remains warm in Mumbai",
        "Traffic congestion increases in city",
        "Hospitals report surge in fever cases in Mumbai",
        "Health officials issue dengue warning",
        "Mystery fever outbreak concerns residents",
        "Emergency rooms overwhelmed with patients",
    ]
    
    print("🔬 BioSentinel NLP Analyzer Test")
    print("=" * 50)
    
    result = analyze_headlines(test_headlines)
    
    print(f"\n📰 Headlines analyzed: {result['headlines_analyzed']}")
    print(f"🎯 Sentiment Score: {result['sentiment_score']}")
    print(f"⚠️  Risk Level: {result['risk_level']}")
    print(f"\n🔍 Triggered Words: {', '.join(result['triggered_words'])}")
    print(f"\n📊 Category Scores:")
    for cat, score in result['category_scores'].items():
        if score > 0:
            print(f"   {cat}: {score}")
