const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const sgMail = require("@sendgrid/mail");
const path = require("path");

const app = express();
const PUBLIC_DIR = path.resolve("public");

// ✅ Put your SendGrid API key in Render Env Variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: "bulkmail_secret",
  resave: false,
  saveUninitialized: false
}));

app.use(express.static(PUBLIC_DIR));

app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "login.html"));
});

// ✅ Login check
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const AUTH_USER = "Lodhiyatendra";
  const AUTH_PASS = "lodhi882@#";

  if (username === AUTH_USER && password === AUTH_PASS) {
    req.session.user = username;
    return res.json({ success: true });
  }
  return res.json({ success: false, message: "❌ Invalid credentials" });
});

// ✅ Launcher page
app.get("/launcher", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.sendFile(path.join(PUBLIC_DIR, "launcher.html"));
});

// ✅ Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// ✅ Ultra Fast Bulk Mail with SendGrid API
app.post("/send-mail", async (req, res) => {
  try {
    const { senderName, senderEmail, subject, message, recipients } = req.body;

    let recipientList = recipients
      .split(/[\n,;,\s]+/)
      .map(r => r.trim())
      .filter(r => r.length > 0);

    if (recipientList.length === 0) {
      return res.json({ success: false, message: "❌ No valid recipients" });
    }

    // Template clean (remove only starting spaces)
    const cleanMessage = message.replace(/^\s+/, "");

    // Prepare SendGrid messages
    const msgs = recipientList.map(recipient => ({
      to: recipient,
      from: { email: senderEmail, name: senderName },
      subject,
      text: cleanMessage,
      html: `<div style="font-family: Arial; line-height:1.5; white-space:pre-wrap;">
               ${cleanMessage.replace(/\n/g, "<br>")}
             </div>`
    }));

    // ✅ Ultra fast send (all in parallel)
    await sgMail.send(msgs, { batch: true, throwErrors: true });

    return res.json({ success: true, message: `✅ ${recipientList.length} mails sent in <1 second 🚀` });
  } catch (err) {
    console.error("Mail Error:", err);
    return res.json({ success: false, message: "❌ " + err.message });
  }
});

// Fallback → login page
app.get("*", (req, res) => res.sendFile(path.join(PUBLIC_DIR, "login.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Ultra Fast Mailer running on port ${PORT}`));
