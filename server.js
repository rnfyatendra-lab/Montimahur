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

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "Lodhiyatendra" && password === "lodhi882@#") {
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

// Send Mail (bulk fixed with try/catch per recipient)
app.post("/send-mail", async (req, res) => {
  try {
    const { senderName, senderEmail, appPassword, subject, message, recipients } = req.body;

    let recipientList = recipients
      .split(/[\n,;,\s]+/)
      .map(r => r.trim())
      .filter(r => r);

    if (recipientList.length === 0) {
      return res.json({ success: false, message: "❌ No valid recipients" });
    }

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: senderEmail, pass: appPassword }
    });

    let successCount = 0;
    let failCount = 0;

    for (let recipient of recipientList) {
      try {
        await transporter.sendMail({
          from: `"${senderName}" <${senderEmail}>`,
          to: recipient,
          subject,
          text: message
        });
        successCount++;
      } catch (err) {
        console.error(`Failed for ${recipient}:`, err.message);
        failCount++;
      }
    }

    if (successCount > 0) {
      return res.json({ success: true, message: `✅ Sent: ${successCount}, ❌ Failed: ${failCount}` });
    } else {
      return res.json({ success: false, message: "❌ Mail Not Sent to any recipient" });
    }
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

// Fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "login.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Bulk Mailer running on port ${PORT}`));
