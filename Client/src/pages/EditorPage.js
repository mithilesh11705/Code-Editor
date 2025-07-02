import React, { useState, useRef, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import ACTIONS from "../Actions";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import { initSocket } from "../socket";
import Editor from "../Components/Editor";
import {
  useLocation,
  Navigate,
  useParams,
  useNavigate,
} from "react-router-dom";
import Chat from "../Components/Chat";

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
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [recipient, setRecipient] = useState("everyone");
  const navigate = useNavigate();

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
            ({ clients, username, socketId, chatHistory }) => {
              console.log("Joined room with clients:", clients);
              setClients(clients);
              if (Array.isArray(chatHistory)) {
                setChatMessages(chatHistory);
              }
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

          // Chat message event
          socketRef.current.on(
            ACTIONS.CHAT_MESSAGE,
            ({ username, message, timestamp }) => {
              setChatMessages((prev) => [
                ...prev,
                { username, message, timestamp },
              ]);
            }
          );
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

  const sendChatMessage = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (!chatInput.trim()) return;
    socketRef.current.emit(ACTIONS.CHAT, {
      roomId,
      username: location.state?.username,
      message: chatInput,
      recipient,
    });
    setChatInput("");
  };

  const handleExitRoom = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    navigate("/");
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/editor/${roomId}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard!");
  };

  const handleCodeChange = useCallback((code) => {
    codeRef.current = code;
  }, []);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <div className="flex-1 relative">
        <button
          onClick={handleExitRoom}
          className="absolute top-6 right-8 z-20 btn-secondary px-4 py-2 text-sm font-semibold hover:bg-red-500 hover:text-white transition shadow-lg"
          title="Exit Room"
        >
          Exit Room
        </button>
        <button
          onClick={handleCopyInviteLink}
          className="absolute top-6 right-40 z-20 btn-primary px-4 py-2 text-sm font-semibold shadow-lg"
          title="Copy Invite Link"
        >
          Copy Invite Link
        </button>
        <Editor
          clients={clients}
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={handleCodeChange}
          username={location.state?.username}
        />
      </div>
      <Chat
        messages={chatMessages}
        input={chatInput}
        setInput={setChatInput}
        onSend={sendChatMessage}
        username={location.state?.username}
        clients={clients}
        recipient={recipient}
        setRecipient={setRecipient}
      />
    </div>
  );
};

export default EditorPage;
