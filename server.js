const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: "bulkmail_secret",
  resave: false,
  saveUninitialized: false
}));

// Serve static files (public folder)
app.use(express.static(path.join(__dirname, "public")));

// ✅ Root route → login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ✅ Login API (default user: admin / 1234)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "1234") {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

// ✅ Launcher page (protected)
app.get("/launcher", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.sendFile(path.join(__dirname, "public", "launcher.html"));
});

// ✅ Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// ✅ Bulk Mail Sender
app.post("/send-mail", async (req, res) => {
  try {
    const { senderName, senderEmail, appPassword, subject, message, recipients } = req.body;

    // recipients को साफ करो और comma से जोड़ दो
    let recipientList = recipients.split(",").map(r => r.trim()).filter(r => r);
    let recipientString = recipientList.join(",");

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: appPassword
      }
    });

    let mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: recipientString,   // ✅ अब सबको एक साथ भेजेगा
      subject: subject,
      text: message
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: `✅ Mail sent successfully to ${recipientList.length} recipients!` });
  } catch (err) {
    console.error("Mail Error:", err.message);
    res.json({ success: false, message: "❌ Mail sending failed: " + err.message });
  }
});

// ✅ Render-compatible Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
