# Disease Prediction API

FastAPI inference server with five ensemble models. Designed to deploy as a HuggingFace Space (Docker SDK).

## Local development

```bash
# 1. Train models (one-time, writes to ml/models/)
cd ../ml && pip install -r requirements.txt && python scripts/generate_data.py && python scripts/train_all.py

# 2. Copy trained models + metadata into the backend folder for serving
cp -r ../ml/models ./models
cp -r ../ml/data ./data

# 3. Run server
pip install -r requirements.txt
uvicorn app.main:app --reload --port 7860
```

Open http://localhost:7860/docs for the Swagger UI.

## Deploy to HuggingFace Spaces

1. Create a new Space → SDK = **Docker**.
2. Push this `backend/` directory (with `models/` and `data/` populated) to the Space repo.
3. HF will build the Dockerfile and expose the API at `https://<user>-<space>.hf.space`.

The frontend reads `VITE_ML_API_URL` for the base URL.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET    | `/health` | Liveness + which models are loaded |
| GET    | `/meta/symptoms` | Symptom and disease vocabularies |
| POST   | `/predict/symptom` | Symptom → disease ranking |
| POST   | `/predict/diabetes` | Diabetes risk |
| POST   | `/predict/heart` | Cardiovascular risk |
| POST   | `/predict/stroke` | Stroke risk |
| POST   | `/predict/weather` | Mosquito-borne outbreak risk |
