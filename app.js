const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 3000; // Port ini harus sama dengan yang di Dockerfile/docker-compose

// Middleware
app.use(cors()); // Mengizinkan request dari domain lain (frontend React kita)
app.use(express.json()); // Mem-parsing body request JSON

// Konfigurasi koneksi database dari environment variables
const db = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // --- TAMBAHKAN DUA BARIS INI ---
    port: process.env.DB_PORT || 3306, // Ambil port dari env, default 3306
    ssl: { mode: "REQUIRED" }, // Wajib untuk Aiven
    // ------------------------------
  })
  .promise();

// 1. GET (Mengambil semua task)
app.get("/api/tasks", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM task ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 2. POST (Menambah task baru)
app.post("/api/tasks", async (req, res) => {
  const { task_name } = req.body;
  if (!task_name) {
    return res.status(400).json({ error: "task_name is required" });
  }

  try {
    const [result] = await db.query("INSERT INTO task (task_name) VALUES (?)", [
      task_name,
    ]);
    res.status(201).json({ id: result.insertId, task_name, is_done: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 3. PUT (Update status is_done)
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Query ini akan me-toggle nilai is_done (0 jadi 1, 1 jadi 0)
    await db.query("UPDATE task SET is_done = NOT is_done WHERE id = ?", [id]);
    res.status(200).json({ message: "Task updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 4. DELETE (Menghapus task)
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM task WHERE id = ?", [id]);
    res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Jalankan server
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
