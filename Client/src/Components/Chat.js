import React, { useRef, useEffect } from "react";

const Chat = ({
  messages,
  input,
  setInput,
  onSend,
  username,
  clients,
  recipient,
  setRecipient,
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-surface/80 border-l border-border shadow-2xl w-full max-w-sm min-w-[320px] glass-effect rounded-l-3xl m-2 mb-4 overflow-hidden backdrop-blur-lg">
      <div className="flex items-center px-6 py-4 border-b border-border bg-surface-light/80 rounded-tl-3xl">
        <span className="font-semibold text-lg text-primary">Room Chat</span>
      </div>
      <div className="flex flex-col gap-2 px-6 pt-3 pb-0 bg-surface-light/80 border-b border-border">
        <label
          className="text-xs text-text-muted font-medium mb-1"
          htmlFor="recipient-select"
        >
          Send message to:
        </label>
        <select
          id="recipient-select"
          className="input-field w-full text-sm bg-gray-900 text-white border border-primary/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary shadow appearance-none"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        >
          <option value="everyone">Everyone</option>
          {clients
            .filter((c) => c.username && c.username !== username)
            .map((c) => (
              <option
                key={c.socketId}
                value={c.username}
                className="bg-gray-900 text-white"
              >
                {c.username}
              </option>
            ))}
        </select>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-3 space-y-3 bg-surface/70 fade-in chat-scrollbar">
        {messages.length === 0 && (
          <div className="text-text-muted text-center mt-8">
            No messages yet.
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              msg.username === username ? "items-end" : "items-start"
            }`}
          >
            <div className="flex items-center mb-1 gap-2">
              <span
                className={`font-bold text-sm ${
                  msg.username === username
                    ? "text-primary"
                    : "text-text-primary"
                }`}
              >
                {msg.username}
              </span>
              <span className="ml-0 text-xs text-text-muted">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {msg.recipient && msg.recipient !== "everyone" && (
                <span className="ml-1 px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-semibold">
                  to {msg.recipient === username ? "You" : msg.recipient}
                </span>
              )}
              {msg.recipient === "everyone" && (
                <span className="ml-1 px-2 py-0.5 rounded bg-surface-light text-text-muted text-xs font-semibold">
                  to Everyone
                </span>
              )}
            </div>
            <div
              className={`rounded-2xl px-4 py-2 max-w-[80%] text-sm shadow-lg chat-bubble ${
                msg.username === username
                  ? "chat-bubble-user"
                  : "chat-bubble-other"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={onSend}
        className="flex items-center gap-2 p-4 border-t border-border bg-surface-light/80 rounded-bl-3xl"
        autoComplete="off"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message to ${
            recipient === "everyone" ? "Everyone" : recipient
          }`}
          className="flex-1 input-field focus:ring-2 focus:ring-primary focus:border-primary bg-gray-900 text-white rounded-xl px-4 py-2"
          aria-label="Type a message"
        />
        <button
          type="submit"
          className="btn-primary px-5 py-2 text-sm rounded-xl shadow-lg"
          disabled={!input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
