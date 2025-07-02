import { io } from "socket.io-client";

let socketInstance = null;

export const initSocket = () => {
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  const options = {
    "force new connection": true,
    reconnectionAttempts: 3,
    timeout: 10000,
    transports: ["websocket"],
    auth: {
      token: "your-token",
    },
    reconnection: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    upgrade: true,
    path: "/socket.io",
  };

  // Use environment variable for server URL or fallback to localhost
  const serverUrl = "https://real-time-code-editor-wy03.onrender.com";
    // process.env.REACT_APP_SERVER_URL ||
    // (process.env.NODE_ENV === "production"
    //   ? "https://real-time-code-editor-wy03.onrender.com" // Your actual backend URL
    //   : "http://localhost:5000");

  // If there's an existing instance, disconnect it first
  if (socketInstance) {
    socketInstance.disconnect();
  }

  socketInstance = io(serverUrl, options);

  socketInstance.connected = false;

  socketInstance.on("connect", () => {
    console.log("Socket connected successfully");
    socketInstance.connected = true;
  });

  socketInstance.on("disconnect", () => {
    console.log("Socket disconnected");
    socketInstance.connected = false;
  });

  socketInstance.on("connect_error", (err) => {
    console.error("Socket connection error:", err);
    socketInstance.connected = false;
  });

  return socketInstance;
};
