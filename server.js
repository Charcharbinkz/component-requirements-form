import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// Resolve __dirname (needed for Render)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to SQLite DB (fixes Render's two‑DB issue)
const dbPath = path.resolve("/opt/render/project/src/components.db");
const db = new sqlite3.Database(dbPath);

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Serve static files (index.html, viewer.html, etc.)
app.use(express.static(__dirname));

// Route: serve viewer.html
app.get("/viewer", (req, res) => {
  res.sendFile(path.join(__dirname, "viewer.html"));
});

// Route: submit form data
app.post("/submit", (req, res) => {
  const data = JSON.stringify(req.body);

  db.run(
    "INSERT INTO submissions (data) VALUES (?)",
    [data],
    function (err) {
      if (err) {
        console.error("DB insert error:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ status: "ok", id: this.lastID });
    }
  );
});

// Route: get all submissions
app.get("/submissions", (req, res) => {
  db.all(
    "SELECT id, data, created_at FROM submissions ORDER BY id DESC",
    [],
    (err, rows) => {
      if (err) {
        console.error("DB read error:", err);
        return res.status(500).json({ error: "Database error" });
      }

      // Ensure each row has parsed JSON
      const formatted = rows.map(row => ({
        id: row.id,
        created_at: row.created_at,
        data: row.data
      }));

      res.json(formatted);
    }
  );
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
