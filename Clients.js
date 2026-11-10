// ClientVault - Clients page: search, view, update and delete clients

buildLayout("clients", "Clients");

// Put icons into buttons that ask for one
document.querySelectorAll("[data-icon]").forEach(function (el) { el.innerHTML = icon(el.dataset.icon); });
document.getElementById("searchWrap").insertAdjacentHTML("afterbegin", icon("search"));

const rowsBox = document.getElementById("clientRows");
const searchBox = document.getElementById("searchBox");
const statusFilter = document.getElementById("statusFilter");
const typeFilter = document.getElementById("typeFilter");
const PER_PAGE = 12;

let allClients = [];   // every client from MySQL
let shown = [];        // clients after search + filters
let page = 1;
let selected = null;   // client chosen for view / update / delete

// 1. Read options from the address bar, e.g. clients.html?status=Active or ?id=CL-0025
const params = new URLSearchParams(window.location.search);
if (params.get("status")) statusFilter.value = params.get("status");

// 2. Load all clients
function loadClients() {
  api("GET", "/api/clients")
    .then(function (clients) {
      allClients = clients;
      applyFilters();

      // Opened with ?id=... -> show that client straight away
      const id = params.get("id");
      if (id) {
        const c = allClients.find(function (x) { return x.client_id === id; });
        if (c) viewClient(c);
        else showToast("No client found with ID " + id, true);
        params.delete("id");
      }
      if (params.get("added")) {
        showToast("Client " + params.get("added") + " added successfully");
        params.delete("added");
      }
      history.replaceState(null, "", "clients.html");
    })
    .catch(function () {
      rowsBox.innerHTML = '<tr><td colspan="8" class="empty">Could not load clients. Is the server running? (node server.js)</td></tr>';
    });
}

// 3. Search + filters
function applyFilters() {
  const text = searchBox.value.trim().toLowerCase();
  shown = allClients.filter(function (c) {
    const all = (c.client_id + " " + c.full_name + " " + c.phone + " " + c.email + " " + c.address).toLowerCase();
    return all.includes(text) &&
      (!statusFilter.value || c.status === statusFilter.value) &&
      (!typeFilter.value || c.client_type === typeFilter.value);
  });
  page = 1;
  drawTable();
}

// 4. Draw one page of the table
function drawTable() {
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  if (page > pages) page = pages;
  const start = (page - 1) * PER_PAGE;
  const list = shown.slice(start, start + PER_PAGE);

  if (list.length === 0) {
    rowsBox.innerHTML = '<tr><td colspan="8" class="empty">No clients found</td></tr>';
  } else {
    rowsBox.innerHTML = list.map(function (c) {
      return "<tr>" +
        '<td><span class="id-tag">' + safe(c.client_id) + "</span></td>" +
        '<td><div class="client-cell"><div class="mini-avatar">' + initials(c.full_name) + "</div>" +
          "<div>" + safe(c.full_name) + "<small>" + safe(c.email) + "</small></div></div></td>" +
        "<td>" + safe(c.phone) + "</td>" +
        '<td class="wrap">' + safe(c.address) + "</td>" +
        "<td>" + niceDate(c.reg_date) + "</td>" +
        "<td>" + safe(c.client_type) + "</td>" +
        '<td><span class="badge ' + safe(c.status) + '">' + safe(c.status) + "</span></td>" +
        '<td><div class="actions">' +
          '<button class="icon-btn view" title="View" data-act="view" data-id="' + safe(c.client_id) + '">' + icon("eye") + "</button>" +
          '<button class="icon-btn edit" title="Update" data-act="edit" data-id="' + safe(c.client_id) + '">' + icon("edit") + "</button>" +
          '<button class="icon-btn delete" title="Delete" data-act="delete" data-id="' + safe(c.client_id) + '">' + icon("trash") + "</button>" +
        "</div></td></tr>";
    }).join("");
  }

  document.getElementById("countLabel").textContent = shown.length + " of " + allClients.length + " clients";
  document.getElementById("pageInfo").textContent = "Page " + page + " of " + pages;
  document.getElementById("prevBtn").disabled = page === 1;
  document.getElementById("nextBtn").disabled = page === pages;
}

// 5. Buttons in each row (view / update / delete)
rowsBox.addEventListener("click", function (e) {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const c = allClients.find(function (x) { return x.client_id === btn.dataset.id; });
  if (btn.dataset.act === "view") viewClient(c);
  if (btn.dataset.act === "edit") editClient(c);
  if (btn.dataset.act === "delete") askDelete(c);
});

// 6. VIEW: show all details of one client
function viewClient(c) {
  selected = c;
  function d(label, value, full) {
    return '<div class="detail' + (full ? " full" : "") + '"><span>' + label + "</span>" + safe(value) + "</div>";
  }
  document.getElementById("viewBody").innerHTML =
    '<div class="profile-top"><div class="avatar">' + initials(c.full_name) + "</div>" +
    "<div><h2>" + safe(c.full_name) + "</h2>" +
    '<span class="id-tag">' + safe(c.client_id) + '</span> &nbsp; <span class="badge ' + safe(c.status) + '">' + safe(c.status) + "</span></div></div>" +
    '<div class="details">' +
      d("Phone", c.phone) + d("Email", c.email) +
      d("Address", c.address, true) +
      d("Registration Date", niceDate(c.reg_date)) + d("Client Type", c.client_type) +
    "</div>";
  openModal("viewModal");
}

document.getElementById("viewEditBtn").addEventListener("click", function () {
  closeModal("viewModal");
  editClient(selected);
});

// 7. UPDATE: fill the form and save changes
function editClient(c) {
  selected = c;
  document.getElementById("editId").value = c.client_id;
  document.getElementById("editName").value = c.full_name;
  document.getElementById("editPhone").value = c.phone;
  document.getElementById("editEmail").value = c.email;
  document.getElementById("editAddress").value = c.address;
  document.getElementById("editDate").value = c.reg_date;
  document.getElementById("editType").value = c.client_type;
  document.getElementById("editStatus").value = c.status;
  document.getElementById("editError").textContent = "";
  openModal("editModal");
}

document.getElementById("editForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const updated = readClientForm("edit");
  const problem = checkClient(updated);
  if (problem) {
    document.getElementById("editError").textContent = problem;
    return;
  }
  api("PUT", "/api/clients/" + encodeURIComponent(updated.client_id), updated)
    .then(function () {
      Object.assign(selected, updated);   // change it in the list too
      closeModal("editModal");
      applyFilters();
      showToast(updated.full_name + " updated");
    })
    .catch(function (err) {
      document.getElementById("editError").textContent = err.message;
    });
});

// 8. DELETE: ask first, then remove
function askDelete(c) {
  selected = c;
  document.getElementById("deleteText").textContent =
    c.full_name + " (" + c.client_id + ") will be removed from the database.";
  openModal("deleteModal");
}

document.getElementById("confirmDelete").addEventListener("click", function () {
  const c = selected;
  api("DELETE", "/api/clients/" + encodeURIComponent(c.client_id))
    .then(function () {
      allClients = allClients.filter(function (x) { return x.client_id !== c.client_id; });
      closeModal("deleteModal");
      const keepPage = page;
      applyFilters();
      page = keepPage;
      drawTable();
      showToast(c.full_name + " deleted");
    })
    .catch(function (err) {
      closeModal("deleteModal");
      showToast(err.message, true);
    });
});

// 9. Search, filters and page buttons
searchBox.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);
typeFilter.addEventListener("change", applyFilters);
document.getElementById("prevBtn").addEventListener("click", function () { page--; drawTable(); });
document.getElementById("nextBtn").addEventListener("click", function () { page++; drawTable(); });

loadClients();
