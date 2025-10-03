app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // ✅ Default credentials
  const AUTH_USER = "admin";
  const AUTH_PASS = "1234";

  if (username === AUTH_USER && password === AUTH_PASS) {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});
