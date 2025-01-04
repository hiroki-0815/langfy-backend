// server.ts
import express, { Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import { connectToMongoDB } from "./lib/mongo";
import { configureCloudinary } from "./lib/cloudinary";
import myUserRoute from "./routes/myUserRoute";
import allUsersRoute from "./routes/allUsersRoute";
import messageRoute from "./routes/messageRoute";
import { app, server } from "./lib/socket"; // import your socket server
// Optionally, import an Auth0 middleware if needed for your protected routes

app.use(cors());
app.use(express.json());

// Your standard REST endpoints
app.use("/api/my/user", myUserRoute);
app.use("/api/users", allUsersRoute);
app.use("/api/message", messageRoute);

// A health check
app.get("/health", (req: Request, res: Response) => {
  res.send({ status: "OK" });
});

const PORT = process.env.PORT || 7001;

// Start the server
const startServer = async () => {
  try {
    // Connect to your DB
    await connectToMongoDB();
    // Configure Cloudinary if you’re using image uploads
    configureCloudinary();

    // Listen with both Express and Socket.io
    server.listen(PORT, () => {
      console.log(`Server started on port: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start the server:", error);
  }
};

startServer();
