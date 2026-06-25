import express from "express";
import bodyParser from "body-parser";
import sqlite3 from "sqlite3";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json({ limit: "5mb" }));

const db = new sqlite3.Database("components.db");
db.run("CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY, data TEXT)");

app.post("/submit", (req, res) => {
  const data = JSON.stringify(req.body);
  db.run("INSERT INTO submissions (data) VALUES (?)", [data], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }
    res.sendStatus(200);
  });
});

app.get("/submissions", (req, res) => {
  db.all("SELECT * FROM submissions", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
