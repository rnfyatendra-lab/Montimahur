document.getElementById("mailForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  let formData = Object.fromEntries(new FormData(e.target).entries());

  let res = await fetch("/send-mail", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData)
  });

  let result = await res.json();

  if (result.success) {
    alert(result.message); // ✅ Popup success
  } else {
    alert(result.message); // ❌ Popup error
  }
});

function logout() {
  window.location.href = "/logout";
}
