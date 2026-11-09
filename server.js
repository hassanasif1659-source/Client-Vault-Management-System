// ClientVault backend: connects the website to the MySQL database
const express = require("express");
const mysql = require("mysql2");

const app = express();

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

// 3. Send all clients from the database
app.get("/api/clients", function (req, res) {
  db.query("SELECT * FROM clients", function (err, rows) {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.json(rows);
    }
  });
});

// 4. Start the server
app.listen(3000, function () {
  console.log("Open http://localhost:3000 in your browser");
});