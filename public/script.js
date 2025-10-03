document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const mailForm = document.getElementById("mailForm");

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
        alert("✅ Login successful!");
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

      // Check blank fields
      if (!data.senderName || !data.senderEmail || !data.appPassword || !data.subject || !data.message || !data.recipients) {
        alert("⚠️ Please fill all fields!");
        return;
      }

      const sendBtn = mailForm.querySelector("button[type='submit']");
      sendBtn.disabled = true;
      sendBtn.innerText = "Sending..."; // 👈 Sending दिखेगा

      const res = await fetch("/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }

      sendBtn.disabled = false;
      sendBtn.innerText = "Send All"; // 👈 वापस Send All
    });
  }
});

// ✅ Logout
function logout() {
  window.location.href = "/logout";
}
