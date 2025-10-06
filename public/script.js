document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const mailForm = document.getElementById("mailForm");
  const sendBtn = document.getElementById("sendBtn");

  // ✅ Login
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
        window.location.href = "/launcher";
      } else {
        alert("❌ " + result.message);
      }
    });
  }

  // ✅ Bulk mail
  if (mailForm) {
    mailForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(mailForm).entries());

      // 🔵 Button same as logout color + "Sending..."
      sendBtn.disabled = true;
      sendBtn.style.background = "#4285f4"; // blue (logout वाला color)
      sendBtn.style.color = "#fff";
      sendBtn.innerText = "Sending...";

      const res = await fetch("/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      // ✅ Popup only
      alert(result.message);

      // Reset button back
      sendBtn.disabled = false;
      sendBtn.style.background = "#4285f4"; // reset to blue
      sendBtn.style.color = "#fff";
      sendBtn.innerText = "Send All";
    });
  }
});

function logout() {
  window.location.href = "/logout";
}
