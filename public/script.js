document.getElementById("mailForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const recipients = document.getElementById("recipients").value.split(",");
  const subject = document.getElementById("subject").value;
  const body = document.getElementById("body").value;

  const res = await fetch("/send-bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipients, subject, body })
  });

  const data = await res.json();
  document.getElementById("result").innerText = JSON.stringify(data);
});
