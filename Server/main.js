const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { exec } = require("child_process");
const fs = require("fs");
const ACTIONS = require("../Client/src/Actions.js");
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5000"],
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
});

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

app.use(express.static(path.join(__dirname, "../Client/my-app/build")));
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "../Client/my-app/build", "index.html"));
});
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
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
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
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
