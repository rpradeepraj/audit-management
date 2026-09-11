import http from "http";
import app from "./app";

const PORT = parseInt(process.env.PORT || process.env.BACKEND_PORT || "5001", 10);
const HOST = process.env.HOST || "0.0.0.0";

const server = http.createServer(app);

server.listen(PORT, HOST, () => {
  console.log(`
=====================================================
🚀 Express.js API Server Running
📡 URL: http://localhost:${PORT}
🔍 Health: http://localhost:${PORT}/health
📋 API Base: http://localhost:${PORT}/api
⏱️ Started: ${new Date().toISOString()}
=====================================================
  `);
});

// Graceful shutdown handling
const handleShutdown = (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down Express server gracefully...`);
  server.close(() => {
    console.log("Express HTTP server closed.");
    process.exit(0);
  });

  // Force close after 10s if hung
  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

export default server;
