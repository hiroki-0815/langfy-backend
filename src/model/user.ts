import mongoose from "mongoose";
import { NATIONALITIES, LANGUAGES } from "./enums/enum"

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
    enum: NATIONALITIES,
    trim: true,
  },
  nativeLanguage: {
    type: String,
    enum: LANGUAGES,
    trim: true,
  },
  age: {
    type: Number,
    min: 1, 
  },
  learningLanguage: {
    type: String,
    enum: LANGUAGES,
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
