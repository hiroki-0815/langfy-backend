import mongoose from "mongoose";

export const connectToMongoDB = async () => {
  const connectionString = process.env.MONGODB_CONNECTION_STRING as string;

  try {
    await mongoose.connect(connectionString);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};