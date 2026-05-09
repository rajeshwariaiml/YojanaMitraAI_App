/**
 * Frontend API Service (FastAPI bridge)
 * =====================================
 * Thin client for the local FastAPI backend. The existing notification
 * panel UI in the React app remains unchanged — it can import
 * `fetchNotifications` from this file to populate alerts.
 *
 * Backend must be running locally at http://localhost:8000
 *   cd backend && uvicorn main:app --reload --port 8000
 */

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_BACKEND_URL) ||
  "http://localhost:8000";

/**
 * Fetch deadline notifications for a given user.
 * @param {string} [userEmail] - optional email; if omitted, returns alerts for all demo users
 * @returns {Promise<Array<{
 *   scheme_name: string,
 *   deadline: string,
 *   status: 'upcoming' | 'expired' | 'today' | 'far',
 *   days_remaining: number,
 *   message: string,
 *   user_email: string
 * }>>}
 */
export async function fetchNotifications(userEmail) {
  const url = new URL(`${API_BASE_URL}/notifications`);
  if (userEmail) url.searchParams.set("user_email", userEmail);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Notifications request failed: ${response.status}`);
  }
  return response.json();
}

export default { fetchNotifications };
