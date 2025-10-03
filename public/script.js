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

  // ✅ Mail form handler
  if (mailForm) {
    mailForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(mailForm).entries());

      // Check blank fields
      if (!data.senderName || !data.senderEmail || !data.appPassword || !data.subject || !data.message || !data.recipients) {
        alert("⚠️ Please fill all fields!");
        return;
      }

      const res = await fetch("/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        alert(result.message); // ✅ Popup success
        mailForm.reset(); // clear form after success
      } else {
        alert(result.message); // ❌ Popup error
      }
    });
  }
});

// ✅ Logout
function logout() {
  window.location.href = "/logout";
}
