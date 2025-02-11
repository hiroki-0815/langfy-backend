import request from "supertest";
import express from "express";
import myUserRoute from "../../routes/myUserRoute";
import User from "../../model/user";

jest.mock("../../middleware/auth", () => ({
  jwtCheck: (_req: any, _res: any, next: any) => next(),
  jwtParse: (req: any, _res: any, next: any) => {
    req.user = { sub: "12345" };
    next();
  },
}));

jest.mock("../../middleware/validation", () => ({
  validateMyUserRequest: (_req: any, _res: any, next: any) => next(),
}));

jest.mock("../../controllers/user.controller", () => ({
  getCurrentUser: jest.fn((_req, res) => res.json({ id: "12345", name: "Test User" })),
  createCurrentUser: jest.fn((_req, res) => res.status(201).json({ message: "User created" })),
  updateCurrentUser: jest.fn((_req, res) => res.json({ message: "User updated" })),
}));

jest.mock("multer", () => {
  const multerMock = jest.fn(() => ({
    single: jest.fn(() => (req: any, res: any, next: any) => next()),
    array: jest.fn(() => (req: any, res: any, next: any) => next()), 
  }));

  return Object.assign(multerMock, {
    memoryStorage: jest.fn(() => ({})), 
  });
});

jest.mock("../../model/user", () => {
  return {
    __esModule: true,
    default: {
      deleteMany: jest.fn(),
    },
  };
});

const app = express();
app.use(express.json());
app.use("/api/my/user", myUserRoute);

beforeEach(async () => {
  jest.clearAllMocks();
  (User.deleteMany as jest.Mock).mockResolvedValue(undefined);
});

afterAll(async () => {
  jest.restoreAllMocks();
});

describe("User Route Tests", () => {
  it("should get the current user", async () => {
    const res = await request(app).get("/api/my/user");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: "12345", name: "Test User" });
  });

  it("should create a new user", async () => {
    const res = await request(app).post("/api/my/user").send({ name: "New User" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: "User created" });
  });

  it("should update the current user (with file upload)", async () => {
    const res = await request(app)
      .put("/api/my/user")
      .field("name", "Updated User")
      .attach("imageFile", Buffer.from("dummy image"), "test.png");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "User updated" });
  });
});