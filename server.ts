import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to seed data if empty (Supabase version)
async function seedData() {
  try {
    // Check announcements
    const { data: announcements, error: annError } = await supabase.from('announcements').select('id').limit(1);
    if (!annError && announcements?.length === 0) {
      await supabase.from('announcements').insert([
        {
          title: "Welcome to the New Semester!",
          content: "We are excited to welcome all students back for the spring semester. Please check your updated schedules.",
          type: "general",
          author: "Principal Smith"
        },
        {
          title: "Urgent: School Closure Tomorrow",
          content: "Due to severe weather conditions, the school will be closed tomorrow, March 11th. All classes will be held online.",
          type: "urgent",
          author: "Admin Office"
        }
      ]);
    }

    // Check events
    const { data: events, error: evError } = await supabase.from('events').select('id').limit(1);
    if (!evError && events?.length === 0) {
      await supabase.from('events').insert([
        {
          title: "Science Fair 2026",
          description: "Annual science fair showcasing student projects.",
          date: "2026-03-25",
          time: "10:00 AM",
          location: "Main Hall"
        },
        {
          title: "Parent-Teacher Meeting",
          description: "Discuss student progress with teachers.",
          date: "2026-04-05",
          time: "02:00 PM",
          location: "Classrooms"
        }
      ]);
    }

    // Check schedules
    const { data: schedules, error: schError } = await supabase.from('schedules').select('id').limit(1);
    if (!schError && schedules?.length === 0) {
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      const scheduleInserts = days.flatMap(day => [
        { class_name: "Mathematics", teacher: "Dr. Aris", day_of_week: day, start_time: "08:00 AM", end_time: "09:30 AM", room: "Room 101" },
        { class_name: "Physics", teacher: "Prof. Newton", day_of_week: day, start_time: "10:00 AM", end_time: "11:30 AM", room: "Lab A" }
      ]);
      await supabase.from('schedules').insert(scheduleInserts);
    }
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  app.use(express.json());

  // Seed data
  await seedData();

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
  app.get("/api/announcements", async (req, res) => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post("/api/announcements", async (req, res) => {
    const { title, content, type, author } = req.body;
    const { data, error } = await supabase
      .from('announcements')
      .insert([{ title, content, type, author }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    
    broadcast({ type: "NEW_ANNOUNCEMENT", payload: data });
    res.json(data);
  });

  app.get("/api/events", async (req, res) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.get("/api/schedules", async (req, res) => {
    const { data, error } = await supabase
      .from('schedules')
      .select('*');
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.get("/api/videos", async (req, res) => {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post("/api/videos", async (req, res) => {
    const { prompt } = req.body;
    const { data, error } = await supabase
      .from('videos')
      .insert([{ prompt, status: 'pending' }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
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
