document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(loginForm);
      const data = Object.fromEntries(formData.entries());

      try {
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
      } catch (err) {
        document.getElementById("loginMsg").innerText = "❌ Server error: " + err.message;
      }
    });
  }
});
