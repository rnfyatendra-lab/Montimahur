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
      if (result.success) {
        alert("✅ Login Successful!");
        window.location.href = "/launcher";
      } else {
        alert("❌ " + result.message);
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

      if (result.success) {
        alert("✅ " + result.message);
      } else {
        alert("❌ " + result.message);
      }
    });
  }
});

function logout() {
  window.location.href = "/logout";
}
