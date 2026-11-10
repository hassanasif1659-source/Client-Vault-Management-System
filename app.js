// =========================================================
// ClientVault - shared code used by every page after login
// (login check, sidebar, top bar, icons, pop-ups, messages)
// =========================================================

// 1. Login check: if not logged in, go back to the login page
const currentUser = JSON.parse(sessionStorage.getItem("cvUser") || "null");
if (!currentUser) {
  window.location.href = "index.html";
}

// 2. Small icons (SVG) used across the website
const ICONS = {
  vault: '<path d="M3 10h18M5 10v8M9 10v8M15 10v8M19 10v8M2 21h20M12 2l9 5H3z"/>',
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  plus: '<circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6"/>',
  check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  pause: '<circle cx="12" cy="12" r="10"/><path d="M10 15V9M14 15V9"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"/>'
};

function icon(name) {
  return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
         'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + "</svg>";
}

// 3. First letters of a name, e.g. "Ayesha Sheikh" -> "AS"
function initials(name) {
  return String(name).split(" ").filter(Boolean).slice(0, 2)
    .map(function (w) { return w[0].toUpperCase(); }).join("");
}

// 4. Safe text for HTML (stops broken pages if a name has < or >)
function safe(text) {
  const div = document.createElement("div");
  div.textContent = text == null ? "" : text;
  return div.innerHTML;
}

// 5. Nice date, e.g. "2021-02-01" -> "01 Feb 2021"
function niceDate(d) {
  if (!d) return "";
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// 6. Build the sidebar and top bar on every page
function buildLayout(pageName, pageTitle) {
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  const sidebar =
    '<aside class="sidebar">' +
      '<div class="brand">' +
        '<div class="brand-logo">' + icon("vault") + "</div>" +
        '<div><div class="brand-name">Client<span>Vault</span></div>' +
        '<div class="brand-tag">Bank Client Manager</div></div>' +
      "</div>" +
      '<div class="nav-title">MENU</div>' +
      '<nav class="nav">' +
        '<a href="dashboard.html" class="' + (pageName === "dashboard" ? "active" : "") + '">' + icon("dashboard") + "Dashboard</a>" +
        '<a href="clients.html" class="' + (pageName === "clients" ? "active" : "") + '">' + icon("users") + "Clients</a>" +
        '<a href="addclient.html" class="' + (pageName === "add" ? "active" : "") + '">' + icon("plus") + "Add Client</a>" +
      "</nav>" +
      '<div class="sidebar-bottom">' +
        '<div class="user-card"><div class="avatar">' + initials(currentUser.name.replace("Mr. ", "")) + "</div>" +
        '<div><div class="user-name">' + safe(currentUser.name) + '</div><div class="user-role">' + safe(currentUser.role) + "</div></div></div>" +
        '<a class="logout-link" id="logoutBtn">' + icon("logout") + "Logout</a>" +
      "</div>" +
    "</aside>";

  const topbar =
    '<header class="topbar">' +
      '<div><h1>' + pageTitle + '</h1><div class="date">' + today + "</div></div>" +
      '<form class="quick-find" id="quickFind">' + icon("search") +
        '<input id="quickFindInput" placeholder="Find client by ID e.g. CL-0025">' +
        '<button type="submit">Find</button>' +
      "</form>" +
    "</header>";

  const page = document.getElementById("page");
  const layout = document.createElement("div");
  layout.className = "layout";
  layout.innerHTML = sidebar + '<main class="content">' + topbar + "</main>";
  document.body.prepend(layout);
  layout.querySelector(".content").appendChild(page);

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", function () {
    sessionStorage.removeItem("cvUser");
    window.location.href = "index.html";
  });

  // Quick find by ID: opens the client's details on the Clients page
  document.getElementById("quickFind").addEventListener("submit", function (e) {
    e.preventDefault();
    let id = document.getElementById("quickFindInput").value.trim().toUpperCase();
    if (!id) return;
    if (/^\d+$/.test(id)) id = "CL-" + id.padStart(4, "0"); // "25" -> "CL-0025"
    window.location.href = "clients.html?id=" + encodeURIComponent(id);
  });
}

// 7. Toast message in the corner
function showToast(text, isError) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }
  toast.className = "toast" + (isError ? " error" : "");
  toast.innerHTML = icon(isError ? "alert" : "check") + "<span>" + safe(text) + "</span>";
  setTimeout(function () { toast.classList.add("show"); }, 10);
  clearTimeout(toast.timer);
  toast.timer = setTimeout(function () { toast.classList.remove("show"); }, 3000);
}

// 8. Open / close pop-up windows (modals)
function openModal(id) { document.getElementById(id).classList.add("open"); }
function closeModal(id) { document.getElementById(id).classList.remove("open"); }

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("modal-bg")) e.target.classList.remove("open");
  if (e.target.closest("[data-close]")) e.target.closest(".modal-bg").classList.remove("open");
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-bg.open").forEach(function (m) { m.classList.remove("open"); });
  }
});

// 9. Talk to the server (Node.js + MySQL)
function api(method, url, data) {
  const options = { method: method, headers: { "Content-Type": "application/json" } };
  if (data) options.body = JSON.stringify(data);
  return fetch(url, options).then(function (response) {
    return response.json().catch(function () { return {}; }).then(function (body) {
      if (!response.ok) throw new Error(body.message || "Something went wrong");
      return body;
    });
  });
}

// 10. Read all form fields of a client form into one object
function readClientForm(prefix) {
  function v(id) { return document.getElementById(prefix + id).value.trim(); }
  return {
    client_id: v("Id").toUpperCase(),
    full_name: v("Name"),
    phone: v("Phone"),
    email: v("Email"),
    address: v("Address"),
    reg_date: v("Date"),
    client_type: v("Type"),
    status: v("Status")
  };
}

// 11. Check a client form before saving. Returns an error message or "".
function checkClient(c) {
  if (!c.client_id || !c.full_name || !c.phone || !c.email || !c.address || !c.reg_date) {
    return "Please fill all fields.";
  }
  if (!/^CL-\d{4}$/.test(c.client_id)) return "Client ID must look like CL-0201.";
  if (!/^\S+@\S+\.\S+$/.test(c.email)) return "Please enter a valid email.";
  return "";
}
