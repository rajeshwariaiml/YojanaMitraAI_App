# YojanaMitraAI

> AI-powered, multilingual government scheme recommendation platform for Indian citizens.

YojanaMitraAI helps users discover the **right government welfare schemes** for their personal situation through natural-language queries (English & ಕನ್ನಡ Kannada), voice input, structured profiles, and a custom ML recommendation pipeline running over **527 real Indian schemes**.

---

## Features

- **Bilingual NLP** — Type or speak in **English** or **Kannada** (Web Speech API, `en-IN` / `kn-IN`).
- **ML Recommendation Pipeline** — Rule-based filtering + semantic similarity + eligibility scoring + explainability.
- **User profiles** — Save age, income, state, occupation, category, education, and get personalized matches.
- **Deadline notifications** — Email + in-app alerts for upcoming scheme deadlines (`expired / today / upcoming / far`).
- **Authentication** — Local PBKDF2-SHA256 backend or hosted Supabase auth.
- **Modern UI** — React 18 + Vite + Tailwind + shadcn/ui, fully responsive.
- **Tested** — Vitest unit tests + FastAPI TestClient smoke tests.

---

## Project Structure

```
YojanaMitraAI/
├── src/                       # React frontend
│   ├── components/            # Navbar, PromptInput, SchemeCard, NotifyButton, …
│   ├── pages/                 # Index, Login, Signup, Dashboard, FindSchemes, AdminPanel
│   ├── context/               # Auth & language context
│   ├── i18n/                  # English + Kannada translations
│   ├── integrations/          # Supabase client
│   └── hooks/ · utils/ · lib/
│
├── backend/                   # FastAPI (local, JSON storage)
│   ├── main.py
│   ├── routes/ · controllers/ · services/ · models/
│   └── database/              # users.json · profiles.json · saved_schemes.json
│
├── ml_pipeline/               # ML recommendation engine
│   ├── recommendation_pipeline.py
│   ├── rule_based_filter.py
│   ├── semantic_similarity_search.py
│   ├── eligibility_score_calculator.py
│   ├── eligibility_gap_analyzer.py
│   ├── explainability_engine.py
│   ├── nlp_entity_extractor.py
│   └── scheme_ranker.py
│
├── dataset/
│   ├── schemes.json                 # 527 real schemes
│   ├── schemes_multilingual.json
│   └── translation_kn_en.json
│
├── scripts/                   # Dataset generation utilities
├── supabase/                  # Hosted backend config
└── public/                    # Static assets (logo, robots.txt)
```

---

## Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.10 (for backend + ML)
- npm / pnpm / bun

### 1. Clone

```bash
git clone https://github.com/rajeshwariaiml/YojanaMitraAI_App.git
cd YojanaMitraAI
```

### 2. Frontend

```bash
npm install
npm run dev          # http://localhost:5173
```

### 3. Backend (optional — local FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Docs: http://localhost:8000/docs
```

### 4. Environment variables

Create `.env` at the project root:

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_API_BASE_URL=http://localhost:8000   # if using local backend
```

---

## Backend API

| Method | Endpoint              | Purpose                                  |
|--------|----------------------|------------------------------------------|
| POST   | `/signup`            | Register a new user (PBKDF2 hashed)      |
| POST   | `/login`             | Verify credentials                       |
| POST   | `/save-profile`      | Upsert user profile                      |
| GET    | `/get-profile`       | Fetch profile by `?email=…`              |
| GET    | `/notifications`     | Deadline alerts for saved schemes        |
| POST   | `/recommend-schemes` | Run ML pipeline → top-K recommendations  |

**Example:**

```bash
curl -X POST http://localhost:8000/recommend-schemes \
  -H 'Content-Type: application/json' \
  -d '{"query":"I am a 24 year old female student in Karnataka","mode":"nlp","top_k":5}'
```

---

## ML Pipeline

The recommendation engine combines:

1. **NLP Entity Extraction** — pulls age, gender, state, income, occupation, category from free-form queries.
2. **Rule-Based Filter** — hard eligibility constraints (state, age range, category).
3. **Semantic Similarity Search** — embeddings to match query intent with scheme descriptions.
4. **Eligibility Score Calculator** — weighted match percentage per scheme.
5. **Gap Analyzer** — identifies missing criteria (e.g. "income proof needed").
6. **Explainability Engine** — human-readable reasoning per recommendation.
7. **Scheme Ranker** — produces final ordered top-K list.

All 527 schemes are indexed at startup; queries return in < 500 ms on a laptop CPU.

---

## Voice Feature

- Browser-native **Web Speech API** (`SpeechRecognition` / `webkitSpeechRecognition`).
- Auto-switches between `en-IN` and `kn-IN` based on UI language.
- Graceful fallback alert on unsupported browsers (Firefox, older Safari).
- Improves accessibility for low-literacy, elderly, and visually-impaired users.

---

## Email Notifications

Daily cron job + on-demand `/notify/run` endpoint sends Gmail SMTP reminders for schemes whose deadlines fall within 7 days. See `backend/services/notification_service.py`.

---

## Tech Stack

**Frontend:** React 18 · TypeScript 5 · Vite 7 · Tailwind CSS 3 · shadcn/ui · Radix UI · React Router 6 · TanStack Query · React Hook Form · Zod · Recharts · Sonner

**Backend:** FastAPI · Uvicorn · Pydantic · PBKDF2-SHA256 (stdlib)

**ML:** scikit-learn · sentence-transformers · NumPy · custom rule engine

**Storage:** JSON files (local) · Supabase Postgres (hosted)

**i18n:** Custom React context (English + Kannada)

---

## Available Scripts

| Command             | Description                          |
|---------------------|--------------------------------------|
| `npm run dev`       | Start Vite dev server                |
| `npm run build`     | Production build                     |
| `npm run build:dev` | Development-mode build               |
| `npm run preview`   | Preview production build             |
| `npm run lint`      | Run ESLint                           |
| `npm run test`      | Run Vitest test suite                |

---Link to view Project(deployed):https://yojanamitraai.netlify.app/
