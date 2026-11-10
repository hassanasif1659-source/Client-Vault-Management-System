// ClientVault backend: connects the website to the MySQL database
const express = require("express");
const mysql = require("mysql2");

const app = express();
app.use(express.json()); // read data sent from the website forms

// 1. Connect to MySQL (XAMPP: password is empty)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "clientvault",
  dateStrings: true
});

db.connect(function (err) {
  if (err) {
    console.log("MySQL connection failed:", err.message);
  } else {
    console.log("Connected to MySQL");
  }
});

// 2. Serve the website files from this folder
app.use(express.static(__dirname));

// 3. http://localhost:3000 opens the login page
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// 4. READ: all clients
app.get("/api/clients", function (req, res) {
  db.query("SELECT * FROM clients ORDER BY client_id", function (err, rows) {
    if (err) return res.status(500).json({ message: err.message });
    res.json(rows);
  });
});

// 5. READ: one client by ID
app.get("/api/clients/:id", function (req, res) {
  db.query("SELECT * FROM clients WHERE client_id = ?", [req.params.id], function (err, rows) {
    if (err) return res.status(500).json({ message: err.message });
    if (rows.length === 0) return res.status(404).json({ message: "Client not found" });
    res.json(rows[0]);
  });
});

// 6. CREATE: add a new client
app.post("/api/clients", function (req, res) {
  const c = req.body;
  const sql = "INSERT INTO clients VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [c.client_id, c.full_name, c.phone, c.email, c.address,
                  c.reg_date, c.client_type, c.status];
  db.query(sql, values, function (err) {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Client ID " + c.client_id + " already exists." });
      }
      return res.status(400).json({ message: err.message });
    }
    res.json({ message: "Client added" });
  });
});

// 7. UPDATE: change an existing client
app.put("/api/clients/:id", function (req, res) {
  const c = req.body;
  const sql = "UPDATE clients SET full_name = ?, phone = ?, email = ?, address = ?, " +
              "reg_date = ?, client_type = ?, status = ? WHERE client_id = ?";
  const values = [c.full_name, c.phone, c.email, c.address, c.reg_date,
                  c.client_type, c.status, req.params.id];
  db.query(sql, values, function (err, result) {
    if (err) return res.status(400).json({ message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Client not found" });
    res.json({ message: "Client updated" });
  });
});

// 8. DELETE: remove a client
app.delete("/api/clients/:id", function (req, res) {
  db.query("DELETE FROM clients WHERE client_id = ?", [req.params.id], function (err, result) {
    if (err) return res.status(500).json({ message: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Client not found" });
    res.json({ message: "Client deleted" });
  });
});

// 9. Start the server
app.listen(3000, function () {
  console.log("Open http://localhost:3000 in your browser");
});
