# Aetheris

Health can be overwhelming, and searching for symptoms online often leads to panic. Aetheris is built to be an alternative: a calm, quiet place to explore your health questions without the noise. 

It carefully looks at three things:
- **Your symptoms:** A gentle checker that explains *why* it thinks you might have a certain condition.
- **Your risks:** Simple calculators for assessing the likelihood of diabetes, heart conditions, or stroke.
- **Your environment:** A weather-driven forecaster looking out for mosquito-borne outbreaks in your area.

It is not a doctor, and it will never replace one. It is simply a quieter first step to help you understand your body.

---

## How it's put together

We split Aetheris into a few manageable pieces so it's easy to read and change:

- `frontend/`: The face of the app (built with Vite, React, and Tailwind).
- `backend/`: The thinking part. A simple Python API that serves our models.
- `ml/`: The learning part. Scripts that teach the models how to predict based on data.
- `supabase/`: The memory. A single file to set up secure accounts and save your history.

## Running Aetheris at home

You're welcome to run this on your own computer. You'll just need Python 3.11+ and Node 18+ installed.

### 1. Teach the models
First, we need to train the models so they know what to look for. Do this once:

```bash
cd ml
pip install -r requirements.txt
python scripts/generate_data.py
python scripts/train_all.py
```

### 2. Start the API
Move the newly trained models to the backend, then wake it up:

```bash
cp -r models data ../backend/
cd ../backend
pip install -r requirements.txt
uvicorn app.main:app --port 7860
```

### 3. Start the interface
Finally, let's start the website itself. 

```bash
cd ../frontend
cp .env.example .env       # Leaving the database blank runs it in a safe, memoryless 'demo mode'
npm install
npm run dev
```

Open `localhost:5173` in your browser. Take a breath. It's ready.

---

## Sharing it with the world

If you want to host Aetheris for others, you'll need three free accounts to bring it to life.

### 1. The Memory (Supabase)
For saving user histories safely:
1. Make a project at [supabase.com](https://supabase.com).
2. In the SQL editor, paste and run the contents of `supabase/schema.sql`.
3. Go to **Project Settings → API** and take note of your **Project URL** (`VITE_SUPABASE_URL`) and **anon public key** (`VITE_SUPABASE_ANON_KEY`).
4. **Authentication → URL Configuration**: Add your website domain to the allow list.
5. (*Optional*) Enable Google in **Authentication → Providers** if you want one-tap sign-in.

*(You can skip this entirely if you just want a demo version that doesn't remember past sessions).*

### 2. The Brain (HuggingFace)
For running our models safely in the cloud:
1. Create a new Space on HuggingFace (choose **Docker** for the SDK).
2. Clone the Space's git repository locally.
3. Copy everything from our `backend/` folder (including the `models/` and `data/` you generated) into your Space, and push.
4. Your endpoint (`VITE_ML_API_URL`) will be `https://<user>-<space>.hf.space`. 

*(If you want zero cold starts instead of HuggingFace's sleep mode, Render or Railway both work beautifully using the same `backend/Dockerfile`).*

### 3. The Face (Vercel)
For hosting the website:
1. Import the repository into Vercel and tell it the root directory is `frontend/`.
2. Give it the links to the Brain and the Memory inside the Environment Variables settings:
   - `VITE_ML_API_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Hit deploy.

---

## A note of care regarding the models

Please remember: the predictions here are based on synthetic data. They are soft votes from Random Forest and Gradient Boosting algorithms, trained on publicly available datasets (like Pima for diabetes, Cleveland for heart conditions). 

They are wonderful for learning, for intuition, and for getting a general sense of things. **They are not clinical-grade.** They should never be the last word. Use Aetheris to ask questions, but rely on human doctors for answers. 

The training pipeline is fully transparent. Run `python scripts/train_all.py` at any time to see a `summary.json` of the test metrics next to the saved models.

## License

Released under the [MIT License](LICENSE). Feel free to use and adapt it kindly.
