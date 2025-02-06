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
const allKnownOffers: Record<string, any> = {};

export function getReceiverSocketId(userId: string): string | undefined {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("setup", (userId: string) => {
    userSocketMap[userId] = socket.id;
    console.log(`UserId ${userId} is mapped to socketId ${socket.id}`);
  });

  socket.on("newAnswer", ({ answer, callerId, offerId }) => {
    console.log("📩 Received newAnswer:", answer);
  
    if (!callerId) {
      console.error("❌ Missing callerId in newAnswer event.");
      return;
    }
  
    const callerSocketId = userSocketMap[callerId];
  
    if (callerSocketId) {
      io.to(callerSocketId).emit("answerToClient", { answer, offerId });
      console.log(`📞 Sent answerToClient to caller ${callerId} at socket ${callerSocketId}`);
    } else {
      console.warn(`⚠️ Caller ${callerId} not found in userSocketMap.`);
    }
  
    if (allKnownOffers[offerId]) {
      allKnownOffers[offerId].answer = answer; 
      console.log('SUCCESS !! knownOffer',allKnownOffers[offerId]);
    } else {
      console.warn(`⚠️ No matching offer found for offerId: ${offerId}`);
    }
  });
  
  socket.on("newOffer", (offer, OfferInfo) => {
    const { offerId, receiverId,videoCallUrl,callerId } = OfferInfo;

    if (!offerId || !receiverId) {
      console.error("OfferInfo must include both offerId and receiverId");
      return;
    }   
      console.log('from offer',offerId);
  
    allKnownOffers[offerId] = {
      callerId,
      offerId,
      receiverId,
      offer,
      offerIceCandidates: [],
      answer: null,
      answerIceCandidates: [],
      videoCallUrl,
      socketId: socket.id,
    };
    console.log("New offer saved:", allKnownOffers[offerId], offerId);
    
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        "newOfferAwaiting",
        allKnownOffers[offerId]
      );
      console.log(
        `Sent newOfferAwaiting to user ${receiverId} at socket ${receiverSocketId}`
      );
    } 
  })

  socket.on('getIce',(offerId, who, ackFunk)=>{
    const offer = allKnownOffers[offerId]
    let IceCandidates =[]
    if(who === "caller"){
      IceCandidates = offer.offerIceCandidates
    } else if(who === "callee"){
      IceCandidates = offer.answerIceCandidates
    }
    ackFunk(IceCandidates)
  })

  socket.on('iceServer',({iceC, offerId, who})=>{
    console.log(who);
    console.log(iceC);
    console.log(offerId);

    const offerToUpdate = allKnownOffers[offerId]
    if(offerToUpdate){
      if(who === "caller"){
        offerToUpdate.offerIceCandidates.push(iceC)
        console.log('==================',offerToUpdate);
        const calleeId = allKnownOffers[offerId].receiverId
        const calleeSocketId = userSocketMap[calleeId];
        if(calleeSocketId){
          socket.to(calleeSocketId).emit('iceToClient', iceC);
        }
      }else if(who === "callee"){
        offerToUpdate.answerIceCandidates.push(iceC)
        console.log('++++++++++++++++++',offerToUpdate);
        const callerId = allKnownOffers[offerId].callerId
        const callerSocketId = userSocketMap[callerId];
        if(callerSocketId){
          socket.to(callerSocketId).emit('iceToClient', iceC);
        }
      }
    }
  })

  socket.on("languageUpdate", (data: { 
    language: string; 
    languageType: "first" | "second"; 
    callerId: string; 
    receiverId: string;
  }) => {
    console.log(`Received languageUpdate from ${socket.id}:`, data);
    const { callerId, receiverId } = data;

    const callerSocketId = userSocketMap[callerId];
    const receiverSocketId = userSocketMap[receiverId];

    if (callerSocketId) {
      io.to(callerSocketId).emit("languageUpdate", data);
      console.log(`Sent languageUpdate to caller ${callerId} at socket ${callerSocketId}`);
    }
    if (receiverSocketId && receiverSocketId !== callerSocketId) {
      io.to(receiverSocketId).emit("languageUpdate", data);
      console.log(`Sent languageUpdate to receiver ${receiverId} at socket ${receiverSocketId}`);
    }
  });

  socket.on("durationUpdate", (data: { 
    selectedDuration: number; 
    callerId: string; 
    receiverId: string;
  }) => {
    console.log(`Received durationUpdate from ${socket.id}:`, data);
    const { callerId, receiverId } = data;

    const callerSocketId = userSocketMap[callerId];
    const receiverSocketId = userSocketMap[receiverId];

    if (callerSocketId) {
      io.to(callerSocketId).emit("durationUpdate", data);
      console.log(`Sent durationUpdate to caller ${callerId} at socket ${callerSocketId}`);
    }
    if (receiverSocketId && receiverSocketId !== callerSocketId) {
      io.to(receiverSocketId).emit("durationUpdate", data);
      console.log(`Sent durationUpdate to receiver ${receiverId} at socket ${receiverSocketId}`);
    }
  });

  socket.on("setsUpdate", (data: { 
    selectedSets: number; 
    callerId: string; 
    receiverId: string;
  }) => {
    console.log(`Received setsUpdate from ${socket.id}:`, data);
    const { callerId, receiverId } = data;

    const callerSocketId = userSocketMap[callerId];
    const receiverSocketId = userSocketMap[receiverId];

    if (callerSocketId) {
      io.to(callerSocketId).emit("setsUpdate", data);
      console.log(`Sent setsUpdate to caller ${callerId} at socket ${callerSocketId}`);
    }
    if (receiverSocketId && receiverSocketId !== callerSocketId) {
      io.to(receiverSocketId).emit("setsUpdate", data);
      console.log(`Sent setsUpdate to receiver ${receiverId} at socket ${receiverSocketId}`);
    }
  });

  socket.on("timerControlUpdate", (data: { 
    isRunning: boolean; 
    isPaused: boolean; 
    timeLeft: number; 
    callerId: string; 
    receiverId: string;
  }) => {
    console.log(`Received timerControlUpdate from ${socket.id}:`, data);
    const { callerId, receiverId } = data;
  
    const callerSocketId = userSocketMap[callerId];
    const receiverSocketId = userSocketMap[receiverId];
  
    if (callerSocketId) {
      io.to(callerSocketId).emit("timerControlUpdate", data);
      console.log(`Sent timerControlUpdate to caller ${callerId} at socket ${callerSocketId}`);
    }
    if (receiverSocketId && receiverSocketId !== callerSocketId) {
      io.to(receiverSocketId).emit("timerControlUpdate", data);
      console.log(`Sent timerControlUpdate to receiver ${receiverId} at socket ${receiverSocketId}`);
    }
  });  

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