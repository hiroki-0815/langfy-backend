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
  return userSocketMap[userId] || undefined;
}

io.on("connection", (socket) => {
  const currentSocketId = socket.id;
  console.log("A user connected:", currentSocketId);

  socket.on("setup", (userId: string) => {
    userSocketMap[userId] = currentSocketId;
    console.log(`UserId ${userId} is mapped to socketId ${currentSocketId}`);
  });

  socket.on(
    "getReceiverSocketId",
    (userId: string, callback: (id?: string) => void) => {
      callback(getReceiverSocketId(userId));
    }
  );

  socket.on("newAnswer", ({ answer, callerId, offerId }) => {
    console.log("📩 Received newAnswer:", answer);

    if (!callerId) {
      console.error("❌ Missing callerId in newAnswer event.");
      return;
    }

    const callerSocketId = userSocketMap[callerId];
    if (callerSocketId) {
      io.to(callerSocketId).emit("answerToClient", { answer, offerId });
      console.log(
        `📞 Sent answerToClient to caller ${callerId} at socket ${callerSocketId}`
      );
    } else {
      console.warn(`⚠️ Caller ${callerId} not found in userSocketMap.`);
    }

    if (allKnownOffers[offerId]) {
      allKnownOffers[offerId].answer = answer;
      console.log("SUCCESS !! knownOffer", allKnownOffers[offerId]);
    } else {
      console.warn(`⚠️ No matching offer found for offerId: ${offerId}`);
    }
  });

  socket.on("newOffer", (offer, OfferInfo) => {
    const { offerId, receiverId, videoCallUrl, callerId } = OfferInfo;
    if (!offerId || !receiverId) {
      console.error("OfferInfo must include both offerId and receiverId");
      return;
    }
    console.log("from offer", offerId);

    allKnownOffers[offerId] = {
      callerId,
      offerId,
      receiverId,
      offer,
      offerIceCandidates: [],
      answer: null,
      answerIceCandidates: [],
      videoCallUrl,
      socketId: currentSocketId,
    };
    console.log("New offer saved:", allKnownOffers[offerId], offerId);

    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newOfferAwaiting", allKnownOffers[offerId]);
      console.log(
        `Sent newOfferAwaiting to user ${receiverId} at socket ${receiverSocketId}`
      );
    }
  });

  socket.on("getIce", (offerId, who, ackFunk) => {
    const offer = allKnownOffers[offerId];
    let IceCandidates: any[] = [];
    if (who === "caller") {
      IceCandidates = offer.offerIceCandidates;
    } else if (who === "callee") {
      IceCandidates = offer.answerIceCandidates;
    }
    ackFunk(IceCandidates);
  });

  socket.on("iceServer", ({ iceC, offerId, who }) => {
    console.log(who);
    console.log(iceC);
    console.log(offerId);

    const offerToUpdate = allKnownOffers[offerId];
    if (offerToUpdate) {
      if (who === "caller") {
        offerToUpdate.offerIceCandidates.push(iceC);
        console.log("==================", offerToUpdate);
        const calleeId = offerToUpdate.receiverId;
        const calleeSocketId = userSocketMap[calleeId];
        if (calleeSocketId) {
          socket.to(calleeSocketId).emit("iceToClient", iceC);
        }
      } else if (who === "callee") {
        offerToUpdate.answerIceCandidates.push(iceC);
        console.log("++++++++++++++++++", offerToUpdate);
        const callerId = offerToUpdate.callerId;
        const callerSocketId = userSocketMap[callerId];
        if (callerSocketId) {
          socket.to(callerSocketId).emit("iceToClient", iceC);
        }
      }
    }
  });

  socket.on("timerControlUpdate", (data: {
    isRunning: boolean;
    isPaused: boolean;
    timeLeft: number;
    targetId: string;
    role: string;
  }) => {
    const { targetId } = data;
    const targetSocketId = userSocketMap[targetId];
    if (targetSocketId) {
      io.to(targetSocketId).emit("timerControlUpdate", data);
      console.log(
        `Sent timerControlUpdate to target ${targetId} at socket ${targetSocketId}`
      );
    }
  });

  socket.on("languageUpdate", (data: {
    language: string;
    languageType: "first" | "second";
    targetId: string;
    role: string;
  }) => {
    const { targetId } = data;
    const targetSocketId = userSocketMap[targetId];
    if (targetSocketId) {
      io.to(targetSocketId).emit("languageUpdate", data);
      console.log(
        `Sent languageUpdate to target ${targetId} at socket ${targetSocketId}`
      );
    }
  });

  socket.on("durationUpdate", (data: {
    selectedDuration: number;
    targetId: string;
    role: string;
  }) => {
    const { targetId } = data;
    const targetSocketId = userSocketMap[targetId];
    if (targetSocketId) {
      io.to(targetSocketId).emit("durationUpdate", data);
      console.log(
        `Sent durationUpdate to target ${targetId} at socket ${targetSocketId}`
      );
    }
  });

  socket.on("setsUpdate", (data: {
    selectedSets: number;
    targetId: string;
    role: string;
  }) => {
    const { targetId } = data;
    const targetSocketId = userSocketMap[targetId];
    if (targetSocketId) {
      io.to(targetSocketId).emit("setsUpdate", data);
      console.log(
        `Sent setsUpdate to target ${targetId} at socket ${targetSocketId}`
      );
    }
  });

  socket.on("topicPicked", (topic: string) => {
    io.emit("topicPicked", topic);
    console.log(`Broadcasted picked topic: ${topic}`);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", currentSocketId);
    const userId = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === currentSocketId
    );
    if (userId) {
      delete userSocketMap[userId];
    }
  });
});

export { io, server, app};