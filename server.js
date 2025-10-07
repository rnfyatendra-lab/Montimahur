const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PUBLIC_DIR = path.join(__dirname, "public");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: "bulkmail_secret",
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(PUBLIC_DIR));

// Root → Login
app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "login.html"));
});

// ✅ Fixed login credentials
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "Nikkilodhi" && password === "Lodhi882@#") {
    req.session.user = username;
    return res.json({ success: true });
  }
  return res.json({ success: false, message: "❌ Invalid credentials" });
});

// Launcher
app.get("/launcher", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.sendFile(path.join(PUBLIC_DIR, "launcher.html"));
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// 🚀 Bulk Mail Sending (super fast, inbox-friendly)
app.post("/send-mail", async (req, res) => {
  try {
    const { senderName, senderEmail, appPassword, subject, message, recipients } = req.body;

    let recipientList = recipients
      .split(/[\n,;,\s]+/)
      .map(r => r.trim())
      .filter(r => r);

    if (recipientList.length === 0) {
      return res.json({ success: false, message: "❌ Mail Not Sent" });
    }

    // Gmail transporter with App Password
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: senderEmail, pass: appPassword }
    });

    // Anti-spam headers improve inbox chance
    const msgs = recipientList.map(recipient => ({
      from: `"${senderName}" <${senderEmail}>`,
      to: recipient,
      subject,
      text: message,
      headers: {
        "X-Mailer": "BulkMailer-Node",
        "List-Unsubscribe": `<mailto:${senderEmail}>`
      }
    }));

    // ✅ Send all mails in parallel (≈0.3–0.5s for 30 mails)
    const results = await Promise.allSettled(msgs.map(msg => transporter.sendMail(msg)));

    const successCount = results.filter(r => r.status === "fulfilled").length;

    if (successCount > 0) {
      return res.json({ success: true, message: "✅ Mail Sent Successfully" });
    } else {
      return res.json({ success: false, message: "❌ Mail Not Sent" });
    }
  } catch (err) {
    console.error("Bulk send error:", err.message);
    return res.json({ success: false, message: "❌ Mail Not Sent" });
  }
});

// Fallback → Always show login
app.get("*", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "login.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bulk Mailer running on port ${PORT}`));
