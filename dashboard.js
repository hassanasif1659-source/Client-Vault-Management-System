// ClientVault - Dashboard page

buildLayout("dashboard", "Dashboard");
document.getElementById("welcomeName").textContent = currentUser.name;

// Put icons inside the number cards
document.querySelectorAll("[data-icon]").forEach(function (box) {
  box.innerHTML = icon(box.dataset.icon);
});

// Draw a bar chart: list = [[label, number], ...]
function drawBars(boxId, list) {
  const box = document.getElementById(boxId);
  const max = Math.max.apply(null, list.map(function (x) { return x[1]; }).concat([1]));
  box.innerHTML = list.map(function (x) {
    return '<div class="bar-row"><span>' + safe(x[0]) + '</span>' +
           '<div class="bar-track"><div class="bar-fill" data-w="' + (x[1] / max * 100) + '"></div></div>' +
           "<b>" + x[1] + "</b></div>";
  }).join("");
  // small animation: bars grow from 0
  setTimeout(function () {
    box.querySelectorAll(".bar-fill").forEach(function (b) { b.style.width = b.dataset.w + "%"; });
  }, 50);
}

// Count how many times each value appears, biggest first
function countBy(clients, getValue) {
  const counts = {};
  clients.forEach(function (c) {
    const key = getValue(c);
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.keys(counts).map(function (k) { return [k, counts[k]]; })
    .sort(function (a, b) { return b[1] - a[1]; });
}

api("GET", "/api/clients")
  .then(function (clients) {
    const total = clients.length;
    const active = clients.filter(function (c) { return c.status === "Active"; }).length;
    const inactive = clients.filter(function (c) { return c.status === "Inactive"; }).length;
    const pending = clients.filter(function (c) { return c.status === "Pending"; }).length;
    function pct(n) { return total ? Math.round(n / total * 100) + "% of all clients" : "0%"; }

    // Number cards
    document.getElementById("total").textContent = total;
    document.getElementById("active").textContent = active;
    document.getElementById("inactive").textContent = inactive;
    document.getElementById("pending").textContent = pending;
    document.getElementById("activePct").textContent = pct(active);
    document.getElementById("inactivePct").textContent = pct(inactive);
    document.getElementById("pendingPct").textContent = pct(pending);

    // Donut chart
    const a = total ? active / total * 100 : 0;
    const i = total ? inactive / total * 100 : 0;
    document.getElementById("donut").style.background =
      "conic-gradient(var(--active) 0 " + a + "%, var(--inactive) " + a + "% " + (a + i) +
      "%, var(--pending) " + (a + i) + "% 100%)";
    document.getElementById("donutTotal").textContent = total;
    document.getElementById("lgActive").textContent = active;
    document.getElementById("lgInactive").textContent = inactive;
    document.getElementById("lgPending").textContent = pending;

    // Bar charts
    drawBars("typeBars", countBy(clients, function (c) { return c.client_type; }));
    drawBars("cityBars", countBy(clients, function (c) {
      return String(c.address).split(",").pop().trim(); // last part of address = city
    }).slice(0, 5));

    // Newest 6 clients
    const newest = clients.slice().sort(function (x, y) {
      return String(y.reg_date).localeCompare(String(x.reg_date));
    }).slice(0, 6);

    document.getElementById("recentRows").innerHTML = newest.map(function (c) {
      return '<tr onclick="location.href=\'clients.html?id=' + encodeURIComponent(c.client_id) + '\'" style="cursor:pointer">' +
        '<td><div class="client-cell"><div class="mini-avatar">' + initials(c.full_name) + "</div>" +
        "<div>" + safe(c.full_name) + "<small>" + safe(c.client_id) + "</small></div></div></td>" +
        "<td>" + niceDate(c.reg_date) + "</td>" +
        '<td><span class="badge ' + safe(c.status) + '">' + safe(c.status) + "</span></td></tr>";
    }).join("");
  })
  .catch(function () {
    showToast("Could not load data. Is the server running? (node server.js)", true);
  });
