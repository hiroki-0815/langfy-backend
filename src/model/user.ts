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
});

const User = mongoose.model("User", userSchema);
export default User;
