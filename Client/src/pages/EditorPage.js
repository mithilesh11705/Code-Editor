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
        socketRef.current = initSocket();

        // Set up event listeners
        const setupEventListeners = () => {
          // Room events
          socketRef.current.on(
            ACTIONS.JOINED,
            ({ clients, username, socketId }) => {
              console.log("Joined room with clients:", clients);
              setClients(clients);

              // If this is not the first user, request code sync from the first user
              if (clients.length > 1) {
                const firstClient = clients.find(
                  (client) => client.socketId !== socketId
                );
                if (firstClient) {
                  socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    roomId,
                    socketId: firstClient.socketId,
                  });
                }
              }
            }
          );

          socketRef.current.on(
            ACTIONS.DISCONNECTED,
            ({ socketId, username }) => {
              toast.success(`${username} left the room.`);
              setClients((prev) => {
                return prev.filter((client) => client.socketId !== socketId);
              });
            }
          );

          // Code sync events
          socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
            if (code && code !== codeRef.current) {
              codeRef.current = code;
              // Trigger editor update
              const event = new CustomEvent("codeUpdate", { detail: { code } });
              document.dispatchEvent(event);
            }
          });

          // Handle code sync requests - send current code to requesting user
          socketRef.current.on(ACTIONS.SYNC_CODE, ({ roomId, socketId }) => {
            socketRef.current.emit(ACTIONS.CODE_CHANGE, {
              roomId,
              code: codeRef.current,
            });
          });

          socketRef.current.on("cpp_output", ({ output, error }) => {
            // Output handling is done in Editor component
          });

          socketRef.current.on("python_output", ({ output, error }) => {
            // Output handling is done in Editor component
          });
        };

        // Wait for connection
        await new Promise((resolve, reject) => {
          const connectCallback = () => {
            console.log("Socket connected successfully");
            setupEventListeners();
            resolve();
          };

          const errorCallback = (err) => {
            console.error("Connection error:", err);
            reject(err);
          };

          // Set up connection listeners
          socketRef.current.on("connect", connectCallback);
          socketRef.current.on("connect_error", errorCallback);

          // If already connected, resolve immediately
          if (socketRef.current.connected) {
            connectCallback();
          }
        });

        // Join the room after successful connection
        socketRef.current.emit(ACTIONS.JOIN, {
          roomId,
          username: location.state?.username,
        });

        // Mark as initialized
        setIsInitialized(true);

        // Return cleanup function
        return () => {
          if (socketRef.current) {
            socketRef.current.removeAllListeners();
            socketRef.current.disconnect();
          }
        };
      } catch (error) {
        console.error("Failed to initialize socket:", error);
        toast.error("Failed to connect to the server. Please try again.");
      }
    };

    init();
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
