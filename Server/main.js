const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { exec } = require("child_process");
const fs = require("fs");
const ACTIONS = require("../Client/src/Actions.js");

// Define PORT at the top
const PORT = process.env.PORT || 5000;

const app = express();

// Enhanced CORS configuration for production
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://code-collab-kx9xsnz1b-mithilesh11705s-projects.vercel.app",
            "https://your-custom-domain.com",
          ]
        : ["http://localhost:3000", "http://localhost:5000"],
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  })
);

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
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    socket.to(roomId).emit(ACTIONS.JOINED, {
      clients,
      username,
      socketId: socket.id,
    });
    socket.emit(ACTIONS.JOINED, {
      clients,
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
  socket.on(ACTIONS.CHAT, ({ roomId, username, message, recipient }) => {
    if (!recipient || recipient === "everyone") {
      io.in(roomId).emit(ACTIONS.CHAT_MESSAGE, {
        username,
        message,
        timestamp: new Date().toISOString(),
        recipient: "everyone",
      });
    } else {
      // Find the socketId of the recipient
      const clients = getAllConnectedClients(roomId);
      const target = clients.find((c) => c.username === recipient);
      if (target) {
        // Send to recipient and sender only
        [socket.id, target.socketId].forEach((sid) => {
          io.to(sid).emit(ACTIONS.CHAT_MESSAGE, {
            username,
            message,
            timestamp: new Date().toISOString(),
            recipient,
          });
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
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});
