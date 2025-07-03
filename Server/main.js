const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { exec } = require("child_process");
const fs = require("fs");
const ACTIONS = require("../Client/src/Actions.js");
const mongoose = require("mongoose");
require("dotenv").config();
const axios = require("axios");

// Define PORT at the top
const PORT = process.env.PORT || 5000;

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_ORIGIN || "https://your-frontend-url.vercel.app",
];
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true,
};
app.use(require("cors")(corsOptions));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://code-collab-kx9xsnz1b-mithilesh11705s-projects.vercel.app",
            "https://your-custom-domain.com",
          ]
        : "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  upgrade: false,
  forceNew: true,
  path: "/socket.io",
});

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Favicon endpoint to prevent 404 errors
app.get("/favicon.ico", (req, res) => {
  res.status(204).end(); // No content
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "This endpoint does not exist",
  });
});

// Remove static file serving since this is backend-only
// The frontend will be deployed separately

const userSocketMap = {};

function getAllConnectedClients(roomId) {
  // Get unique socket IDs from the room
  const socketIds = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
  // Create a Set to store unique usernames
  const uniqueUsernames = new Set();
  // Map socket IDs to client objects, ensuring no duplicates
  return socketIds
    .map((socketId) => ({
      socketId,
      username: userSocketMap[socketId],
    }))
    .filter((client) => {
      // Only include if username is not already in the Set
      if (uniqueUsernames.has(client.username)) {
        return false;
      }
      uniqueUsernames.add(client.username);
      return true;
    });
}

function executeCppCode(code, socket) {
  const fileName = `temp_${Date.now()}.cpp`;
  const filePath = path.join(tempDir, fileName);
  const outputPath = path.join(tempDir, `${fileName}.out`);

  // Write code to file
  fs.writeFileSync(filePath, code);

  // Compile the code
  exec(
    `g++ ${filePath} -o ${outputPath}`,
    (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        socket.emit("cpp_output", { error: compileStderr });
        return;
      }

      // Execute the compiled program
      exec(outputPath, (execError, execStdout, execStderr) => {
        // Clean up files
        fs.unlinkSync(filePath);
        fs.unlinkSync(outputPath);

        if (execError) {
          socket.emit("cpp_output", { error: execStderr });
          return;
        }

        socket.emit("cpp_output", { output: execStdout });
      });
    }
  );
}

// Start the server only if not in Vercel environment
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;

function executePythonCode(code, socket) {
  const fileName = `temp_${Date.now()}.py`;
  const filePath = path.join(tempDir, fileName);

  // Write code to file
  fs.writeFileSync(filePath, code);

  // Execute the Python code
  exec(`python ${filePath}`, (error, stdout, stderr) => {
    // Clean up file
    fs.unlinkSync(filePath);

    if (error) {
      socket.emit("python_output", { error: stderr });
      return;
    }

    socket.emit("python_output", { output: stdout });
  });
}

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on(ACTIONS.JOIN, async ({ roomId, username }) => {
    // Add user to room in DB
    let room = await Room.findOne({ roomId });
    if (!room) {
      room = await Room.create({
        roomId,
        participants: [{ username, socketId: socket.id }],
        chatHistory: [],
      });
    } else {
      // Avoid duplicate participants
      if (!room.participants.some((p) => p.username === username)) {
        room.participants.push({ username, socketId: socket.id });
      } else {
        // Update socketId if user rejoins
        room.participants = room.participants.map((p) =>
          p.username === username ? { ...p.toObject(), socketId: socket.id } : p
        );
      }
      room.updatedAt = new Date();
      await room.save();
    }
    socket.join(roomId);
    // Send current state to the joining user
    socket.emit(ACTIONS.JOINED, {
      clients: room.participants,
      username,
      socketId: socket.id,
      chatHistory: room.chatHistory,
    });
    // Notify others
    socket.to(roomId).emit(ACTIONS.JOINED, {
      clients: room.participants,
      username,
      socketId: socket.id,
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ roomId, socketId }) => {
    // Get the code from the specified user and send it to the requesting user
    const targetSocket = io.sockets.sockets.get(socketId);
    if (targetSocket) {
      // Request code from the target user
      targetSocket.emit(ACTIONS.SYNC_CODE, { roomId, socketId: socket.id });
    }
  });

  socket.on(ACTIONS.CHAT, async ({ roomId, username, message, recipient }) => {
    const room = await Room.findOne({ roomId });
    if (!room) return;
    const chatMsg = {
      username,
      message,
      timestamp: new Date(),
      recipient: recipient || "everyone",
    };
    room.chatHistory.push(chatMsg);
    room.updatedAt = new Date();
    await room.save();
    if (!recipient || recipient === "everyone") {
      io.in(roomId).emit(ACTIONS.CHAT_MESSAGE, chatMsg);
    } else {
      const target = room.participants.find((p) => p.username === recipient);
      if (target) {
        [socket.id, target.socketId].forEach((sid) => {
          io.to(sid).emit(ACTIONS.CHAT_MESSAGE, chatMsg);
        });
      }
    }
  });

  socket.on("execute_cpp", ({ code }) => {
    executeCppCode(code, socket);
  });

  socket.on("execute_python", ({ code }) => {
    executePythonCode(code, socket);
  });

  socket.on("disconnecting", async () => {
    const rooms = [...socket.rooms];
    for (const roomId of rooms) {
      const room = await Room.findOne({ roomId });
      if (room) {
        // Find the leaving user BEFORE removing them
        const leavingUser = room.participants.find(
          (p) => p.socketId === socket.id
        );
        // Remove participant
        room.participants = room.participants.filter(
          (p) => p.socketId !== socket.id
        );
        room.updatedAt = new Date();
        await room.save();
        // Notify others
        socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
          socketId: socket.id,
          username: leavingUser ? leavingUser.username : undefined,
        });
        // Delete room if empty
        if (room.participants.length === 0) {
          await Room.deleteOne({ roomId });
        }
      }
    }
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

// MongoDB connection
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/codecollab",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  participants: [
    {
      username: String,
      socketId: String,
    },
  ],
  chatHistory: [
    {
      username: String,
      message: String,
      timestamp: Date,
      recipient: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Room = mongoose.model("Room", roomSchema);

// AI Code Completion & Debugging Endpoint
app.post("/api/ai/complete", async (req, res) => {
  try {
    // Optional: restrict to frontend origin
    const allowedOrigin =
      process.env.FRONTEND_ORIGIN || "http://localhost:3000";
    if (req.headers.origin && req.headers.origin !== allowedOrigin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { prompt, type } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    // Choose model based on type (completion or debug)
    const model =
      type === "debug" ? "openai/gpt-3.5-turbo" : "openai/gpt-3.5-turbo";
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model,
        messages: [
          {
            role: "system",
            content:
              type === "debug"
                ? "You are a helpful code debugger. Explain and fix bugs in the following code."
                : "You are a helpful code completion assistant. Complete the following code.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 512,
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const aiMessage = response.data.choices?.[0]?.message?.content || "";
    res.json({ result: aiMessage });
  } catch (err) {
    console.error("AI API error:", err?.response?.data || err.message);
    res.status(500).json({
      error: "AI service error",
      details: err?.response?.data || err.message,
    });
  }
});
