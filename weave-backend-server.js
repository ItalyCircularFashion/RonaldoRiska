// ─────────────────────────────────────────────
// WEAVE STUDIO BACKEND - READY TO RUN
// Node.js + Express + SQLite
// ─────────────────────────────────────────────

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const { randomUUID } = require("crypto");

const app = express();
const PORT = 3001;

// ─── MIDDLEWARE ───────────────────────────────
app.use(cors());
app.use(express.json());

// ─── MASTER LOGIN ────────────────────────────
const MASTER = {
  username: "ronaldo",
  password: "antilope"
};

// ─── DATABASE ────────────────────────────────
const db = new sqlite3.Database("./weaves.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT,
      client TEXT,
      code TEXT,
      data TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )
  `);
});

// ─── ROUTES ──────────────────────────────────

// LOGIN
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === MASTER.username && password === MASTER.password) {
    return res.json({ success: true });
  }

  return res.status(401).json({ success: false });
});

// SAVE PROJECT
app.post("/api/save", (req, res) => {
  const { id, name, client, code, data } = req.body;

  const projectId = id || randomUUID();
  const now = new Date().toISOString();

  db.run(
    `INSERT OR REPLACE INTO projects 
     (id, name, client, code, data, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [projectId, name, client, code, JSON.stringify(data), now, now],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true, id: projectId });
    }
  );
});

// GET ALL PROJECTS
app.get("/api/projects", (req, res) => {
  db.all("SELECT * FROM projects ORDER BY updatedAt DESC", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json([]);
    }
    res.json(rows);
  });
});

// SEARCH PROJECTS
app.get("/api/projects/search", (req, res) => {
  const q = req.query.q || "";

  db.all(
    `SELECT * FROM projects
     WHERE name LIKE ? OR client LIKE ? OR code LIKE ?
     ORDER BY updatedAt DESC`,
    [`%${q}%`, `%${q}%`, `%${q}%`],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json([]);
      }
      res.json(rows);
    }
  );
});

// DELETE PROJECT
app.delete("/api/projects/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM projects WHERE id = ?", [id], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

// ─── START SERVER ─────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Weave Studio backend running on http://localhost:${PORT}`);
});

// ─────────────────────────────────────────────
// HOW TO RUN:
// 1. npm init -y
// 2. npm install express sqlite3 cors
// 3. node server.js
// ─────────────────────────────────────────────
