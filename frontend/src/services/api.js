/**
 * Frontend API Service (FastAPI bridge)
 * =====================================
 * Thin client for the local FastAPI backend. UI components stay unchanged —
 * they import these helpers and call them on existing button handlers.
 *
 * Backend must be running locally at http://localhost:8000
 *   cd backend && uvicorn main:app --reload --port 8000
 */

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_BACKEND_URL) ||
  "http://localhost:8000";

async function _json(response) {
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Request failed: ${response.status} ${text}`);
  }
  return response.json();
}

/* -------------------------- Notifications ------------------------------ */

/**
 * Fetch deadline notifications for a given user.
 * @param {string} [userEmail]
 * @param {('en'|'kn')} [lang='en']
 */
export async function fetchNotifications(userEmail, lang = "en") {
  const url = new URL(`${API_BASE_URL}/notifications`);
  if (userEmail) url.searchParams.set("user_email", userEmail);
  if (lang) url.searchParams.set("lang", lang);
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return _json(response);
}

/* ----------------------------- Profile --------------------------------- */

/**
 * Save a profile to backend/database/profiles.json.
 * Accepts Kannada values for occupation/category — backend stores both
 * the original and translated English form automatically.
 * @param {object} profile
 */
export async function saveProfile(profile) {
  const response = await fetch(`${API_BASE_URL}/save-profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  return _json(response);
}

/**
 * Load the saved profile (most recent if no email is supplied).
 * @param {string} [email]
 */
export async function getProfile(email) {
  const url = new URL(`${API_BASE_URL}/get-profile`);
  if (email) url.searchParams.set("email", email);
  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return _json(response);
}

/* --------------------------- Recommendations --------------------------- */

/**
 * Get scheme recommendations. The query may be in Kannada — the backend
 * translates Kannada keywords to English before invoking the unmodified
 * ml_pipeline. When the query is Kannada, results include `title_kn`.
 *
 * @param {{query?: string, profile?: object, mode?: 'nlp'|'form', top_k?: number}} args
 */
export async function recommendSchemes({ query, profile, mode = "form", top_k = 10, language = "en" } = {}) {
  const response = await fetch(`${API_BASE_URL}/recommend-schemes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, profile, mode, top_k, language }),
  });
  return _json(response);
}

export default { fetchNotifications, saveProfile, getProfile, recommendSchemes };
