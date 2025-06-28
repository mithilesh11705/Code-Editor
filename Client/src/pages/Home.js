import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();
  const roomRef = useRef(null);
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createNewRoom = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const id = Math.floor(1000 + Math.random() * 9000);
    setRoomId(id);
    toast.success("Created a new room!");
    setTimeout(() => setIsLoading(false), 1000);
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Room ID and username are required");
      return;
    }
    setIsLoading(true);
    // Redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  const copyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied to clipboard!");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.98,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`,
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          className="w-full max-w-md space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div className="text-center space-y-4" variants={itemVariants}>
            <div className="flex items-center justify-center space-x-3 mb-6">
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </motion.div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                CodeCollab
              </h1>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">
              Real-time collaborative coding platform for teams
            </p>
            <p className="text-gray-400 text-sm">
              Create or join a room to start coding together instantly
            </p>
          </motion.div>

          {/* Form Card */}
          <motion.div className="card space-y-6" variants={itemVariants}>
            {/* Room ID Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">
                Room ID
              </label>
              <div className="flex space-x-2">
                <input
                  ref={roomRef}
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyUp={handleInputEnter}
                  className="input-field flex-1"
                  placeholder="Enter room ID"
                  type="text"
                />
                {roomId && (
                  <motion.button
                    onClick={copyRoomId}
                    className="btn-secondary px-3 flex items-center justify-center"
                    title="Copy Room ID"
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </motion.button>
                )}
              </div>
            </div>

            {/* Username Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">
                Your Name
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyUp={handleInputEnter}
                className="input-field"
                placeholder="Enter your name"
                type="text"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <motion.button
                onClick={joinRoom}
                disabled={isLoading}
                className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
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
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                )}
                <span>Join Room</span>
              </motion.button>
              <motion.button
                onClick={createNewRoom}
                disabled={isLoading}
                className="btn-secondary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>Create Room</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            className="grid grid-cols-1 gap-4 pt-8"
            variants={itemVariants}
          >
            <motion.div
              className="flex items-center space-x-3 text-gray-400"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Real-time collaboration</span>
            </motion.div>
            <motion.div
              className="flex items-center space-x-3 text-gray-400"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Multiple programming languages</span>
            </motion.div>
            <motion.div
              className="flex items-center space-x-3 text-gray-400"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm">Live code execution</span>
            </motion.div>
            <motion.div
              className="flex items-center space-x-3 text-gray-400"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Instant room creation</span>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.div className="text-center pt-8" variants={itemVariants}>
            <p className="text-gray-500 text-xs">
              Built with React, Socket.io, and CodeMirror
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
