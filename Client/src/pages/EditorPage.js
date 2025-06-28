import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import ACTIONS from "../Actions";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import { initSocket } from "../socket";
import Editor from "../Components/Editor";
import { useLocation, Navigate, useParams } from "react-router-dom";

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef =
    useRef(`// Example code to generate random number in Javascript
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max-min) + min);
}
// Function call
console.log("Random Number between 1 and 100 : " + randomNumber(1, 100));`);

  const location = useLocation();
  const { roomId } = useParams();
  const [clients, setClients] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitialized) return;

    const init = async () => {
      try {
        socketRef.current = await initSocket();

        // Set up error handlers
        const handleErrors = (e) => {
          console.log("socket error", e);
          toast.error("Socket connection failed, try again later.");
        };

        socketRef.current.on("connect_error", handleErrors);
        socketRef.current.on("connect_failed", handleErrors);

        // Join the room
        socketRef.current.emit(ACTIONS.JOIN, {
          roomId,
          username: location.state?.username,
        });

        // Set up event listeners
        const handleJoined = ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        };

        const handleDisconnected = ({ socketId, username }) => {
          toast.success(`${username} left the room.`);
          setClients((prev) => {
            return prev.filter((client) => client.socketId !== socketId);
          });
        };

        // Add event listeners
        socketRef.current.on(ACTIONS.JOINED, handleJoined);
        socketRef.current.on(ACTIONS.DISCONNECTED, handleDisconnected);

        // Mark as initialized
        setIsInitialized(true);

        // Return cleanup function
        return () => {
          if (socketRef.current) {
            socketRef.current.off("connect_error", handleErrors);
            socketRef.current.off("connect_failed", handleErrors);
            socketRef.current.off(ACTIONS.JOINED, handleJoined);
            socketRef.current.off(ACTIONS.DISCONNECTED, handleDisconnected);
            socketRef.current.disconnect();
          }
        };
      } catch (error) {
        console.error("Failed to initialize socket:", error);
        toast.error("Failed to connect to the server.");
      }
    };

    const cleanup = init();

    // Cleanup function for the effect
    return () => {
      cleanup.then((cleanupFn) => {
        if (cleanupFn) cleanupFn();
      });
      setIsInitialized(false);
    };
  }, [roomId, location.state?.username, isInitialized]);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <Editor
        clients={clients}
        socketRef={socketRef}
        roomId={roomId}
        onCodeChange={(code) => {
          codeRef.current = code;
        }}
      />
    </>
  );
};

export default EditorPage;
