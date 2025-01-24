import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { connectToMongoDB } from "./lib/mongo";
import { configureCloudinary } from "./lib/cloudinary";
import myUserRoute from "./routes/myUserRoute";
import allUsersRoute from "./routes/allUsersRoute";
import messageRoute from "./routes/messageRoute";
import { app, server } from "./lib/socket";

app.use(cors());
app.use(express.json());

app.use("/api/my/user", myUserRoute);
app.use("/api/users", allUsersRoute);
app.use("/api/message", messageRoute);

app.get("/health", (req: Request, res: Response) => {
  res.send({ status: "OK" });
});

const PORT = process.env.PORT || 7001;

const startServer = async () => {
  try {
    await connectToMongoDB();
    configureCloudinary();

    server.listen(PORT, () => {
      console.log(`Server started on port: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
  }
};

startServer();