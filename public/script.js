document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(loginForm).entries());

      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        document.getElementById("loginMsg").innerText = "✅ Login successful! Redirecting...";
        setTimeout(() => {
          window.location.href = "/launcher";
        }, 1000);
      } else {
        document.getElementById("loginMsg").innerText = "❌ " + result.message;
      }
    });
  }
});
