import { io } from "socket.io-client";

export const initSocket = async () => {
  const options = {
    "force new connection": true,
    reconnectionAttempts: 5,
    timeout: 10000,
    transports: ["websocket", "polling"],
  };
  return io("http://localhost:5000", options);
};
