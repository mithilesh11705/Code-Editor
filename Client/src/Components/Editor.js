import React, { useEffect, useRef } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/theme/3024-night.css";
import "codemirror/addon/edit/closebrackets";
import ACTIONS from "../Actions";
import Avatar from "react-avatar";
import { useNavigate } from "react-router-dom";
const Editor = ({ clients, socketRef, roomId, onCodeChange }) => {
  const reactNavigator = useNavigate();
  const editorRef = useRef(null);
  const modeOptions = {
    javascript: { name: "javascript", json: true },
  };
  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("realtimeEditorr"),
        {
          mode: modeOptions.javascript,
          theme: "3024-night",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );
      editorRef.current
        .getWrapperElement()
        .classList.add("CodeMirror-linenumbers");
      editorRef.current.on("change", (instance, changes) => {
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
  }, []);
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);
  function leaveRoom() {
    reactNavigator("/");
  }
  const handleRunCode = () => {
    const code = editorRef.current.getValue();
    switch (editorRef.current.getOption("mode").name) {
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
        }
        break;
      default:
        break;
    }
  };
  return (
    <div class="flex flex-col h-screen">
      <div class="flex-1 grid grid-cols-2">
        <div
          id="bg"
          class="d border-r border-muted p-6 flex flex-col
gap-4"
        >
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-white">
              <a href="https://editor-4hda.vercel.app/">Code Editor</a>
            </h2>
            <div class="flex items-center gap-2">
              <button
                id="btn"
                onClick={handleRunCode}
                class="text-white inline-flex items-center
justify-center whitespace-nowrap rounded-md text-sm font-medium
ring-offset-background transition-colors focus-visible:outline-none
focus-visible:ring-2 focus-visible:ring-ring
focus-visible:ring-offset-2 disabled:pointer-events-none
disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10
w-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-5 w-5"
                >
                  <polygon points="6 3 20 12 6 21 6 3"></polygon>
                </svg>
                <span class="sr-only">Run code</span>
              </button>
              <button
                id="btn"
                onClick={leaveRoom}
                class="text-white inline-flex items-center
justify-center whitespace-nowrap rounded-md text-sm font-medium
ring-offset-background transition-colors focus-visible:outline-none
focus-visible:ring-2 focus-visible:ring-ring
focus-visible:ring-offset-2 disabled:pointer-events-none
disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10
w-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-5 w-5"
                >
                  <path d="M3 6h18"></path>
                  <path
                    d="M19 6v14c0 1-1 2-2 2H7c-1
0-2-1-2-2V6"
                  ></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line x1="10" x2="10" y1="11" y2="17"></line>
                  <line x1="14" x2="14" y1="11" y2="17"></line>
                </svg>
                <span class="sr-only">Clear editor</span>
              </button>
            </div>
          </div>
          <textarea
            id="realtimeEditorr"
            class="flex min-h-[80px] w-full bg-background text-sm
ring-offset-background placeholder:text-muted-foreground
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
focus-visible:ring-offset-2 disabled:cursor-not-allowed
disabled:opacity-50 flex-1 resize-none border border-muted rounded-md
p-4 focus:outline-none focus:ring-1 focus:ring-primary"
          ></textarea>
        </div>
        <div id="bg" class="bg-background p-6 flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h2 class="text-white text-xl font-semibold">Output Preview</h2>
          </div>
          <div
            id="bgg"
            class="bg-muted rounded-md flex-1
overflow-auto"
          >
            <div id="result"></div>
          </div>
          <div
            class="flex items-center gap-2 text-sm
text-muted-foreground"
          >
            {clients.map((client) => (
              <>
                <Avatar name={client.username} size={25} round="5px" />
                <span class="text-white">{client.username}</span>
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Editor;
