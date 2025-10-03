const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
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

// ✅ Public folder serve
app.use(express.static(path.join(__dirname, "public")));

// ✅ Root route → always load login.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// ✅ Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Hardcoded credentials
  const AUTH_USER = "admin";
  const AUTH_PASS = "1234";

  if (username === AUTH_USER && password === AUTH_PASS) {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

// ✅ Launcher route
app.get("/launcher", (req, res) => {
  if (!req.session.user) return res.redirect("/");
  res.sendFile(path.join(__dirname, "public", "launcher.html"));
});

// ✅ Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
