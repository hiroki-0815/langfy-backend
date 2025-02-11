import { Request, Response } from "express";
import User from "../../model/user";
import Message from "../../model/message";
import cloudinary from "cloudinary";
import { getReceiverSocketId, io } from "../../lib/socket";
import { getChatUser, getMessages, sendMessages } from "../../controllers/message.controller";

const dummyNext = jest.fn();

const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

jest.mock("../../model/user");
jest.mock("../../model/message");

jest.mock("cloudinary", () => ({
  v2: {
    uploader: {
      upload: jest.fn(),
    },
  },
}));

jest.mock("../../lib/socket", () => ({
  getReceiverSocketId: jest.fn(),
  io: {
    to: jest.fn().mockReturnValue({
      emit: jest.fn(),
    }),
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("getChatUser", () => {
  it("should return 404 if current user is not found", async () => {
    const req = { userId: "123", query: {} } as unknown as Request;
    const res = mockResponse();

    (User.findOne as jest.Mock).mockResolvedValue(null);

    await getChatUser(req, res, dummyNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return an empty list if no messages and no clickedUserId", async () => {
    const req = { userId: "123", query: {} } as unknown as Request;
    const res = mockResponse();
    const currentUser = { _id: "123" };

    (User.findOne as jest.Mock).mockResolvedValue(currentUser);

    (Message.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      }),
    });

    (User.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue([]),
    });

    await getChatUser(req, res, dummyNext);

    expect(User.find).toHaveBeenCalledWith({
      _id: { $in: [], $ne: currentUser._id },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it("should return a list of chat users based on messages and clickedUserId", async () => {
    const req = { userId: "123", query: { clickedUserId: "789" } } as unknown as Request;
    const res = mockResponse();
    const currentUser = { _id: "123" };

    (User.findOne as jest.Mock).mockResolvedValue(currentUser);

    const message1 = {
      senderId: { _id: "456", toString: () => "456" },
      receiverId: { _id: "123", toString: () => "123" },
    };
    const message2 = {
      senderId: { _id: "123", toString: () => "123" },
      receiverId: { _id: "789", toString: () => "789" },
    };

    (Message.find as jest.Mock).mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue([message1, message2]),
      }),
    });

    const chatUsers = [
      { _id: "456", name: "User 456", imageUrl: "url456" },
      { _id: "789", name: "User 789", imageUrl: "url789" },
    ];
    (User.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue(chatUsers),
    });

    await getChatUser(req, res, dummyNext);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(chatUsers);
  });

  it("should return 500 when an error occurs in getChatUser", async () => {
    const req = { userId: "123", query: {} } as unknown as Request;
    const res = mockResponse();

    (User.findOne as jest.Mock).mockRejectedValue(new Error("Test error"));

    await getChatUser(req, res, dummyNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong" });
  });
});

describe("getMessages", () => {
  it("should return messages between the two users", async () => {
    const req = { params: { id: "456" }, userId: "123" } as unknown as Request;
    const res = mockResponse();
    const messages = [
      { senderId: "123", receiverId: "456", text: "Hello" },
      { senderId: "456", receiverId: "123", text: "Hi" },
    ];

    (Message.find as jest.Mock).mockResolvedValue(messages);

    await getMessages(req, res);

    expect(Message.find).toHaveBeenCalledWith({
      $or: [
        { senderId: "123", receiverId: "456" },
        { senderId: "456", receiverId: "123" },
      ],
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(messages);
  });

  it("should return 500 if an error occurs in getMessages", async () => {
    const req = { params: { id: "456" }, userId: "123" } as unknown as Request;
    const res = mockResponse();

    (Message.find as jest.Mock).mockRejectedValue(new Error("Test error"));

    await getMessages(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong" });
  });
});

describe("sendMessages", () => {
  it("should create a new message without image and emit an event", async () => {
    const req = {
      body: { text: "Hello" },
      params: { id: "456" },
      userId: "123",
    } as unknown as Request;
    const res = mockResponse();

    const saveMock = jest.fn().mockResolvedValue(undefined);
    (Message as unknown as jest.Mock).mockImplementation((data) => ({ ...data, save: saveMock }));

    (getReceiverSocketId as jest.Mock).mockReturnValue("socket123");
    const emitMock = jest.fn();
    (io.to as jest.Mock).mockReturnValue({ emit: emitMock });

    await sendMessages(req, res, dummyNext);

    expect(saveMock).toHaveBeenCalled();
    expect(getReceiverSocketId).toHaveBeenCalledWith("456");
    expect(io.to).toHaveBeenCalledWith("socket123");
    expect(emitMock).toHaveBeenCalledWith("newMessage", expect.objectContaining({
      senderId: "123",
      receiverId: "456",
      text: "Hello",
    }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      senderId: "123",
      receiverId: "456",
      text: "Hello",
    }));
  });

  it("should create a new message with image (upload via Cloudinary)", async () => {
    const req = {
      body: { text: "Hello", image: "base64image" },
      params: { id: "456" },
      userId: "123",
    } as unknown as Request;
    const res = mockResponse();

    (cloudinary.v2.uploader.upload as jest.Mock).mockResolvedValue({ secure_url: "http://example.com/image.png" });

    const saveMock = jest.fn().mockResolvedValue(undefined);
    (Message as unknown as jest.Mock).mockImplementation((data) => ({ ...data, save: saveMock }));

    (getReceiverSocketId as jest.Mock).mockReturnValue("socket123");
    const emitMock = jest.fn();
    (io.to as jest.Mock).mockReturnValue({ emit: emitMock });

    await sendMessages(req, res, dummyNext);

    expect(cloudinary.v2.uploader.upload).toHaveBeenCalledWith("base64image");
    const responseMessage = (res.json as jest.Mock).mock.calls[0][0];
    expect(responseMessage.image).toBe("http://example.com/image.png");
    expect(saveMock).toHaveBeenCalled();
    expect(getReceiverSocketId).toHaveBeenCalledWith("456");
    expect(io.to).toHaveBeenCalledWith("socket123");
    expect(emitMock).toHaveBeenCalledWith("newMessage", responseMessage);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(responseMessage);
  });

  it("should return 500 if an error occurs in sendMessages", async () => {
    const req = {
      body: { text: "Hello" },
      params: { id: "456" },
      userId: "123",
    } as unknown as Request;
    const res = mockResponse();

    (Message as unknown as jest.Mock).mockImplementation(() => {
      throw new Error("Test error");
    });

    await sendMessages(req, res, dummyNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong" });
  });
});