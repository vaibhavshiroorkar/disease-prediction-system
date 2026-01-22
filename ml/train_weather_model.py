"""
BioSentinel Weather Risk Model Training
Trains a RandomForestClassifier on synthetic weather/risk data.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import joblib
import os


def generate_synthetic_data(n_samples: int = 5000) -> pd.DataFrame:
    """
    Generate synthetic training data based on epidemiological patterns.
    
    High risk conditions (dengue/malaria favorable):
    - Temperature: 25-35°C (optimal mosquito breeding)
    - Humidity: 70-95% (high moisture)
    
    Low risk conditions:
    - Temperature: <20°C or >40°C (unfavorable for mosquitoes)
    - Humidity: <50% (too dry)
    """
    np.random.seed(42)
    
    data = []
    
    # Generate LOW risk samples (40% of data)
    n_low = int(n_samples * 0.4)
    for _ in range(n_low):
        temp = np.random.choice([
            np.random.uniform(10, 22),   # Cold
            np.random.uniform(38, 45),   # Too hot
        ])
        humidity = np.random.uniform(20, 55)
        data.append([temp, humidity, 0])  # 0 = LOW
    
    # Generate MODERATE risk samples (35% of data)
    n_moderate = int(n_samples * 0.35)
    for _ in range(n_moderate):
        temp = np.random.uniform(22, 28)
        humidity = np.random.uniform(55, 75)
        data.append([temp, humidity, 1])  # 1 = MODERATE
    
    # Generate HIGH risk samples (25% of data)
    n_high = n_samples - n_low - n_moderate
    for _ in range(n_high):
        temp = np.random.uniform(28, 36)
        humidity = np.random.uniform(75, 98)
        data.append([temp, humidity, 2])  # 2 = HIGH
    
    df = pd.DataFrame(data, columns=['temperature_c', 'humidity_pct', 'risk_level'])
    return df.sample(frac=1).reset_index(drop=True)  # Shuffle


def train_model():
    """Train and save the weather risk prediction model."""
    print("🔬 BioSentinel Weather Risk Model Training")
    print("=" * 50)
    
    # Generate training data
    print("\n1️⃣ Generating synthetic training data...")
    df = generate_synthetic_data(5000)
    print(f"   Generated {len(df)} samples")
    print(f"   Risk distribution:\n{df['risk_level'].value_counts().sort_index()}")
    
    # Prepare features and labels
    X = df[['temperature_c', 'humidity_pct']].values
    y = df['risk_level'].values
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\n2️⃣ Split: {len(X_train)} train, {len(X_test)} test samples")
    
    # Train RandomForest
    print("\n3️⃣ Training RandomForestClassifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    print("\n4️⃣ Model Evaluation:")
    y_pred = model.predict(X_test)
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['LOW', 'MODERATE', 'HIGH']))
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    # Feature importance
    print("\n5️⃣ Feature Importance:")
    for name, importance in zip(['temperature_c', 'humidity_pct'], model.feature_importances_):
        print(f"   {name}: {importance:.3f}")
    
    # Save model
    output_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(output_dir, 'weather_model.pkl')
    
    joblib.dump(model, model_path)
    print(f"\n✅ Model saved to: {model_path}")
    
    # Test predictions
    print("\n6️⃣ Sample Predictions:")
    test_cases = [
        [15, 40],   # Cold, dry -> LOW
        [25, 65],   # Warm, moderate humidity -> MODERATE
        [32, 85],   # Hot, humid -> HIGH
        [28, 78],   # Border case
    ]
    
    risk_labels = {0: 'LOW', 1: 'MODERATE', 2: 'HIGH'}
    for temp, humidity in test_cases:
        pred = model.predict([[temp, humidity]])[0]
        proba = model.predict_proba([[temp, humidity]])[0]
        print(f"   Temp={temp}°C, Humidity={humidity}% -> {risk_labels[pred]} "
              f"(probabilities: L={proba[0]:.2f}, M={proba[1]:.2f}, H={proba[2]:.2f})")
    
    return model


if __name__ == "__main__":
    train_model()
