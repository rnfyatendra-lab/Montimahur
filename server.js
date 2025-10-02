document.getElementById("emailForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Form values
  const senderName = document.getElementById("senderName").value.trim();
  const senderEmail = document.getElementById("senderEmail").value.trim();
  const senderPass = document.getElementById("senderPass").value.trim();
  const recipients = document.getElementById("recipients").value.split(",").map(r => r.trim()).filter(r => r);
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value;

  if (!senderName || !senderEmail || !senderPass || recipients.length === 0 || !subject || !message) {
    alert("⚠️ Please fill all fields correctly!");
    return;
  }

  try {
    const res = await fetch("/send-bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderName, senderEmail, senderPass, recipients, subject, html: message })
    });

    const data = await res.json();

    if (data.success) {
      alert(`✅ Emails sent successfully to ${data.sent} recipient(s)!`);
      // Clear the form after success
      document.getElementById("emailForm").reset();
    } else {
      alert(`❌ Error sending emails: ${data.error}`);
    }

  } catch (err) {
    alert(`❌ Network/Error: ${err.message}`);
    console.error("Email send failed:", err);
  }
});

// Logout button
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    window.location.href = "launcher.html";
  }
}
