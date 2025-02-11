import request from "supertest";
import express from "express";
import allUsersRoute from "../../routes/allUsersRoute";

jest.mock("../../middleware/auth", () => ({
  jwtCheck: (_req: any, _res: any, next: any) => next(),
  jwtParse: (req: any, _res: any, next: any) => {
    req.user = { sub: "12345" }; 
    next();
  },
}));

jest.mock("../../controllers/all.users.controller", () => ({
  getAllUsers: jest.fn((_req, res) =>
    res.json([
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" },
    ])
  ),
}));

const app = express();
app.use(express.json());
app.use("/api/users", allUsersRoute);

describe("All Users Route Tests", () => {
  it("should fetch all users", async () => {
    const res = await request(app).get("/api/users");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: "1", name: "Alice" },
      { id: "2", name: "Bob" },
    ]);
  });
});