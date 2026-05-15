# Aetheris

A small workspace for asking calm questions about your health.

It does three things: a symptom checker, a few risk calculators (diabetes, heart, stroke), and a weather-driven outbreak forecaster for mosquito-borne disease. Each prediction comes with the reasons behind it.

It is not a doctor. It is a quieter first step.

## The pieces

- `frontend/` &nbsp; the website. Vite, React, Tailwind. Lives on Vercel.
- `backend/` &nbsp; the inference API. FastAPI on Python. Lives on a HuggingFace Space.
- `ml/` &nbsp; training scripts. Run once, locally, to bake the .joblib models the API serves.
- `supabase/` &nbsp; one SQL file. Run it in your Supabase project to set up auth and history.

## Running it locally

You need Python 3.11+ and Node 18+.

```bash
# 1. Train the models, once
cd ml
pip install -r requirements.txt
python scripts/generate_data.py
python scripts/train_all.py

# 2. Move them into the API and start it
cp -r models data ../backend/
cd ../backend
pip install -r requirements.txt
uvicorn app.main:app --port 7860

# 3. Start the frontend
cd ../frontend
cp .env.example .env       # leave Supabase blank to run in demo mode
npm install
npm run dev
```

Open `localhost:5173` and that's the whole thing.

## What I'll need from you to ship it

Four accounts. All free tiers are fine.

### 1. Supabase (database + auth)

1. Create a project at supabase.com.
2. Open the SQL editor. Paste in `supabase/schema.sql` and run it.
3. **Project Settings → API**, grab two values:
   - Project URL `→ VITE_SUPABASE_URL`
   - `anon` `public` key `→ VITE_SUPABASE_ANON_KEY`
4. **Authentication → URL Configuration**: add your Vercel domain to the allow list.
5. (Optional) **Authentication → Providers → Google**: paste in a Google OAuth client ID if you want one-tap sign-in.

If you skip Supabase entirely, the app runs in demo mode. Predictions still work, but history and accounts are off.

### 2. HuggingFace (inference API)

1. New Space, **SDK = Docker**, name it whatever you like.
2. Clone the Space's git repo locally.
3. Copy everything in `backend/` into it (including the populated `models/` and `data/` folders), then push.
4. The first build takes a few minutes. After that, your endpoint is `https://<user>-<space>.hf.space`.
5. That's your `VITE_ML_API_URL`.

If you want zero cold starts, Render or Railway both work for ~$5/month with the same `backend/Dockerfile`. HuggingFace is free but sleeps after a while.

### 3. Vercel (frontend)

1. Import the repo, set **root directory** to `frontend/`.
2. Set three environment variables:
   - `VITE_ML_API_URL` from step 2
   - `VITE_SUPABASE_URL` from step 1
   - `VITE_SUPABASE_ANON_KEY` from step 1
3. Deploy.

### 4. The .env file (local dev)

Inside `frontend/`, your `.env` should look like:

```
VITE_ML_API_URL=http://127.0.0.1:7860
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For demo mode just leave the Supabase lines blank.

## A small note on the models

Each prediction is a soft vote between a Random Forest and a Gradient Boosting classifier. They were trained on synthetic data shaped after the Pima diabetes set, the Cleveland heart set, the Kaggle stroke set, and a curated symptom-disease table. They are good for learning, demos, and intuition. They are not clinical-grade and they should never be the last word.

The training pipeline is reproducible. Run `python scripts/train_all.py` and you get a `summary.json` with the test metrics next to the saved models.

## License

MIT.
