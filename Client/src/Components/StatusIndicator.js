import React from "react";
import { motion } from "framer-motion";

const StatusIndicator = ({ status = "connected", type = "connection" }) => {
  const statusConfig = {
    connection: {
      connected: { color: "bg-green-500", text: "Connected" },
      connecting: { color: "bg-yellow-500", text: "Connecting" },
      disconnected: { color: "bg-red-500", text: "Disconnected" },
    },
    execution: {
      idle: { color: "bg-gray-500", text: "Ready" },
      running: { color: "bg-blue-500", text: "Running" },
      success: { color: "bg-green-500", text: "Success" },
      error: { color: "bg-red-500", text: "Error" },
    },
  };

  const config = statusConfig[type][status] || statusConfig[type].idle;

  return (
    <motion.div
      className="flex items-center space-x-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center space-x-1">
        <motion.div
          className={`w-2 h-2 ${config.color} rounded-full`}
          animate={status === "running" ? { scale: [1, 1.2, 1] } : {}}
          transition={
            status === "running" ? { duration: 1, repeat: Infinity } : {}
          }
        />
        <span className="text-xs text-gray-400">{config.text}</span>
      </div>
    </motion.div>
  );
};

export default StatusIndicator;
