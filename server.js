const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Database
const db = new sqlite3.Database("components.db");

db.run(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT
  )
`);

// Serve index.html and viewer.html
app.use(express.static(__dirname));

app.get("/viewer", (req, res) => {
  res.sendFile(path.join(__dirname, "viewer.html"));
});

// Submit route
app.post("/submit", (req, res) => {
  const json = JSON.stringify(req.body);
  db.run("INSERT INTO submissions (data) VALUES (?)", [json], function (err) {
    if (err) return res.status(500).send("Database error");
    res.send("OK");
  });
});

// Submissions route
app.get("/submissions", (req, res) => {
  db.all("SELECT * FROM submissions ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).send("Database error");
    res.json(rows);
  });
});

// Start server
const port = process.env.PORT || 10000;
app.listen(port, () => console.log("Server running on port " + port));
