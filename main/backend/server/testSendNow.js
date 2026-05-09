// Quick CLI test: `node testSendNow.js you@example.com`
require("dotenv").config();
const { verifyTransport, sendSchemeReminder } = require("./mailer");

(async () => {
  const to = process.argv[2];
  if (!to) {
    console.error("Usage: node testSendNow.js <recipient-email>");
    process.exit(1);
  }
  await verifyTransport();
  await sendSchemeReminder(
    {
      name: "TEST — Scheme Notifier",
      description: "SMTP test email from your Node server.",
      deadline: new Date(Date.now() + 2 * 86400000).toISOString(),
      applyUrl: "https://example.com",
      subscribers: [to],
    },
    2
  );
  process.exit(0);
})();
