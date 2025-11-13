// server/index.js
import express from "express";
import fs from "fs";
import path, { dirname } from "path";
import bodyParser from "body-parser";
import cors from "cors";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.urlencoded({extended: true }));
app.use(express.json());
// app.use(bodyParser.json());
const __filename = fileURLToPath(import.meta.url);
export const _dirname = path.dirname(__filename);

const DATA_DIR = path.join(_dirname, "data");
const CONV_FILE = path.join(DATA_DIR, "conversations.json");
const SCRIPTS_DIR = path.join(_dirname, "scripts");

// ensure directories and files
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(CONV_FILE))
  fs.writeFileSync(CONV_FILE, JSON.stringify([], null, 2));
if (!fs.existsSync(SCRIPTS_DIR)) fs.mkdirSync(SCRIPTS_DIR, { recursive: true });

// Utility to read/write conversations
function readConversations() {
  try {
    return JSON.parse(fs.readFileSync(CONV_FILE, "utf8")) || [];
  } catch (e) {
    return [];
  }
}
function writeConversations(arr) {
  fs.writeFileSync(CONV_FILE, JSON.stringify(arr, null, 2));
}

// Serve script: e.g., GET /api/script/sarah
app.get("/api/script/:name", (req, res) => {
  const name = req.params.name;
  const file = path.join(SCRIPTS_DIR, `${name}.json`);
  if (!fs.existsSync(file))
    return res.status(404).json({ error: "script not found" });
  res.sendFile(file);
});

// Save a message (append to conversation)
app.post("/api/conversation/save", (req, res) => {
  const { conversationId, message } = req.body;
  if (!conversationId || !message)
    return res.status(400).json({ error: "missing fields" });

  const convs = readConversations();
  let conv = convs.find((c) => c.id === conversationId);
  if (!conv) {
    conv = {
      id: conversationId,
      messages: [],
      startedAt: new Date().toISOString(),
      endedAt: null,
      agents: {
        observer:
          "Observer Agent monitored the conversation for sentiment and keywords.",
        decision:
          "Decision Agent determined the user's intent and selected the appropriate response.",
        action:
          "Action Agent executed the response and provided the user with the requested information.",
        learning:
          "Learning Agent analyzed the conversation to improve future interactions.",
      },
    };
    convs.push(conv);
  }
  if (message.meta && message.meta.endConversation && !message.text) {
    conv.endedAt = new Date().toISOString();
    writeConversations(convs);
    return res.json({ ok: true, ended: true });
  }

  const msg = { ...message, at: new Date().toISOString() };
  conv.messages.push(msg);
  if (message.meta && message.meta.endConversation)
    conv.endedAt = new Date().toISOString();
  writeConversations(convs);
  res.json({ ok: true });
});

// Get all conversations
app.get("/api/admin/conversations", (req, res) => {
  const convs = readConversations();
  res.json(convs);
});

// Generate static confidence trend data on server start
const confidenceTrend = Array.from(
  { length: 10 },
  () => Math.random() * (0.9 - 0.7) + 0.7
);

// Simple analytics endpoint
app.get("/api/admin/analytics", (req, res) => {
  const convs = readConversations();
  const total = convs.length;
  const avgMessages = total
    ? convs.reduce((s, c) => s + c.messages.length, 0) / total
    : 0;

  const resolved = convs.filter((c) => c.endedAt !== null).length;

  res.json({
    totalConversations: total,
    avgMessages: Number(avgMessages.toFixed(2)),
    resolved,
    confidenceTrend, // Return the static data
  });
});

// Basic server info
// app.get("/", (req, res) =>
//   res.json({ ok: true, note: "Agentic prototype API" })
// );

// frontend
// Serve frontend for any other routes (use '/*' to avoid path-to-regexp errors)
app.use(express.static(path.join(_dirname, './build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(_dirname,'./build/index.html'));
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));


