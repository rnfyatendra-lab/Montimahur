document.addEventListener("DOMContentLoaded", () => {
  // Load saved credentials from session
  const email = sessionStorage.getItem("senderEmail");
  const pass = sessionStorage.getItem("senderPass");

  if (!email || !pass) {
    alert("⚠️ Please login first!");
    window.location.href = "login.html";
    return;
  }

  document.getElementById("senderEmail").value = email;
  document.getElementById("senderPass").value = pass;
});

document.getElementById("emailForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const senderName = document.getElementById("senderName").value.trim();
  const senderEmail = document.getElementById("senderEmail").value.trim();
  const senderPass = document.getElementById("senderPass").value.trim();
  const recipients = document.getElementById("recipients").value
    .split(/[\n,]+/)
    .map(r => r.trim())
    .filter(r => r);
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value;

  try {
    const res = await fetch("/send-bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderName, senderEmail, senderPass, recipients, subject, html: message })
    });

    const data = await res.json();
    if (data.success) {
      alert(`✅ Sent ${data.sent} emails successfully!`);
      document.getElementById("emailForm").reset();
    } else {
      alert(`❌ Error: ${data.error}`);
    }
  } catch (err) {
    alert(`❌ Network Error: ${err.message}`);
  }
});

function logout() {
  sessionStorage.clear();
  window.location.href = "login.html";
}
