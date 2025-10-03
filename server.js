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
  secret: "fastmail_secret",
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, "public")));

// Fake Login User
const USER = { username: "admin", password: "1234" };

// Login API
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

// Protect launcher page
app.get("/launcher", (req, res) => {
  if (!req.session.user) return res.redirect("/login.html");
  res.sendFile(path.join(__dirname, "public", "launcher.html"));
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login.html");
});

// Send Mail API
app.post("/send-mail", async (req, res) => {
  try {
    const { senderName, senderEmail, appPassword, subject, message, recipients } = req.body;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: appPassword
      }
    });

    let mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: recipients,
      subject: subject,
      text: message
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Mail sent successfully!" });
  } catch (err) {
    res.json({ success: false, message: "Mail sending failed: " + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server running on port " + PORT));


const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: "fastmail_secret",
  resave: false,
  saveUninitialized: false
}));

// Public folder serve
app.use(express.static(path.join(__dirname, "public")));

// ✅ Root route → always load login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Launcher protected route
app.get("/launcher", (req, res) => {
  if (!req.session.user) return res.redirect("/login.html");
  res.sendFile(path.join(__dirname, "public", "launcher.html"));
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Dummy login (for testing)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "1234") {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Server running at http://localhost:" + PORT));

