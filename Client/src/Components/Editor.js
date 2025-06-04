import React, { useEffect, useRef, useState } from "react";
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

const Editor = ({ clients, socketRef, roomId, onCodeChange }) => {
  const reactNavigator = useNavigate();
  const editorRef = useRef(null);
  const [language, setLanguage] = useState("javascript");

  const modeOptions = {
    javascript: { name: "javascript", json: true },
    python: { name: "python" },
    html: { name: "xml" },
    css: { name: "css" },
    cpp: { name: "text/x-c++src" },
  };

  const defaultCode = {
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
  };

  useEffect(() => {
    let editor = null;
    async function init() {
      // Clean up previous instance if it exists
      if (editorRef.current) {
        editorRef.current.toTextArea();
      }

      editor = Codemirror.fromTextArea(
        document.getElementById("realtimeEditorr"),
        {
          mode: modeOptions[language],
          theme: "3024-night",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );
      editorRef.current = editor;
      editor.setValue(defaultCode[language]);
      editor.getWrapperElement().classList.add("CodeMirror-linenumbers");
      editor.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    }
    init();

    // Cleanup function
    return () => {
      if (editorRef.current) {
        editorRef.current.toTextArea();
        editorRef.current = null;
      }
    };
  }, [language]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(ACTIONS.CODE_CHANGE);
      }
    };
  }, [socketRef.current]);

  function leaveRoom() {
    reactNavigator("/");
  }

  const handleRunCode = () => {
    const code = editorRef.current.getValue();
    switch (language) {
      case "javascript":
        try {
          const originalLog = console.log;
          console.log = function (...value) {
            originalLog.apply(console, value);
            return value;
          };
          const result = eval(code);
          document.getElementById("result").innerText = result;
        } catch (e) {
          console.error(e);
          document.getElementById("result").innerText = `Error: ${e.message}`;
        }
        break;
      case "python":
        document.getElementById("result").innerText = "Running Python code...";
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
        break;
      case "css":
        document.getElementById("result").innerText =
          "CSS preview is not supported in this version.";
        break;
      case "cpp":
        document.getElementById("result").innerText =
          "Compiling and running C++ code...";
        socketRef.current.emit("execute_cpp", { code });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("cpp_output", ({ output, error }) => {
        const resultDiv = document.getElementById("result");
        if (error) {
          resultDiv.innerText = `Compilation Error:\n${error}`;
        } else {
          resultDiv.innerText = `Output:\n${output}`;
        }
      });

      socketRef.current.on("python_output", ({ output, error }) => {
        const resultDiv = document.getElementById("result");
        if (error) {
          resultDiv.innerText = `Error:\n${error}`;
        } else {
          resultDiv.innerText = `Output:\n${output}`;
        }
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off("cpp_output");
        socketRef.current.off("python_output");
      }
    };
  }, [socketRef.current]);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 grid grid-cols-2">
        <div
          id="bg"
          className="d border-r border-muted p-6 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              <a href="https://editor-4hda.vercel.app/">Code Editor</a>
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-800 text-white px-3 py-2 rounded-md"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="html">HTML</option>
                <option value="css">CSS</option>
                <option value="cpp">C++</option>
              </select>
              <button
                id="btn"
                onClick={handleRunCode}
                className="text-white inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <polygon points="6 3 20 12 6 21 6 3"></polygon>
                </svg>
                <span className="sr-only">Run code</span>
              </button>
              <button
                id="btn"
                onClick={leaveRoom}
                className="text-white inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line x1="10" x2="10" y1="11" y2="17"></line>
                  <line x1="14" x2="14" y1="11" y2="17"></line>
                </svg>
                <span className="sr-only">Clear editor</span>
              </button>
            </div>
          </div>
          <textarea
            id="realtimeEditorr"
            className="flex min-h-[80px] w-full bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex-1 resize-none border border-muted rounded-md p-4 focus:outline-none focus:ring-1 focus:ring-primary"
          ></textarea>
        </div>
        <div id="bg" className="bg-background p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-semibold">Output Preview</h2>
          </div>
          <div id="bgg" className="bg-muted rounded-md flex-1 overflow-auto">
            <div id="result"></div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {clients.map((client) => (
              <div key={client.socketId} className="flex items-center gap-2">
                <Avatar name={client.username} size={25} round="5px" />
                <span className="text-white">{client.username}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
