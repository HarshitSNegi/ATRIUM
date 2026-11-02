import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("PASTE")) {
  console.error("\n[!] GEMINI_API_KEY is missing. Open the .env file and paste your key, then run npm start again.\n");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

fs.mkdirSync("uploads", { recursive: true });
fs.mkdirSync("data", { recursive: true });
const DB = "data/db.json";
const load = () => (fs.existsSync(DB) ? JSON.parse(fs.readFileSync(DB, "utf8")) : { lectures: [] });
const save = (db) => fs.writeFileSync(DB, JSON.stringify(db, null, 2));

const app = express();
app.use(express.json({ limit: "30mb" }));
app.use(express.static("public"));

// Turn the stored lecture file into Gemini "parts" (PDF, audio, images and text all work natively)
function lectureParts(lec) {
  const buf = fs.readFileSync(path.join("uploads", lec.fileId));
  if (lec.mime.startsWith("text/")) return [{ text: "LECTURE TEXT:\n" + buf.toString("utf8") }];
  return [{ inlineData: { mimeType: lec.mime, data: buf.toString("base64") } }];
}

async function generateStudyKit(lec) {
  const prompt = `You are a study assistant. From the lecture material provided, return JSON only:
{"summary": ["8-12 crisp bullet points covering key ideas, definitions, formulas"],
 "flashcards": [{"q": "question", "a": "short answer"}]}
Make 10-15 flashcards that test understanding, not trivia. Use only the material provided.`;
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [...lectureParts(lec), { text: prompt }] }],
    config: { responseMimeType: "application/json" },
  });
  return JSON.parse(res.text);
}

const publicLec = ({ fileId, ...rest }) => rest;

app.get("/api/lectures", (req, res) => {
  res.json(load().lectures.map(({ id, title, createdAt }) => ({ id, title, createdAt })).reverse());
});

app.get("/api/lectures/:id", (req, res) => {
  const lec = load().lectures.find((l) => l.id === req.params.id);
  lec ? res.json(publicLec(lec)) : res.status(404).json({ error: "Not found" });
});

app.post("/api/lectures", async (req, res) => {
  try {
    const { title, filename, mime, data } = req.body;
    if (!data) return res.status(400).json({ error: "No file uploaded" });
    const fileId = randomUUID();
    fs.writeFileSync(path.join("uploads", fileId), Buffer.from(data, "base64"));
    const lec = {
      id: randomUUID(),
      title: title || filename || "Untitled lecture",
      fileId,
      mime: mime || "application/pdf",
      createdAt: Date.now(),
      summary: [],
      flashcards: [],
      comments: [],
    };
    Object.assign(lec, await generateStudyKit(lec));
    const db = load();
    db.lectures.push(lec);
    save(db);
    res.json(publicLec(lec));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Processing failed: " + e.message });
  }
});

// Chatbot grounded ONLY in this lecture
app.post("/api/lectures/:id/chat", async (req, res) => {
  try {
    const lec = load().lectures.find((l) => l.id === req.params.id);
    if (!lec) return res.status(404).json({ error: "Not found" });
    const { message, history = [] } = req.body;
    const contents = [
      { role: "user", parts: [...lectureParts(lec), { text: "This is the lecture material. Answer only from it." }] },
      { role: "model", parts: [{ text: "Understood. Ask me anything about this lecture." }] },
      ...history.map((h) => ({ role: h.role === "user" ? "user" : "model", parts: [{ text: h.text }] })),
      { role: "user", parts: [{ text: message }] },
    ];
    const r = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction:
          "You are a friendly tutor for ONE lecture. Answer strictly using the provided lecture material. " +
          "If the answer is not in it, say you can't find it in this lecture instead of guessing. " +
          "Explain simply with short examples when asked, and mention slide/page numbers when you can.",
      },
    });
    res.json({ reply: r.text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/lectures/:id/comments", (req, res) => {
  const db = load();
  const lec = db.lectures.find((l) => l.id === req.params.id);
  if (!lec) return res.status(404).json({ error: "Not found" });
  const author = String(req.body.author || "").trim().slice(0, 40) || "Anonymous";
  const text = String(req.body.text || "").trim().slice(0, 1000);
  if (!text) return res.status(400).json({ error: "Empty comment" });
  const c = { id: randomUUID(), author, text, parentId: req.body.parentId || null, at: Date.now() };
  lec.comments.push(c);
  save(db);
  res.json(c);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`NoteSync AI running on http://localhost:${PORT}  (open this in your browser)`));
