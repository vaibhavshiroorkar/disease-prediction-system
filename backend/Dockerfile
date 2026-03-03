FROM python:3.11-slim

WORKDIR /app

# Install all Python dependencies (ML + backend) in one layer
COPY ml/requirements.txt /tmp/ml-req.txt
COPY backend/requirements.txt /tmp/backend-req.txt
RUN pip install --no-cache-dir -r /tmp/ml-req.txt -r /tmp/backend-req.txt

# Train ML models at build time so they're baked into the image
COPY ml/ /ml/
WORKDIR /ml
RUN python train_symptom_model.py && \
    python train_risk_model.py && \
    python train_weather_model.py

# Copy Backend code
WORKDIR /app
COPY backend/ .

ENV ML_MODELS_DIR=/ml/models

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
