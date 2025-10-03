// Login form
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const mailForm = document.getElementById("mailForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(loginForm));
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

  if (mailForm) {
    mailForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(mailForm));
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

function logout() {
  window.location.href = "/logout";
}
