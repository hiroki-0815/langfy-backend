jest.setTimeout(60000);

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Message from "../../model/message";
import User from "../../model/user"; 

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("Message Model Tests", () => {
  let sender: mongoose.Types.ObjectId;
  let receiver: mongoose.Types.ObjectId;

  beforeAll(async () => {

    const senderUser = await new User({ auth0Id: "auth0|123", email: "sender@example.com" }).save();
    const receiverUser = await new User({ auth0Id: "auth0|456", email: "receiver@example.com" }).save();
    
    sender = senderUser._id;
    receiver = receiverUser._id;
  });

  it("should save a message successfully", async () => {
    const message = new Message({
      senderId: sender,
      receiverId: receiver,
      text: "Hello, this is a test message.",
      image: "https://example.com/image.jpg",
    });

    const savedMessage = await message.save();
    
    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.senderId.toString()).toBe(sender.toString());
    expect(savedMessage.receiverId.toString()).toBe(receiver.toString());
    expect(savedMessage.text).toBe("Hello, this is a test message.");
    expect(savedMessage.image).toBe("https://example.com/image.jpg");
  });

  it("should not save a message without senderId and receiverId", async () => {
    const message = new Message({ text: "Invalid message" });

    try {
      await message.save();
    } catch (error: any) {
      expect(error.errors.senderId).toBeDefined();
      expect(error.errors.receiverId).toBeDefined();
    }
  });

  it("should allow saving messages without text or image", async () => {
    const message = new Message({
      senderId: sender,
      receiverId: receiver,
    });

    const savedMessage = await message.save();
    expect(savedMessage._id).toBeDefined();
    expect(savedMessage.text).toBeUndefined();
    expect(savedMessage.image).toBeUndefined();
  });
});
