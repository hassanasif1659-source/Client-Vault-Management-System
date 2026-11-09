// Loads all clients from the server and adds them to the table
const table = document.querySelector("table");

fetch("/api/clients")
  .then(function (response) {
    return response.json();
  })
  .then(function (clients) {
    clients.forEach(function (c) {
      const row = document.createElement("tr");
      row.innerHTML =
        "<td>" + c.client_id + "</td>" +
        "<td>" + c.full_name + "</td>" +
        "<td>" + c.phone + "</td>" +
        "<td>" + c.email + "</td>" +
        "<td>" + c.address + "</td>" +
        "<td>" + c.reg_date + "</td>" +
        "<td>" + c.client_type + "</td>" +
        "<td>" + c.status + "</td>";
      table.appendChild(row);
    });
  });