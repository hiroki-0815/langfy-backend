// lib/socket.ts
import { Server } from "socket.io";
import http from "http";
import express from "express";

// If your server.ts already creates app, you can import from there.
// Or do it here if you'd like:
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // or your frontend URL
  },
});

// userSocketMap: track which user is mapped to which socket ID
const userSocketMap: Record<string, string> = {};

// Utility function to get the receiver's socket
export function getReceiverSocketId(userId: string): string | undefined {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Expect a "setup" event from client with the user's ID
  socket.on("setup", (userId: string) => {
    userSocketMap[userId] = socket.id;
    console.log(`UserId ${userId} is mapped to socketId ${socket.id}`);
  });

  // On disconnect, remove from userSocketMap
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);

    // Find which user had this socket
    const userId = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === socket.id
    );
    if (userId) {
      delete userSocketMap[userId];
    }
  });
});

export { io, server, app };
