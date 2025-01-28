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

const chatUserSocketMap: Record<string, string> = {}; 
const videoUserSocketMap: Record<string, string> = {};

export function getReceiverSocketId(userId: string): string | undefined {
  return chatUserSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  
  socket.on("setup", (payload: { userId: string; appType: "chat" | "video" }) => {
    const { userId, appType } = payload;

    if (appType === "chat") {
      chatUserSocketMap[userId] = socket.id;
      console.log(`[Chat] User ${userId} is mapped to socketId ${socket.id}`);
    } else if (appType === "video") {
      videoUserSocketMap[userId] = socket.id;
      console.log(`[Video] User ${userId} is mapped to socketId ${socket.id}`);
      console.log('videomap',videoUserSocketMap);
      
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);

    const chatUserId = Object.keys(chatUserSocketMap).find(
      (key) => chatUserSocketMap[key] === socket.id
    );
    if (chatUserId) {
      delete chatUserSocketMap[chatUserId];
      console.log(`[Chat] Removed user ${chatUserId} from chat map`);
    }

    const videoUserId = Object.keys(videoUserSocketMap).find(
      (key) => videoUserSocketMap[key] === socket.id
    );
    if (videoUserId) {
      delete videoUserSocketMap[videoUserId];
      console.log(`[Video] Removed user ${videoUserId} from video map`);
    }
  });
});

export { io, server, app };