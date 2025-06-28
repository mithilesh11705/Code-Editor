import { io } from "socket.io-client";

export const initSocket = async () => {
  const options = {
    "force new connection": true,
    reconnectionAttempts: 5,
    timeout: 10000,
    transports: ["websocket", "polling"],
  };

  // Use environment variable for production, fallback to localhost for development
  const serverUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";
  return io(serverUrl, options);
};
