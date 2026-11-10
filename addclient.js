// ClientVault - Add Client page

buildLayout("add", "Add Client");

// 1. Today's date and the next free Client ID
document.getElementById("addDate").value = new Date().toISOString().slice(0, 10);

api("GET", "/api/clients").then(function (clients) {
  let max = 0;
  clients.forEach(function (c) {
    const n = parseInt(String(c.client_id).replace("CL-", ""), 10);
    if (n > max) max = n;
  });
  document.getElementById("addId").value = "CL-" + String(max + 1).padStart(4, "0");
});

// 2. Save button
document.getElementById("addForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const client = readClientForm("add");
  const problem = checkClient(client);
  const errorBox = document.getElementById("addError");

  if (problem) {
    errorBox.textContent = problem;
    return;
  }

  api("POST", "/api/clients", client)
    .then(function () {
      window.location.href = "clients.html?added=" + encodeURIComponent(client.client_id);
    })
    .catch(function (err) {
      errorBox.textContent = err.message;
    });
});
