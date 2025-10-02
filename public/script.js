document.getElementById("emailForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const recipients = document.getElementById("recipients").value.split(",");
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;

  const res = await fetch("/send-bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipients, subject, html: message })
  });

  const data = await res.json();
  document.getElementById("status").innerText = data.success
    ? `✅ Emails sent: ${data.sent || recipients.length}`
    : `❌ Error: ${data.error}`;
});
