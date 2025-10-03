const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

app.use(session({
  secret: "bulkmail_secret",
  resave: false,
  saveUninitialized: false
}));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Root route → login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ✅ Login (updated credentials)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const AUTH_USER = "Lodhiyatendra";
  const AUTH_PASS = "lodhi882@#";

  if (username === AUTH_USER && password === AUTH_PASS) {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

// ✅ Launcher
app.get("/launcher", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.sendFile(path.join(__dirname, "public", "launcher.html"));
});

// ✅ Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// ✅ Utility: Delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ✅ Bulk Mail Sender (one by one with delay)
app.post("/send-mail", async (req, res) => {
  try {
    const { senderName, senderEmail, appPassword, subject, message, recipients } = req.body;

    if (!senderName || !senderEmail || !appPassword || !subject || !message || !recipients) {
      return res.json({ success: false, message: "⚠️ Please fill all fields before sending." });
    }

    let recipientList = recipients
      .split(/[\n,;,\s]+/)
      .map(r => r.trim())
      .filter(r => r.length > 0);

    if (recipientList.length === 0) {
      return res.json({ success: false, message: "❌ No valid recipient emails found." });
    }

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: appPassword
      }
    });

    // ✅ Send mail one by one with 5 sec delay
    for (let i = 0; i < recipientList.length; i++) {
      let mailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        to: recipientList[i], // individual send
        subject,
        text: message,
        html: `<pre style="font-family: Arial; white-space: pre-wrap;">${message}</pre>`
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Sent to ${recipientList[i]}`);

      // Wait 5 seconds before next mail
      if (i < recipientList.length - 1) {
        await delay(5000);
      }
    }

    res.json({ success: true, message: `✅ ${recipientList.length} mails sent successfully with delay!` });
  } catch (err) {
    res.json({ success: false, message: "❌ Mail sending failed: " + err.message });
  }
});

// ✅ Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
