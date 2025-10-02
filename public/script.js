document.getElementById("emailForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const senderName = document.getElementById("senderName").value;
  const senderEmail = document.getElementById("senderEmail").value;
  const senderPass = document.getElementById("senderPass").value;
  const recipients = document.getElementById("recipients").value.split(",");
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;

  const res = await fetch("/send-bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senderName, senderEmail, senderPass, recipients, subject, html: message })
  });

  const data = await res.json();

  if (data.success) {
    alert(`✅ Emails sent successfully to ${data.sent} recipients`);
  } else {
    alert(`❌ Error: ${data.error}`);
  }
});

// logout function
function logout() {
  alert("You have been logged out!");
  window.location.href = "launcher.html";
}
