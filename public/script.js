document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const mailForm = document.getElementById("mailForm");
  const sendBtn = document.getElementById("sendBtn");

  // ✅ Login handler
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

  // ✅ Mail handler
  if (mailForm) {
    mailForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(mailForm).entries());

      sendBtn.disabled = true;
      sendBtn.style.background = "red";
      sendBtn.innerText = "Sending...";

      const res = await fetch("/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        sendBtn.innerText = "Sent ✅";
        sendBtn.style.background = "green";
      } else {
        sendBtn.innerText = "Failed ❌";
        sendBtn.style.background = "gray";
      }

      setTimeout(() => {
        sendBtn.disabled = false;
        sendBtn.style.background = "#4285f4";
        sendBtn.innerText = "Send All";
      }, 3000);
    });
  }
});

// ✅ Logout
function logout() {
  window.location.href = "/logout";
}
