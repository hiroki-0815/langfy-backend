import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  city: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
  },
  nationality: {
    type: String,
    trim: true,
  },
  age: {
    type: Number,
    min: 1, 
  },
  learningLanguage: {
    type: String,
  },
  fluencyLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced"],
  },
  motivation: {
    type: String,
    enum: ["wanna chat", "wanna call"],
  },
  selfIntroduction: {
    type: String,
    trim: true,
  },
  imageUrl: { type: String },
});

const User = mongoose.model("User", userSchema);
export default User;
