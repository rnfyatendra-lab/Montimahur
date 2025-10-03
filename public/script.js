// Login form handler
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const mailForm = document.getElementById("mailForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const data = Object.fromEntries(formData);

      let res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      let result = await res.json();
      document.getElementById("loginMsg").innerText = result.success
        ? "✅ Login Successful! Redirecting..."
        : "❌ " + result.message;

      if (result.success) {
        setTimeout(() => window.location.href = "/launcher", 1000);
      }
    });
  }

  // Mail form handler
  if (mailForm) {
    mailForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(mailForm);
      const data = Object.fromEntries(formData);

      let res = await fetch("/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      let result = await res.json();
      document.getElementById("mailMsg").innerText = result.success
        ? "✅ " + result.message
        : "❌ " + result.message;
    });
  }
});

// Logout
function logout() {
  window.location.href = "/logout";
}
