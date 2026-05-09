import { useState } from "react";

const API_URL = import.meta.env.VITE_NOTIFIER_URL ?? "http://localhost:4000";

export default function NotifyButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`${API_URL}/notify/run`, { method: "POST" });
      const data = await res.json();
      setMsg(data.ok ? "✅ Notification job triggered" : "❌ Failed");
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={run}
        disabled={loading}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send scheme reminders now"}
      </button>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
    </div>
  );
}
