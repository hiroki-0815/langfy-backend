import { AddressInfo } from "net";
import { io as serverIo, server, getReceiverSocketId } from "../../lib/socket";
import clientIo from "socket.io-client";
import type { Socket } from "socket.io-client";

jest.setTimeout(10000);

describe("Socket.IO Server", () => {
  let url: string;
  let clientSocket1: typeof Socket;
  let clientSocket2: typeof Socket;

  beforeAll((done) => {
    server.listen(() => {
      const address = server.address() as AddressInfo;
      url = `http://localhost:${address.port}`;
      done();
    });
  });

  afterAll((done) => {
    serverIo.close();
    server.close(done);
  });

  afterEach(() => {
    if (clientSocket1 && clientSocket1.connected) {
      clientSocket1.disconnect();
    }
    if (clientSocket2 && clientSocket2.connected) {
      clientSocket2.disconnect();
    }
  });


  test('should map userId to socketId on "setup" event', (done) => {
    clientSocket1 = clientIo(url, { transports: ["websocket"] });
    clientSocket1.on("connect", () => {
      clientSocket1.emit("setup", "user1");
      setTimeout(() => {
        expect(getReceiverSocketId("user1")).toBe(clientSocket1.id);
        done();
      }, 50);
    });
  });

  test('should return receiver socket id when "getReceiverSocketId" event is emitted', (done) => {
    clientSocket1 = clientIo(url, { transports: ["websocket"] });
    clientSocket1.on("connect", () => {
      clientSocket1.emit("setup", "user2");
      clientSocket1.emit("getReceiverSocketId", "user2", (socketId: string) => {
        expect(socketId).toBe(clientSocket1.id);
        done();
      });
    });
  });

  test('should handle "newOffer" event and send "newOfferAwaiting" to the receiver', (done) => {
    clientSocket1 = clientIo(url, { transports: ["websocket"] });
    clientSocket2 = clientIo(url, { transports: ["websocket"] });

    Promise.all([
      new Promise<void>((resolve) => clientSocket1.once("connect", resolve)),
      new Promise<void>((resolve) => clientSocket2.once("connect", resolve))
    ]).then(() => {
      clientSocket1.emit("setup", "callerUser");
      clientSocket2.emit("setup", "receiverUser");

      clientSocket2.on("newOfferAwaiting", (offer: any) => {
        expect(offer.offerId).toBe("offer123");
        expect(offer.receiverId).toBe("receiverUser");
        done();
      });

      setTimeout(() => {
        const offerData = { type: "offer", sdp: "dummy-sdp" };
        const offerInfo = {
          offerId: "offer123",
          receiverId: "receiverUser",
          videoCallUrl: "http://dummy.url",
          callerId: "callerUser",
        };
        clientSocket1.emit("newOffer", offerData, offerInfo);
      }, 50);
    });
  });

  test('should handle "newAnswer" event and send "answerToClient" to the caller', (done) => {
    clientSocket1 = clientIo(url, { transports: ["websocket"] });
    clientSocket2 = clientIo(url, { transports: ["websocket"] });

    Promise.all([
      new Promise<void>((resolve) => clientSocket1.once("connect", resolve)),
      new Promise<void>((resolve) => clientSocket2.once("connect", resolve))
    ]).then(() => {
      clientSocket1.emit("setup", "callerUser2");
      clientSocket2.emit("setup", "receiverUser2");

      const offerData = { type: "offer", sdp: "dummy-sdp" };
      const offerInfo = {
        offerId: "offer456",
        receiverId: "receiverUser2",
        videoCallUrl: "http://dummy.url",
        callerId: "callerUser2",
      };
      clientSocket1.emit("newOffer", offerData, offerInfo);

      clientSocket1.on("answerToClient", (data: any) => {
        expect(data.answer).toBe("dummy-answer");
        expect(data.offerId).toBe("offer456");
        done();
      });

      setTimeout(() => {
        clientSocket2.emit("newAnswer", {
          answer: "dummy-answer",
          callerId: "callerUser2",
          offerId: "offer456",
        });
      }, 100);
    });
  });

  test('should return correct ICE candidates via "getIce" event for caller', (done) => {
    clientSocket1 = clientIo(url, { transports: ["websocket"] });
    clientSocket1.on("connect", () => {
      clientSocket1.emit("setup", "callerUser3");

      const offerData = { type: "offer", sdp: "dummy-sdp" };
      const offerInfo = {
        offerId: "offer789",
        receiverId: "dummyReceiver",
        videoCallUrl: "",
        callerId: "callerUser3",
      };
      clientSocket1.emit("newOffer", offerData, offerInfo);

      clientSocket1.emit("iceServer", {
        iceC: "iceCandidate1",
        offerId: "offer789",
        who: "caller",
      });

      clientSocket1.emit("getIce", "offer789", "caller", (iceCandidates: string[]) => {
        expect(iceCandidates).toContain("iceCandidate1");
        done();
      });
    });
  });

  test('should handle "iceServer" event and emit "iceToClient" for both directions', (done) => {
    clientSocket1 = clientIo(url, { transports: ["websocket"] });
    clientSocket2 = clientIo(url, { transports: ["websocket"] });
    let offerReady = false;

    Promise.all([
      new Promise<void>((resolve) => clientSocket1.once("connect", resolve)),
      new Promise<void>((resolve) => clientSocket2.once("connect", resolve))
    ]).then(() => {
      clientSocket1.emit("setup", "callerUser4");
      clientSocket2.emit("setup", "receiverUser4");

      setTimeout(() => {
        const offerData = { type: "offer", sdp: "dummy-sdp" };
        const offerInfo = {
          offerId: "offer101",
          receiverId: "receiverUser4",
          videoCallUrl: "",
          callerId: "callerUser4",
        };
        clientSocket1.emit("newOffer", offerData, offerInfo);
        offerReady = true;
      }, 50);

      clientSocket2.on("iceToClient", (iceCandidate: any) => {
        if (offerReady) {
          if (iceCandidate === "iceCandidate-caller") {
            clientSocket2.emit("iceServer", {
              iceC: "iceCandidate-callee",
              offerId: "offer101",
              who: "callee",
            });
          } else if (iceCandidate === "iceCandidate-callee") {
            expect(iceCandidate).toBe("iceCandidate-callee");
            done();
          }
        }
      });

      setTimeout(() => {
        clientSocket1.emit("iceServer", {
          iceC: "iceCandidate-caller",
          offerId: "offer101",
          who: "caller",
        });
      }, 100);

      clientSocket1.on("iceToClient", (iceCandidate: any) => {
        if (iceCandidate === "iceCandidate-callee") {
          expect(iceCandidate).toBe("iceCandidate-callee");
          done();
        }
      });
    });
  });

  test('should handle "timerControlUpdate" event and send update to target', (done) => {
    clientSocket1 = clientIo(url, { transports: ["websocket"] });
    clientSocket2 = clientIo(url, { transports: ["websocket"] });
    Promise.all([
      new Promise<void>((resolve) => clientSocket1.once("connect", resolve)),
      new Promise<void>((resolve) => clientSocket2.once("connect", resolve))
    ]).then(() => {
      clientSocket1.emit("setup", "timerSender");
      clientSocket2.emit("setup", "timerReceiver");

      clientSocket2.on("timerControlUpdate", (data: any) => {
        expect(data.isRunning).toBe(true);
        expect(data.timeLeft).toBe(100);
        done();
      });

      setTimeout(() => {
        clientSocket1.emit("timerControlUpdate", {
          isRunning: true,
          isPaused: false,
          timeLeft: 100,
          targetId: "timerReceiver",
          role: "sender",
        });
      }, 50);
    });
  });

  test('should handle "languageUpdate" event and send update to target', (done) => {
    clientSocket1 = clientIo(url, { transports: ["websocket"] });
    clientSocket2 = clientIo(url, { transports: ["websocket"] });
    Promise.all([
      new Promise<void>((resolve) => clientSocket1.once("connect", resolve)),
      new Promise<void>((resolve) => clientSocket2.once("connect", resolve))
    ]).then(() => {
      clientSocket1.emit("setup", "langSender");
      clientSocket2.emit("setup", "langReceiver");

      clientSocket2.on("languageUpdate", (data: any) => {
        expect(data.language).toBe("en");
        expect(data.languageType).toBe("first");
        done();
      });

      setTimeout(() => {
        clientSocket1.emit("languageUpdate", {
          language: "en",
          languageType: "first",
          targetId: "langReceiver",
          role: "sender",
        });
      }, 50);
    });
  });

  test('should handle "durationUpdate" event and send update to target', (done) => {
    clientSocket1 = clientIo(url, { transports: ["websocket"] });
    clientSocket2 = clientIo(url, { transports: ["websocket"] });
    Promise.all([
      new Promise<void>((resolve) => clientSocket1.once("connect", resolve)),
      new Promise<void>((resolve) => clientSocket2.once("connect", resolve))
    ]).then(() => {
      clientSocket1.emit("setup", "durationSender");
      clientSocket2.emit("setup", "durationReceiver");

      clientSocket2.on("durationUpdate", (data: any) => {
        expect(data.selectedDuration).toBe(30);
        done();
      });

      setTimeout(() => {
        clientSocket1.emit("durationUpdate", {
          selectedDuration: 30,
          targetId: "durationReceiver",
          role: "sender",
        });
      }, 50);
    });
  });

  test('should handle "setsUpdate" event and send update to target', (done) => {
    clientSocket1 = clientIo(url, { transports: ["websocket"] });
    clientSocket2 = clientIo(url, { transports: ["websocket"] });
    Promise.all([
      new Promise<void>((resolve) => clientSocket1.once("connect", resolve)),
      new Promise<void>((resolve) => clientSocket2.once("connect", resolve))
    ]).then(() => {
      clientSocket1.emit("setup", "setsSender");
      clientSocket2.emit("setup", "setsReceiver");

      clientSocket2.on("setsUpdate", (data: any) => {
        expect(data.selectedSets).toBe(5);
        done();
      });

      setTimeout(() => {
        clientSocket1.emit("setsUpdate", {
          selectedSets: 5,
          targetId: "setsReceiver",
          role: "sender",
        });
      }, 50);
    });
  });

  test('should broadcast "topicPicked" to all clients', (done) => {
    clientSocket1 = clientIo(url, { transports: ["websocket"] });
    clientSocket2 = clientIo(url, { transports: ["websocket"] });
    Promise.all([
      new Promise<void>((resolve) => clientSocket1.once("connect", resolve)),
      new Promise<void>((resolve) => clientSocket2.once("connect", resolve))
    ]).then(() => {
      let receivedCount = 0;
      const checkDone = () => {
        receivedCount++;
        if (receivedCount === 2) {
          done();
        }
      };

      clientSocket1.on("topicPicked", (topic: any) => {
        expect(topic).toBe("test-topic");
        checkDone();
      });

      clientSocket2.on("topicPicked", (topic: any) => {
        expect(topic).toBe("test-topic");
        checkDone();
      });

      setTimeout(() => {
        clientSocket1.emit("topicPicked", "test-topic");
      }, 50);
    });
  });

  test('should remove user from userSocketMap on "disconnect"', (done) => {
    clientSocket1 = clientIo(url, { transports: ["websocket"] });
    clientSocket1.once("connect", () => {
      clientSocket1.emit("setup", "disconnectUser");
      setTimeout(() => {
        clientSocket1.disconnect();
      }, 50);
    });

    setTimeout(() => {
      expect(getReceiverSocketId("disconnectUser")).toBeUndefined();
      done();
    }, 150);
  });


  test('should log error if newAnswer is emitted without callerId', (done) => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    clientSocket1 = clientIo(url, { transports: ["websocket"] });
    clientSocket1.on("connect", () => {
      clientSocket1.emit("newAnswer", { answer: "dummy-answer", offerId: "offer-missing-caller" });
      setTimeout(() => {
        expect(errorSpy).toHaveBeenCalledWith("❌ Missing callerId in newAnswer event.");
        errorSpy.mockRestore();
        done();
      }, 50);
    });
  });

  test('should log warnings if newAnswer is emitted with a callerId not in userSocketMap and offer not found', (done) => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    clientSocket1 = clientIo(url, { transports: ["websocket"] });
    clientSocket1.on("connect", () => {
      clientSocket1.emit("newAnswer", { answer: "dummy-answer", callerId: "nonexistentCaller", offerId: "offer-nonexistent" });
      setTimeout(() => {
        expect(warnSpy).toHaveBeenCalledWith("⚠️ Caller nonexistentCaller not found in userSocketMap.");
        expect(warnSpy).toHaveBeenCalledWith("⚠️ No matching offer found for offerId: offer-nonexistent");
        warnSpy.mockRestore();
        done();
      }, 50);
    });
  });

  test('should log error if newOffer is emitted with missing offerId', (done) => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    clientSocket1 = clientIo(url, { transports: ["websocket"] });
    clientSocket1.on("connect", () => {
      const offerData = { type: "offer", sdp: "dummy-sdp" };
      const offerInfo = { receiverId: "receiverUser", videoCallUrl: "http://dummy.url", callerId: "callerUser" };
      clientSocket1.emit("newOffer", offerData, offerInfo);
      setTimeout(() => {
        expect(errorSpy).toHaveBeenCalledWith("OfferInfo must include both offerId and receiverId");
        errorSpy.mockRestore();
        done();
      }, 50);
    });
  });

  test('should return correct ICE candidates via "getIce" event for callee', (done) => {
    clientSocket1 = clientIo(url, { transports: ["websocket"] });
    clientSocket2 = clientIo(url, { transports: ["websocket"] });
    Promise.all([
      new Promise<void>((resolve) => clientSocket1.once("connect", resolve)),
      new Promise<void>((resolve) => clientSocket2.once("connect", resolve))
    ]).then(() => {
      clientSocket1.emit("setup", "callerUser5");
      clientSocket2.emit("setup", "receiverUser5");

      const offerData = { type: "offer", sdp: "dummy-sdp" };
      const offerInfo = {
        offerId: "offer910",
        receiverId: "receiverUser5",
        videoCallUrl: "",
        callerId: "callerUser5",
      };
      clientSocket1.emit("newOffer", offerData, offerInfo);

      setTimeout(() => {
        clientSocket2.emit("iceServer", {
          iceC: "iceCandidate-callee-test",
          offerId: "offer910",
          who: "callee"
        });
        setTimeout(() => {
          clientSocket1.emit("getIce", "offer910", "callee", (iceCandidates: string[]) => {
            expect(iceCandidates).toContain("iceCandidate-callee-test");
            done();
          });
        }, 50);
      }, 50);
    });
  });
});