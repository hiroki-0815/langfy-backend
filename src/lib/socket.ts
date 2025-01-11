import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

const userSocketMap: Record<string, string> = {};

export function getReceiverSocketId(userId: string): string | undefined {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("setup", (userId: string) => {
    userSocketMap[userId] = socket.id;
    console.log(`UserId ${userId} is mapped to socketId ${socket.id}`);
  });

  socket.on("join-room", (roomId, userId) => {
    console.log(`a new user ${userId} joined room ${roomId}`);
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-connected', userId)
  })

  socket.on('user-toggle-audio',(userId, roomId)=>{
    console.log(`a user ${userId} toggle audio`);
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-toggle-audio', userId)
  })

  socket.on('user-toggle-video',(userId, roomId)=>{
    console.log(`a user ${userId} toggle video`);
    socket.join(roomId)
    socket.broadcast.to(roomId).emit('user-toggle-video', userId)
  })

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);

    const userId = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === socket.id
    );
    if (userId) {
      delete userSocketMap[userId];
    }
  });
});

export { io, server, app };