import request from "supertest";
import express from "express";
import jwt from "jsonwebtoken";
import { jwtParse } from "../../middleware/auth";
import User from "../../model/user";

jest.mock("../../model/user");

const mockUser = {
  _id: "64f7e5a3e8a3f1b7c89a1e23",
  auth0Id: "auth0|12345",
};

jest.mock("jsonwebtoken", () => ({
  ...jest.requireActual("jsonwebtoken"),
  decode: jest.fn(() => ({ sub: "auth0|12345" })),
}));

jest.mock("../../middleware/auth", () => ({
  jwtCheck: (_req: any, _res: any, next: any) => next(), 
  jwtParse: jest.requireActual("../../middleware/auth").jwtParse,
}));

const app = express();
app.use(express.json());

app.get("/protected", jwtParse, (req, res) => {
  res.json({ userId: req.userId, auth0Id: req.auth0Id });
});

describe("Auth Middleware Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if authorization header is missing", async () => {
    const res = await request(app).get("/protected");
    expect(res.status).toBe(401);
  });

  it("should return 401 if token is invalid", async () => {
    (jwt.decode as jest.Mock).mockReturnValue(null);

    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer invalid_token");

    expect(res.status).toBe(401);
  });

  it("should return 401 if user does not exist", async () => {
    (jwt.decode as jest.Mock).mockReturnValue({ sub: "auth0|12345" });
    (User.findOne as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer valid_token");

    expect(res.status).toBe(401);
  });

  it("should attach userId and auth0Id to request if valid", async () => {
    (jwt.decode as jest.Mock).mockReturnValue({ sub: "auth0|12345" });
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer valid_token");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      userId: "64f7e5a3e8a3f1b7c89a1e23",
      auth0Id: "auth0|12345",
    });
  });
});