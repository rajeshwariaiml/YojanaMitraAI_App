# YojanaMitraAI

> AI-powered, multilingual government scheme recommendation platform for Indian citizens.

YojanaMitraAI helps users discover the **right government welfare schemes** for their personal situation through natural-language queries in **English** and **Kannada**, voice input, structured profiles, and a custom ML recommendation pipeline running over **527 real Indian schemes**. :contentReference[oaicite:0]{index=0}

---

## Features

- **Bilingual NLP** — Type or speak in **English** or **Kannada** using the Web Speech API (`en-IN` / `kn-IN`)
- **ML Recommendation Pipeline** — Rule-based filtering + semantic similarity + eligibility scoring + explainability
- **User Profiles** — Save age, income, state, occupation, category, education, and receive personalized recommendations
- **Deadline Notifications** — Email + in-app alerts for upcoming scheme deadlines (`expired / today / upcoming / far`)
- **Authentication** — Local PBKDF2-SHA256 backend or hosted Supabase authentication
- **Modern UI** — React 18 + Vite + Tailwind + shadcn/ui
- **Responsive Design** — Optimized for desktop and mobile devices
- **Testing Support** — Vitest frontend tests + FastAPI TestClient backend smoke tests

---

## Project Structure. 

```text
YojanaMitraAI/
├── src/                         # React frontend
│   ├── components/              # Navbar, PromptInput, SchemeCard, NotifyButton
│   ├── pages/                   # Index, Login, Signup, Dashboard, FindSchemes, AdminPanel
│   ├── context/                 # Auth & language context
│   ├── i18n/                    # English + Kannada translations
│   ├── integrations/            # Supabase client
│   └── hooks/ · utils/ · lib/
│
├── backend/                     # FastAPI backend + notification server
│   ├── controllers/
│   ├── database/
│   ├── models/
│   ├── routes/
│   ├── server/                  # Node.js email notification server
│   ├── services/
│   ├── utils/
│   ├── main.py
│   ├── README.md
│   └── requirements.txt
│
├── ml_pipeline/                 # ML recommendation engine
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
│   ├── schemes.json             # 527 real schemes
│   ├── schemes_multilingual.json
│   └── translation_kn_en.json
│
├── scripts/                     # Dataset generation utilities
├── supabase/                    # Hosted backend config
└── public/                      # Static assets
```
## Quick Start

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.10
- npm / pnpm / bun

---

## 1. Clone the Repository

```bash
git clone https://github.com/rajeshwariaiml/YojanaMitraAI_App.git
cd 

YojanaMitraAI_App
```

## 2. Frontend Setup

```bash
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## 3. Backend Setup (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend docs:

```text
http://localhost:8000/docs
```

## 4. Environment Variables

Create a `.env` file at the project root:

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_API_BASE_URL=http://localhost:8000
```

---

# Email Notification Server

The project also includes a Node.js notification server for sending email reminders about scheme deadlines. The server runs from `backend/server`, uses Gmail SMTP, and performs a startup test check.

## Steps to Run

### Open a terminal and navigate to the server folder:

```bash
cd "backend/server"
```

### Install dependencies:

```bash
npm install
```

### Copy `.env.example` and rename it to `.env`

### Set your Gmail address in `SMTP_USER`

### For `SMTP_PASS`, create a Gmail App Password:

- Go to Google Account
- Open Security
- Enable 2-Step Verification
- Create an App Password
- Paste the 16-character code into `.env`

### Start the notification server:

```bash
npm run dev
```

It runs on port `4000`.

### In a second terminal, go back to the project root and start the frontend:

```bash
npm run dev
```
---

# ML Pipeline

The recommendation engine combines:

1. NLP Entity Extraction — extracts age, gender, state, income, occupation, category
2. Rule-Based Filter — applies hard eligibility constraints
3. Semantic Similarity Search — matches query intent with scheme descriptions
4. Eligibility Score Calculator — computes weighted match percentage
5. Gap Analyzer — identifies missing requirements
6. Explainability Engine — generates human-readable reasons
7. Scheme Ranker — returns the final ordered top-K list

All 527 schemes are indexed at startup for fast query response.

---

# Voice Feature

- Uses browser-native Web Speech API
- Automatically switches between `en-IN` and `kn-IN`
- Includes fallback handling for unsupported browsers
- Improves accessibility for low-literacy, elderly, and visually-impaired users

---

# Tech Stack

- Frontend: React 18, TypeScript 5, Vite 7, Tailwind CSS 3, shadcn/ui, Radix UI, React Router 6, TanStack Query, React Hook Form, Zod, Recharts
, Sonner
- Backend: FastAPI, Uvicorn, Pydantic, PBKDF2-SHA256
- ML: scikit-learn, sentence-transformers, NumPy
- Storage: JSON files, Supabase
- i18n: Custom React context (English + Kannada)

---

# Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run build:dev` | Development-mode build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest test suite |

---
