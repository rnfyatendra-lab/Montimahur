// dashboard behavior
document.addEventListener('DOMContentLoaded', async () => {
  // check auth
  const r = await fetch('/api/me');
  const info = await r.json();
  if (!info.authenticated) {
    window.location.href = '/login.html';
    return;
  }
});

document.getElementById('sendForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const subject = document.getElementById('subject').value.trim();
  const html = document.getElementById('html').value.trim();
  const recipientsRaw = document.getElementById('recipients').value;
  const batchSize = parseInt(document.getElementById('batchSize').value) || 100;
  const concurrency = parseInt(document.getElementById('concurrency').value) || 4;

  // parse recipients by comma or newline
  const recipients = recipientsRaw.split(/[\n,]+/).map(s => s.trim()).filter(s => s && s.includes('@'));
  if (recipients.length === 0) {
    alert('Provide at least one valid recipient');
    return;
  }

  document.getElementById('status').innerText = 'Sending...';
  try {
    const res = await fetch('/api/send-bulk', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ subject, html, recipients, batchSize, concurrency })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('status').innerText = `Request accepted. approx sent: ${data.sentApprox || recipients.length}`;
      alert('✅ Send request completed (approx). Check webhooks for exact delivery status.');
    } else {
      document.getElementById('status').innerText = `Error: ${data.error}`;
      alert('❌ Send failed: ' + (data.error || 'unknown'));
    }
  } catch (err) {
    document.getElementById('status').innerText = 'Network error: ' + err.message;
    alert('Network error: ' + err.message);
  }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = '/login.html';
});
