# YojanaMitraAI Patch — Kannada Search & Profile Save Fix

This patch keeps the **frontend UI**, **backend folder structure**, and **ml_pipeline** unchanged.
Only logic inside existing controllers/services was modified, plus two new dataset files.

## Files added
- `dataset/schemes_multilingual.json` — 55 schemes with `title_en` / `title_kn` etc. (6+ deadlines within next 7 days)
- `dataset/translation_kn_en.json` — Kannada → English keyword dictionary
- `backend/services/translation_service.py` — Pure-stdlib KN→EN translator (used by recommendation + profile)

## Files modified (logic only — no structural changes)
- `backend/models/user_model.py` — `email` is now optional; added `occupation_original/_en` & `category_original/_en`
- `backend/controllers/profile_controller.py` — Auto-creates `profiles.json`, accepts profiles without email, normalizes Kannada occupation/category
- `backend/services/recommendation_service.py` — Translates Kannada query/profile to English BEFORE ml_pipeline (pipeline itself unchanged), enriches results with `title_kn`
- `backend/services/notification_service.py` — Adds `lang=kn` mode (Kannada titles + Kannada deadline messages); demo fallback surfaces all schemes with deadlines ≤ 7 days
- `backend/controllers/notification_controller.py` + `backend/routes/notification_routes.py` — Pass-through `lang` query parameter
- `frontend/src/services/api.js` — Added `saveProfile`, `getProfile`, `recommendSchemes`; `fetchNotifications` now accepts `lang`

## How to run locally
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Frontend: existing Vite dev server. Set `VITE_BACKEND_URL=http://localhost:8000` if needed.

## Wiring the Profile Save button (one-line change in your existing component)
In whichever existing Profile component owns the Save button, import and call:
```js
import { saveProfile, getProfile } from "@/services/api"; // path may differ in your repo

// On mount:
useEffect(() => { getProfile().then(setProfile).catch(() => {}); }, []);

// On click:
const onSave = async () => { await saveProfile(profile); };
```
No JSX, layout, or styling changes are needed.

## Kannada search example
- User types: `ವಿದ್ಯಾರ್ಥಿವೇತನ`
- Backend translates to: `scholarship`
- ml_pipeline (untouched) ranks scholarship schemes
- Response includes `title_kn` and `display_title` in Kannada
- For deadline alerts, call `GET /notifications?lang=kn` to receive:
  `ಅಂತಿಮ ದಿನಾಂಕ ಸಮೀಪಿಸುತ್ತಿದೆ: ಪೋಸ್ಟ್ ಮೆಟ್ರಿಕ್ ವಿದ್ಯಾರ್ಥಿವೇತನ (2 ದಿನಗಳಲ್ಲಿ)`

## Profile storage
`backend/database/profiles.json` is auto-created on first save. Schema:
```json
[
  {
    "name": "Demo User", "age": 21, "gender": "Female",
    "income": 200000, "state": "Karnataka", "district": "Bangalore",
    "occupation": "student", "occupation_original": "ವಿದ್ಯಾರ್ಥಿ", "occupation_en": "student",
    "category": "SC"
  }
]
```
