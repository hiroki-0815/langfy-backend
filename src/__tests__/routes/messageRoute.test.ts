import request from "supertest";
import express from "express";
import messageRoute from "../../routes/messageRoute";

jest.mock("../../middleware/auth", () => ({
  jwtCheck: (_req: any, _res: any, next: any) => next(),
  jwtParse: (req: any, _res: any, next: any) => {
    req.user = { sub: "12345" };
    next();
  },
}));

jest.mock("../../controllers/message.controller", () => ({
  getChatUser: jest.fn((_req, res) => res.json([{ id: "user1", name: "Alice" }])),
  getMessages: jest.fn((_req, res) => res.json([{ sender: "user1", text: "Hello!" }])),
  sendMessages: jest.fn((_req, res) => res.status(201).json({ message: "Message sent" })),
}));

const app = express();
app.use(express.json());
app.use("/api/message", messageRoute);

describe("Message Route Tests", () => {
  it("should fetch chat users", async () => {
    const res = await request(app).get("/api/message/users");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: "user1", name: "Alice" }]);
  });

  it("should fetch messages by chat ID", async () => {
    const res = await request(app).get("/api/message/123");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ sender: "user1", text: "Hello!" }]);
  });

  it("should send a message (with file upload)", async () => {
    const res = await request(app)
      .post("/api/message/send/123")
      .attach("imageFile", Buffer.from("dummy image"), "test.png")
      .field("text", "This is a test message");

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: "Message sent" });
  });
});