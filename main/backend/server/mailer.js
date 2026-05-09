const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE) === "true", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function verifyTransport() {
  try {
    await transporter.verify();
    console.log("✅ SMTP transport ready");
  } catch (err) {
    console.error("❌ SMTP verify failed:", err.message);
  }
}

function buildSchemeEmail(scheme, daysLeft) {
  const subject = `⏰ Reminder: "${scheme.name}" deadline in ${daysLeft} day(s)`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px">
      <h2 style="color:#1a73e8;margin-top:0">${scheme.name}</h2>
      <p style="color:#444">${scheme.description}</p>
      <p><strong>Deadline:</strong> ${new Date(scheme.deadline).toDateString()}</p>
      <p><strong>Days remaining:</strong> ${daysLeft}</p>
      <a href="${scheme.applyUrl}"
         style="display:inline-block;background:#1a73e8;color:#fff;
                padding:10px 18px;border-radius:6px;text-decoration:none;margin-top:12px">
        Apply now
      </a>
      <hr style="margin:24px 0;border:none;border-top:1px solid #eee" />
      <small style="color:#888">You are receiving this because you subscribed to scheme alerts.</small>
    </div>`;
  const text = `${scheme.name}\n\n${scheme.description}\n\nDeadline: ${scheme.deadline}\nDays remaining: ${daysLeft}\nApply: ${scheme.applyUrl}`;
  return { subject, html, text };
}

async function sendSchemeReminder(scheme, daysLeft) {
  const { subject, html, text } = buildSchemeEmail(scheme, daysLeft);
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: scheme.subscribers.join(","),
    subject,
    html,
    text,
  });
  console.log(`📧 Sent "${scheme.name}" → ${scheme.subscribers.join(", ")} | id=${info.messageId}`);
  return info;
}

module.exports = { transporter, verifyTransport, sendSchemeReminder, buildSchemeEmail };
