import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_ADDRESS = "YojanaMitra AI <notify@yojanamitra.app>";
const DASHBOARD_URL = "https://yojanamitra.app/dashboard?tab=saved";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatDeadline = (raw: string): string => {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${dd} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

const daysUntil = (raw: string): number => {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return NaN;
  const today = new Date();
  const a = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const b = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.round((b - a) / 86400000);
};

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const buildEmailHtml = (schemes: Array<{ name: string; deadline: string }>) => {
  const cards = schemes
    .map(
      (s) => `
        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:12px 0;background:#ffffff;">
          <div style="font-weight:bold;font-size:16px;color:#111827;margin-bottom:6px;">${escapeHtml(s.name)}</div>
          <div style="font-size:14px;color:#374151;margin-bottom:6px;">Deadline: <strong>${escapeHtml(formatDeadline(s.deadline))}</strong></div>
          <div style="font-size:13px;color:#b91c1c;">This scheme deadline is in 3 days. Don't miss it!</div>
        </div>`
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;">
    <div style="background:#FF9933;color:#ffffff;padding:20px 24px;text-align:center;">
      <div style="font-size:22px;font-weight:bold;">YojanaMitra AI</div>
      <div style="font-size:13px;margin-top:4px;opacity:0.95;">ಯೋಜನಾ ಮಿತ್ರ | Your Scheme Assistant</div>
    </div>
    <div style="padding:20px 24px;color:#111827;">
      <p style="font-size:15px;margin:0 0 12px;">You have ${schemes.length} saved scheme${schemes.length === 1 ? "" : "s"} with a deadline approaching in 3 days:</p>
      ${cards}
      <div style="text-align:center;margin:24px 0;">
        <a href="${DASHBOARD_URL}" style="background:#138808;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;display:inline-block;">View Saved Schemes</a>
      </div>
    </div>
    <div style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:11px;color:#6b7280;text-align:center;">
      You are receiving this because you enabled deadline alerts in your YojanaMitra profile.
      To unsubscribe, go to Dashboard → Profile and disable email notifications.
    </div>
  </div>
</body>
</html>`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profiles, error: profilesErr } = await supabase
      .from("user_profiles")
      .select("user_id, notification_email, email_notifications_enabled")
      .eq("email_notifications_enabled", true);

    if (profilesErr) throw profilesErr;
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0, sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    let failed = 0;

    for (const profile of profiles) {
      try {
        const { data: saved, error: savedErr } = await supabase
          .from("saved_schemes")
          .select("schemes(scheme_name, deadline)")
          .eq("user_id", profile.user_id);

        if (savedErr) {
          console.error(`saved_schemes fetch failed for user ${profile.user_id}:`, savedErr);
          failed += 1;
          continue;
        }

        const dueIn3: Array<{ name: string; deadline: string }> = [];
        for (const row of saved ?? []) {
          const sch: any = (row as any).schemes;
          if (!sch || !sch.deadline) continue;
          if (daysUntil(sch.deadline) === 3) {
            dueIn3.push({ name: sch.scheme_name, deadline: sch.deadline });
          }
        }

        if (dueIn3.length === 0) continue;

        // Resolve recipient email
        let recipient = (profile.notification_email ?? "").trim();
        if (!recipient) {
          const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(profile.user_id);
          if (userErr || !userData?.user?.email) {
            console.error(`Could not resolve email for user ${profile.user_id}`, userErr);
            failed += 1;
            continue;
          }
          recipient = userData.user.email;
        }

        const html = buildEmailHtml(dueIn3);
        const subject = dueIn3.length === 1
          ? `Reminder: "${dueIn3[0].name}" deadline in 3 days`
          : `Reminder: ${dueIn3.length} scheme deadlines in 3 days`;

        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_ADDRESS,
            to: [recipient],
            subject,
            html,
          }),
        });

        if (!resp.ok) {
          const txt = await resp.text();
          console.error(`Resend send failed for ${recipient}: ${resp.status} ${txt}`);
          failed += 1;
          continue;
        }

        sent += 1;
        console.log(`Sent deadline reminder to ${recipient} for ${dueIn3.length} scheme(s)`);
      } catch (perUserErr) {
        failed += 1;
        console.error(`Unexpected error for user ${profile.user_id}:`, perUserErr);
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: profiles.length, sent, failed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-deadline-emails fatal error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
