"""
Disease Outbreak Prediction Model Training Script
Generates synthetic weather/disease data and trains a RandomForestClassifier
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os

def generate_synthetic_data(n_samples=1000):
    """
    Generate synthetic weather and disease outbreak data.
    Logic: Higher temp + humidity + rainfall = Higher mosquito breeding = Higher risk
    """
    np.random.seed(42)
    
    # Generate features
    data = {
        'avg_temperature': np.random.uniform(15, 40, n_samples),  # Celsius
        'humidity': np.random.uniform(30, 100, n_samples),         # Percentage
        'precipitation': np.random.uniform(0, 300, n_samples),     # mm rainfall
        'population_density': np.random.uniform(100, 10000, n_samples)  # per sq km
    }
    
    df = pd.DataFrame(data)
    
    # Create risk levels based on realistic logic
    def calculate_risk(row):
        risk_score = 0
        
        # Temperature factor (25-35°C is ideal for mosquitoes)
        if 25 <= row['avg_temperature'] <= 35:
            risk_score += 2
        elif 20 <= row['avg_temperature'] < 25 or 35 < row['avg_temperature'] <= 38:
            risk_score += 1
        
        # Humidity factor (high humidity helps mosquitoes)
        if row['humidity'] >= 80:
            risk_score += 2
        elif row['humidity'] >= 60:
            risk_score += 1
        
        # Rainfall factor (standing water for breeding)
        if 100 <= row['precipitation'] <= 200:
            risk_score += 2
        elif 50 <= row['precipitation'] < 100 or 200 < row['precipitation'] <= 250:
            risk_score += 1
        
        # Population density factor
        if row['population_density'] >= 5000:
            risk_score += 2
        elif row['population_density'] >= 2000:
            risk_score += 1
        
        # Add some randomness
        risk_score += np.random.randint(-1, 2)
        
        # Classify risk level
        if risk_score >= 6:
            return 2  # High
        elif risk_score >= 3:
            return 1  # Moderate
        else:
            return 0  # Low
    
    df['outbreak_risk'] = df.apply(calculate_risk, axis=1)
    
    return df

def train_model(df):
    """Train RandomForestClassifier on the dataset"""
    X = df[['avg_temperature', 'humidity', 'precipitation', 'population_density']]
    y = df['outbreak_risk']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Train model
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print("=" * 50)
    print("DENGUE OUTBREAK PREDICTION MODEL")
    print("=" * 50)
    print(f"\nModel Accuracy: {accuracy:.2%}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, 
                                target_names=['Low Risk', 'Moderate Risk', 'High Risk']))
    
    # Feature importance
    print("\nFeature Importance:")
    for feature, importance in zip(X.columns, model.feature_importances_):
        print(f"  {feature}: {importance:.3f}")
    
    return model

def main():
    print("Generating synthetic dataset...")
    df = generate_synthetic_data(1000)
    
    # Save dataset for reference
    csv_path = os.path.join(os.path.dirname(__file__), 'synthetic_data.csv')
    df.to_csv(csv_path, index=False)
    print(f"Dataset saved to: {csv_path}")
    
    # Distribution check
    print("\nRisk Distribution:")
    print(df['outbreak_risk'].value_counts().sort_index())
    
    print("\nTraining model...")
    model = train_model(df)
    
    # Save model
    model_path = os.path.join(os.path.dirname(__file__), 'dengue_model.pkl')
    joblib.dump(model, model_path)
    print(f"\nModel saved to: {model_path}")
    
    # Test prediction
    print("\n" + "=" * 50)
    print("TEST PREDICTIONS")
    print("=" * 50)
    
    test_cases = [
        {"avg_temperature": 32, "humidity": 85, "precipitation": 150, "population_density": 6000},
        {"avg_temperature": 20, "humidity": 40, "precipitation": 20, "population_density": 500},
        {"avg_temperature": 28, "humidity": 70, "precipitation": 80, "population_density": 3000},
    ]
    
    risk_labels = {0: "LOW", 1: "MODERATE", 2: "HIGH"}
    
    for case in test_cases:
        features = np.array([[case['avg_temperature'], case['humidity'], 
                             case['precipitation'], case['population_density']]])
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        
        print(f"\nInput: Temp={case['avg_temperature']}°C, Humidity={case['humidity']}%, "
              f"Rain={case['precipitation']}mm, Density={case['population_density']}")
        print(f"Prediction: {risk_labels[prediction]} RISK")
        print(f"Probabilities: Low={probabilities[0]:.2%}, Moderate={probabilities[1]:.2%}, High={probabilities[2]:.2%}")

if __name__ == "__main__":
    main()
