# YojanaMitraAI – Backend (FastAPI, Local)

Standalone **FastAPI** service exposing authentication, profile
management, deadline notifications, and ML-powered scheme recommendations.
Runs entirely locally with **JSON file storage** — no Supabase / no cloud
DB required for these endpoints.

> The deployed React app continues to use Supabase. This backend is
> provided as **academic source code** to demonstrate the same flows
> running fully offline. Run it with `uvicorn` and call it from your
> own scripts, Postman, or a local frontend build.

---

## 1. Folder Structure

```
backend/
├── main.py                          # FastAPI app entry point
├── requirements.txt
├── README.md                        # (this file)
│
├── routes/
│   ├── auth_routes.py               # /signup, /login
│   ├── profile_routes.py            # /save-profile, /get-profile
│   ├── notification_routes.py       # /notifications
│   └── recommend_routes.py          # /recommend-schemes
│
├── controllers/
│   ├── auth_controller.py
│   ├── profile_controller.py
│   ├── notification_controller.py
│   └── recommend_controller.py
│
├── services/
│   ├── notification_service.py      # deadline detection logic
│   └── recommendation_service.py    # bridge to ml_pipeline
│
├── models/
│   └── user_model.py                # Pydantic schemas
│
├── database/
│   ├── users.json                   # name + email + bcrypt-style hash
│   ├── profiles.json                # per-user profile records
│   └── saved_schemes.json           # per-user saved schemes
│
└── utils/
    └── password_hasher.py           # PBKDF2-SHA256 (stdlib only)
```

Companion folders (unchanged):

```
dataset/schemes.json                 # 527 real schemes
ml_pipeline/                         # ML recommendation engine — UNCHANGED
```

---

## 2. Run locally

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Open: http://localhost:8000  →  lists all endpoints.
Interactive docs: http://localhost:8000/docs

---

## 3. API endpoints

| Method | Path                | Purpose                                     |
|--------|---------------------|---------------------------------------------|
| POST   | `/signup`           | Create a new local user (PBKDF2 hashed)     |
| POST   | `/login`            | Verify credentials                          |
| POST   | `/save-profile`     | Insert/update a profile in `profiles.json`  |
| GET    | `/get-profile`      | Fetch a profile by `?email=...`             |
| GET    | `/notifications`    | Deadline alerts for saved schemes           |
| POST   | `/recommend-schemes`| Run the ML pipeline and return top-K        |

### Authentication flow

1. Frontend (or curl) `POST /signup` with `{ name, email, password }`.
2. Controller hashes the password using `pbkdf2_sha256$120000$…` and
   appends a record to `database/users.json`.
3. `POST /login` looks up the email, verifies with constant-time
   comparison, and returns `{ success, user: { name, email } }`.

```bash
curl -X POST http://localhost:8000/signup \
  -H 'Content-Type: application/json' \
  -d '{"name":"Demo","email":"demo@x.com","password":"Demo@123"}'

curl -X POST http://localhost:8000/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@x.com","password":"Demo@123"}'
```

### Profile save / load flow

`POST /save-profile` accepts:

```json
{
  "email": "demo@yojanamitra.ai",
  "name": "Demo User",
  "age": 24, "gender": "female",
  "income": 180000,
  "state": "Karnataka", "district": "Bengaluru Urban",
  "occupation": "student", "category": "OBC",
  "education_level": "graduate"
}
```

The controller upserts on `email` (case-insensitive). `GET /get-profile?email=...`
returns the same record or `404`.

### Notification alert logic

Implemented in `services/notification_service.py`:

1. Load schemes catalog from `dataset/schemes.json` (falls back to
   `ml_pipeline/dataset/schemes_sample.json`).
2. Load saved schemes from `database/saved_schemes.json`.
3. For each saved scheme resolve a `YYYY-MM-DD` deadline (record
   override → catalog lookup).
4. Compute `days_remaining = deadline − today`.
5. Classify: `expired (<0)`, `today (=0)`, `upcoming (1–7)`, `far (>7)`.
6. Emit a sorted alert list (expired → today → upcoming → far).

```bash
curl "http://localhost:8000/notifications?user_email=demo@yojanamitra.ai"
```

### ML recommendation flow

`POST /recommend-schemes` body:

```json
{ "query": "I am a 24 year old female student in Karnataka",
  "profile": null, "mode": "nlp", "top_k": 5 }
```

`services/recommendation_service.py` lazily instantiates
`ml_pipeline.recommendation_pipeline.RecommendationPipeline`, indexes
all 527 schemes from `dataset/schemes.json`, and returns:

```json
{
  "recommendations": [
    {
      "scheme_name": "National Scholarship Portal - Post Matric",
      "match_percentage": 78.5,
      "eligibility_status": "eligible",
      "missing_criteria": [],
      "explanation": "...",
      "gap_analysis": { ... }
    }
  ],
  "count": 5,
  "mode": "nlp"
}
```

The `ml_pipeline/` package is **not** modified by this backend.

---

## 4. Dataset loading process

| File                                   | Used by                          |
|----------------------------------------|----------------------------------|
| `dataset/schemes.json` (527 entries)   | notifications + recommendations  |
| `ml_pipeline/dataset/schemes_sample.json` | fallback if main file missing  |
| `backend/database/users.json`          | auth                             |
| `backend/database/profiles.json`       | profile save/load                |
| `backend/database/saved_schemes.json`  | deadline alerts                  |

All reads/writes use plain `json.load` / `json.dump` for full academic
visibility — no ORM, no migration tool.

---

## 5. Security note (academic scope)

- Passwords are hashed with **PBKDF2-SHA256, 120 000 iterations, 16-byte
  random salt** (Python stdlib only — no extra dependency).
- No JWT / no session cookies — clients are expected to remember the
  returned `user.email` and pass it on subsequent profile calls.
- This backend is intended for local demonstration; for production
  deployment use a real database and signed session tokens.

---

## 6. Verified behavior

Smoke-tested in-process via `fastapi.testclient.TestClient`:

```
ROOT          → 200 OK, lists all 6 endpoints
SIGNUP        → 200 OK
SIGNUP (dup)  → 409 Conflict
LOGIN (ok)    → 200 OK
LOGIN (bad)   → 401 Unauthorized
SAVE-PROFILE  → 200 OK, persisted to profiles.json
GET-PROFILE   → 200 OK, returns saved record
NOTIFICATIONS → 4 alerts for demo@yojanamitra.ai
RECOMMEND     → 3 ranked schemes via ml_pipeline (527 indexed)
```
