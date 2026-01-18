import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# Set random seed for reproducibility
np.random.seed(42)

def generate_synthetic_data(n_samples=5000):
    """
    Generate synthetic data for multiple diseases based on epidemiological logic.
    """
    print("🔬 Generating synthetic epidemiological data...")
    
    # Base environmental data
    regions = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Jaipur']
    
    data = {
        'region_name': np.random.choice(regions, n_samples),
        'temperature': np.random.normal(28, 5, n_samples),  # Mean 28°C, SD 5
        'humidity': np.random.normal(70, 15, n_samples),    # Mean 70%, SD 15
        'rainfall': np.random.exponential(50, n_samples),   # Exponential distribution for rain
        'population_density': np.random.randint(1000, 20000, n_samples),
        'disease': np.random.choice(['Dengue', 'Malaria', 'Chikungunya', 'Zika'], n_samples)
    }
    
    df = pd.DataFrame(data)
    
    # Clip values to realistic ranges
    df['temperature'] = df['temperature'].clip(10, 45)
    df['humidity'] = df['humidity'].clip(20, 100)
    df['rainfall'] = df['rainfall'].clip(0, 500)
    
    # Calculate Risk based on Disease-Specific Rules
    # 0 = Low, 1 = Moderate, 2 = High
    risk_levels = []
    
    for _, row in df.iterrows():
        temp = row['temperature']
        hum = row['humidity']
        rain = row['rainfall']
        dens = row['population_density']
        disease = row['disease']
        
        score = 0
        
        if disease == 'Dengue':
            # Thrives in hot (25-35°C) and humid (>60%) conditions
            if 25 <= temp <= 35: score += 1
            if hum > 60: score += 1
            if rain > 50: score += 1
            if dens > 10000: score += 1
            
        elif disease == 'Malaria':
            # Needs standing water (High Rain) and warm temps
            if rain > 100: score += 2 # Strong factor
            elif rain > 50: score += 1
            if temp > 20: score += 1
            if hum > 70: score += 1
            
        elif disease == 'Chikungunya':
            # Similar to Dengue
            if 24 <= temp <= 34: score += 1
            if hum > 65: score += 1
            if rain > 40: score += 1
            
        elif disease == 'Zika':
            # Often milder conditions
            if 22 <= temp <= 32: score += 1
            if hum > 75: score += 1
            if dens > 5000: score += 1

        # Determine final label
        if score >= 3:
            risk_levels.append(2) # High
        elif score >= 2:
            risk_levels.append(1) # Moderate
        else:
            risk_levels.append(0) # Low

    df['outbreak_risk'] = risk_levels
    return df

def train_model():
    # 1. Generate Data
    df = generate_synthetic_data()
    
    # 2. Preprocessing
    # Encode 'disease' text to numbers
    le_disease = LabelEncoder()
    df['disease_encoded'] = le_disease.fit_transform(df['disease'])
    
    # Features: Temp, Humidity, Rain, Density, Disease
    X = df[['temperature', 'humidity', 'rainfall', 'population_density', 'disease_encoded']]
    y = df['outbreak_risk']
    
    # 3. Split Data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 4. Train Model
    print("🧠 Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # 5. Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"🎯 Model Accuracy: {accuracy:.2%}")
    print("\n📊 Classification Report:\n", classification_report(y_test, y_pred))
    
    # 6. Save Artifacts
    if not os.path.exists('ml'):
        os.makedirs('ml')
        
    # Save the model
    model_path = os.path.join('ml', 'disease_model.pkl')
    joblib.dump(model, model_path)
    
    # Save the label encoder separately so backend can decode/encode
    encoder_path = os.path.join('ml', 'disease_encoder.pkl')
    joblib.dump(le_disease, encoder_path)
    
    print(f"✅ Model saved to {model_path}")
    print(f"✅ Encoder saved to {encoder_path}")

if __name__ == "__main__":
    train_model()
