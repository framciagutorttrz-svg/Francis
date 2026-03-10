import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("school.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL, -- urgent, general, reminder
    author TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT
  );

  CREATE TABLE IF NOT EXISTS schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL,
    teacher TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    room TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt TEXT NOT NULL,
    video_url TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed data if empty
const announcementCount = db.prepare("SELECT count(*) as count FROM announcements").get() as { count: number };
if (announcementCount.count === 0) {
  db.prepare("INSERT INTO announcements (title, content, type, author) VALUES (?, ?, ?, ?)").run(
    "Welcome to the New Semester!",
    "We are excited to welcome all students back for the spring semester. Please check your updated schedules.",
    "general",
    "Principal Smith"
  );
  db.prepare("INSERT INTO announcements (title, content, type, author) VALUES (?, ?, ?, ?)").run(
    "Urgent: School Closure Tomorrow",
    "Due to severe weather conditions, the school will be closed tomorrow, March 11th. All classes will be held online.",
    "urgent",
    "Admin Office"
  );
}

const eventCount = db.prepare("SELECT count(*) as count FROM events").get() as { count: number };
if (eventCount.count === 0) {
  db.prepare("INSERT INTO events (title, description, date, time, location) VALUES (?, ?, ?, ?, ?)").run(
    "Science Fair 2026",
    "Annual science fair showcasing student projects.",
    "2026-03-25",
    "10:00 AM",
    "Main Hall"
  );
  db.prepare("INSERT INTO events (title, description, date, time, location) VALUES (?, ?, ?, ?, ?)").run(
    "Parent-Teacher Meeting",
    "Discuss student progress with teachers.",
    "2026-04-05",
    "02:00 PM",
    "Classrooms"
  );
}

const scheduleCount = db.prepare("SELECT count(*) as count FROM schedules").get() as { count: number };
if (scheduleCount.count === 0) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  days.forEach(day => {
    db.prepare("INSERT INTO schedules (class_name, teacher, day_of_week, start_time, end_time, room) VALUES (?, ?, ?, ?, ?, ?)").run(
      "Mathematics", "Dr. Aris", day, "08:00 AM", "09:30 AM", "Room 101"
    );
    db.prepare("INSERT INTO schedules (class_name, teacher, day_of_week, start_time, end_time, room) VALUES (?, ?, ?, ?, ?, ?)").run(
      "Physics", "Prof. Newton", day, "10:00 AM", "11:30 AM", "Lab A"
    );
  });
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());

  // WebSocket handling
  const clients = new Set<WebSocket>();
  wss.on("connection", (ws) => {
    clients.add(ws);
    ws.on("close", () => clients.delete(ws));
  });

  const broadcast = (data: any) => {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // API Routes
  app.get("/api/announcements", (req, res) => {
    const rows = db.prepare("SELECT * FROM announcements ORDER BY created_at DESC").all();
    res.json(rows);
  });

  app.post("/api/announcements", (req, res) => {
    const { title, content, type, author } = req.body;
    const result = db.prepare("INSERT INTO announcements (title, content, type, author) VALUES (?, ?, ?, ?)").run(title, content, type, author);
    const newAnnouncement = db.prepare("SELECT * FROM announcements WHERE id = ?").get(result.lastInsertRowid);
    broadcast({ type: "NEW_ANNOUNCEMENT", payload: newAnnouncement });
    res.json(newAnnouncement);
  });

  app.get("/api/events", (req, res) => {
    const rows = db.prepare("SELECT * FROM events ORDER BY date ASC").all();
    res.json(rows);
  });

  app.get("/api/schedules", (req, res) => {
    const rows = db.prepare("SELECT * FROM schedules").all();
    res.json(rows);
  });

  app.get("/api/videos", (req, res) => {
    const rows = db.prepare("SELECT * FROM videos ORDER BY created_at DESC").all();
    res.json(rows);
  });

  app.post("/api/videos", (req, res) => {
    const { prompt } = req.body;
    const result = db.prepare("INSERT INTO videos (prompt, status) VALUES (?, ?)").run(prompt, "pending");
    const newVideo = db.prepare("SELECT * FROM videos WHERE id = ?").get(result.lastInsertRowid);
    res.json(newVideo);
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
