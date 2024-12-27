import mongoose from "mongoose";
import { ORIGIN_COUNTRIES, LANGUAGES, GENDERS, FLUENCY_LEVELS, MOTIVATIONS } from "./enums/enum";

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
    enum: GENDERS,
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
  originCountry: {
    type: String,
    enum: ORIGIN_COUNTRIES,
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
    enum: FLUENCY_LEVELS,
  },
  motivation: {
    type: String,
    enum: MOTIVATIONS,
  },
  selfIntroduction: {
    type: String,
    trim: true,
  },
  imageUrl: { type: String },
});

const User = mongoose.model("User", userSchema);
export default User;