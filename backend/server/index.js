require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const { verifyTransport, sendSchemeReminder } = require("./mailer");

const app = express();
app.use(cors());
app.use(express.json());

const SCHEMES_FILE = path.join(__dirname, "schemes.json");
const REMIND_WITHIN_DAYS = Number(process.env.REMIND_WITHIN_DAYS || 7);

function loadSchemes() {
  return JSON.parse(fs.readFileSync(SCHEMES_FILE, "utf8"));
}

function daysBetween(target) {
  const ms = new Date(target).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

async function checkAndNotify() {
  const schemes = loadSchemes();
  console.log(`\n🔎 Checking ${schemes.length} scheme(s) at ${new Date().toISOString()}`);
  for (const s of schemes) {
    const days = daysBetween(s.deadline);
    if (days >= 0 && days <= REMIND_WITHIN_DAYS) {
      try {
        await sendSchemeReminder(s, days);
      } catch (e) {
        console.error(`❌ Failed for "${s.name}":`, e.message);
      }
    } else {
      console.log(`— Skipped "${s.name}" (deadline in ${days}d)`);
    }
  }
}

// ----- HTTP routes (handy for testing & integration with your React app) -----
app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/schemes", (_req, res) => res.json(loadSchemes()));

// Trigger an immediate check (useful for manual testing)
app.post("/notify/run", async (_req, res) => {
  await checkAndNotify();
  res.json({ ok: true, message: "Notification job ran" });
});

// Send a single test email on demand:  POST /notify/test  { "to": "x@y.com" }
app.post("/notify/test", async (req, res) => {
  try {
    const to = req.body?.to;
    if (!to) return res.status(400).json({ ok: false, error: "Missing 'to'" });
    const dummy = {
      name: "TEST EMAIL — Scheme Notifier",
      description: "If you can read this, your SMTP setup works ✅",
      deadline: new Date(Date.now() + 86400000).toISOString(),
      applyUrl: "https://example.com",
      subscribers: [to],
    };
    await sendSchemeReminder(dummy, 1);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ----- Boot -----
const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await verifyTransport();

  const schedule = process.env.CRON_SCHEDULE || "0 9 * * *";
  cron.schedule(schedule, checkAndNotify);
  console.log(`⏲  Cron scheduled: "${schedule}" (reminder window: ${REMIND_WITHIN_DAYS} days)`);

  // Run once at startup so the dummy scheme triggers immediately
  checkAndNotify();
});
