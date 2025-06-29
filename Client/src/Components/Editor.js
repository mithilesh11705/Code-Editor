import React, { useEffect, useRef, useState, useMemo } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/xml/xml";
import "codemirror/mode/css/css";
import "codemirror/mode/clike/clike";
import "codemirror/addon/edit/closetag";
import "codemirror/theme/3024-night.css";
import "codemirror/addon/edit/closebrackets";
import ACTIONS from "../Actions";
import Avatar from "react-avatar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";
import StatusIndicator from "./StatusIndicator";

const Editor = ({ clients, socketRef, roomId, onCodeChange }) => {
  const reactNavigator = useNavigate();
  const editorRef = useRef(null);
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("// Output will appear here...");
  const handleCodeUpdateRef = useRef(null);

  const modeOptions = useMemo(
    () => ({
      javascript: { name: "javascript", json: true },
      python: { name: "python" },
      html: { name: "xml" },
      css: { name: "css" },
      cpp: { name: "text/x-c++src" },
    }),
    []
  );

  const languageIcons = useMemo(
    () => ({
      javascript: "⚡",
      python: "🐍",
      html: "🌐",
      css: "🎨",
      cpp: "⚙️",
    }),
    []
  );

  const defaultCode = useMemo(
    () => ({
      javascript: `// Example code to generate random number in Javascript
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max-min) + min);
}
// Function call
console.log("Random Number between 1 and 100 : " + randomNumber(1, 100));`,
      python: `# Example code to generate random number in Python
import random

def random_number(min_val, max_val):
    return random.randint(min_val, max_val)

# Function call
print(f"Random Number between 1 and 100: {random_number(1, 100)}")`,
      html: `<!DOCTYPE html>
<html>
<head>
    <title>Example</title>
</head>
<body>
    <h1>Hello World!</h1>
</body>
</html>`,
      css: `/* Example CSS */
body {
    background-color: #f0f0f0;
    font-family: Arial, sans-serif;
}

h1 {
    color: #333;
}`,
      cpp: `// Example C++ code
#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
    }),
    []
  );

  useEffect(() => {
    let editor = null;
    async function init() {
      // Wait for the DOM element to be available
      const textareaElement = document.getElementById("realtimeEditorr");
      if (!textareaElement) {
        console.log("Textarea element not found, retrying...");
        setTimeout(init, 100);
        return;
      }

      // Clean up previous instance if it exists
      if (editorRef.current) {
        editorRef.current.toTextArea();
      }

      try {
        editor = Codemirror.fromTextArea(textareaElement, {
          mode: modeOptions[language],
          theme: "3024-night",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
          lineWrapping: true,
          indentUnit: 2,
          tabSize: 2,
          indentWithTabs: false,
          extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Ctrl-/": "toggleComment",
            "Ctrl-F": "findPersistent",
            "Ctrl-H": "replace",
            "Ctrl-G": "jumpToLine",
          },
        });

        editorRef.current = editor;
        editor.setValue(defaultCode[language]);
        editor.getWrapperElement().classList.add("CodeMirror-linenumbers");

        // Listen for external code updates
        const handleCodeUpdate = (event) => {
          const { code } = event.detail;
          if (editor && code !== editor.getValue()) {
            editor.setValue(code);
          }
        };

        // Store the function reference for cleanup
        handleCodeUpdateRef.current = handleCodeUpdate;
        document.addEventListener("codeUpdate", handleCodeUpdate);

        editor.on("change", (instance, changes) => {
          const { origin } = changes;
          const code = instance.getValue();
          onCodeChange(code);

          // Only emit if the change is from user input, not from setValue
          if (origin !== "setValue" && socketRef.current) {
            socketRef.current.emit(ACTIONS.CODE_CHANGE, {
              roomId,
              code,
            });
          }
        });

        console.log("CodeMirror editor initialized successfully");
      } catch (error) {
        console.error("Error initializing CodeMirror:", error);
      }
    }

    init();

    // Cleanup function
    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.toTextArea();
        } catch (error) {
          console.error("Error cleaning up editor:", error);
        }
        editorRef.current = null;
      }
      // Remove event listener using the stored reference
      if (handleCodeUpdateRef.current) {
        document.removeEventListener("codeUpdate", handleCodeUpdateRef.current);
        handleCodeUpdateRef.current = null;
      }
    };
  }, [language, defaultCode, modeOptions, onCodeChange, roomId, socketRef]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (socketRef.current) {
      const handleCppOutput = ({ output, error }) => {
        if (error) {
          setOutput(`Compilation Error:\n${error}`);
        } else {
          setOutput(`Output:\n${output}`);
        }
        setIsRunning(false);
      };

      const handlePythonOutput = ({ output, error }) => {
        if (error) {
          setOutput(`Error:\n${error}`);
        } else {
          setOutput(`Output:\n${output}`);
        }
        setIsRunning(false);
      };

      const currentSocket = socketRef.current;
      currentSocket.on("cpp_output", handleCppOutput);
      currentSocket.on("python_output", handlePythonOutput);

      return () => {
        if (currentSocket) {
          currentSocket.off("cpp_output", handleCppOutput);
          currentSocket.off("python_output", handlePythonOutput);
        }
      };
    }
  }, []); // Empty dependency array to run only once

  function leaveRoom() {
    reactNavigator("/");
  }

  const handleRunCode = () => {
    const code = editorRef.current.getValue();
    setIsRunning(true);
    setOutput("Running code...");

    switch (language) {
      case "javascript":
        try {
          const originalLog = console.log;
          let outputText = "";
          console.log = function (...value) {
            originalLog.apply(console, value);
            outputText += value.join(" ") + "\n";
          };
          // eslint-disable-next-line no-eval
          const result = eval(code);
          if (result !== undefined) {
            outputText += result + "\n";
          }
          setOutput(outputText || "Code executed successfully!");
        } catch (e) {
          setOutput(`Error: ${e.message}`);
        }
        setIsRunning(false);
        break;
      case "python":
        setOutput("Running Python code...");
        socketRef.current.emit("execute_python", { code });
        break;
      case "html":
        const iframe = document.createElement("iframe");
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.border = "none";
        const resultDiv = document.getElementById("result");
        resultDiv.innerHTML = "";
        resultDiv.appendChild(iframe);
        iframe.contentDocument.open();
        iframe.contentDocument.write(code);
        iframe.contentDocument.close();
        setOutput("HTML rendered successfully!");
        setIsRunning(false);
        break;
      case "css":
        setOutput("CSS preview is not supported in this version.");
        setIsRunning(false);
        break;
      case "cpp":
        setOutput("Compiling and running C++ code...");
        socketRef.current.emit("execute_cpp", { code });
        break;
      default:
        setIsRunning(false);
        break;
    }
  };

  const clearOutput = () => {
    setOutput("// Output cleared");
    const resultDiv = document.getElementById("result");
    if (resultDiv) {
      resultDiv.innerHTML = "";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="glass-effect border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-white text-sm font-bold">CC</span>
              </motion.div>
              <h1 className="text-xl font-bold text-white">CodeCollab</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <span>Room:</span>
              <span className="bg-gray-700 px-2 py-1 rounded text-white font-mono">
                {roomId}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Status Indicators */}
            <StatusIndicator status="connected" type="connection" />
            <StatusIndicator
              status={isRunning ? "running" : "idle"}
              type="execution"
            />

            {/* Language Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-300 text-sm">Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-indigo-500 focus:outline-none text-sm"
              >
                <option value="javascript">JavaScript ⚡</option>
                <option value="python">Python 🐍</option>
                <option value="html">HTML 🌐</option>
                <option value="css">CSS 🎨</option>
                <option value="cpp">C++ ⚙️</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={handleRunCode}
                disabled={isRunning}
                className="btn-primary flex items-center space-x-2 px-4 py-2 text-sm disabled:opacity-50"
                title="Run Code"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isRunning ? (
                  <LoadingSpinner size="sm" text="" />
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <polygon points="6 3 20 12 6 21 6 3"></polygon>
                  </svg>
                )}
                <span>Run</span>
              </motion.button>

              <motion.button
                onClick={clearOutput}
                className="btn-secondary px-3 py-2 text-sm"
                title="Clear Output"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </motion.button>

              <motion.button
                onClick={leaveRoom}
                className="btn-secondary px-3 py-2 text-sm"
                title="Leave Room"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Connected Users */}
        <div className="flex items-center space-x-4 mt-3">
          <span className="text-gray-400 text-sm">Connected:</span>
          <div className="flex items-center space-x-2">
            {clients.map((client) => (
              <motion.div
                key={client.socketId}
                className="flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Avatar name={client.username} size={20} round="50%" />
                <span className="text-white text-sm">{client.username}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-2 gap-0">
        {/* Editor Panel */}
        <div className="flex flex-col bg-gray-900">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{languageIcons[language]}</span>
              <span className="text-white font-medium">
                {language.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>Real-time collaboration</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex-1 p-4">
            <textarea
              id="realtimeEditorr"
              className="w-full h-full bg-transparent border-0 outline-none resize-none"
            ></textarea>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex flex-col bg-gray-900">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-white font-medium">Output</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>Live execution</span>
              {isRunning && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
          <div className="flex-1 p-4">
            <div
              id="bgg"
              className="w-full h-full bg-gray-800 rounded-lg overflow-auto"
            >
              <pre
                id="result"
                className="text-green-400 font-mono text-sm p-4 whitespace-pre-wrap"
              >
                {output}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
