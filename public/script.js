document.addEventListener("DOMContentLoaded", () => {
  const mailForm = document.getElementById("mailForm");

  if (mailForm) {
    mailForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // form values
      const data = Object.fromEntries(new FormData(mailForm).entries());

      // ✅ check if any field empty
      if (!data.senderName || !data.senderEmail || !data.appPassword || !data.subject || !data.message || !data.recipients) {
        alert("⚠️ Please fill all fields before sending!");
        return;
      }

      const res = await fetch("/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.success) {
        alert("✅ " + result.message); // success popup
        mailForm.reset(); // ✅ clear form after send
      } else {
        alert("❌ " + result.message);
      }
    });
  }
});
