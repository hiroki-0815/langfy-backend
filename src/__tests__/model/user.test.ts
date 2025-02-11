jest.setTimeout(30000);

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../../model/user";
import {
  ORIGIN_COUNTRIES,
  LANGUAGES,
  GENDERS,
  FLUENCY_LEVELS,
  MOTIVATIONS,
} from "../../model/enums/enum";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
  } catch (error) {
    console.error("Error starting MongoMemoryServer", error);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("User Model Tests", () => {
  it("should save a user successfully", async () => {
    const user = new User({
      auth0Id: "auth0|12345",
      name: "Alice",
      gender: GENDERS[1], 
      email: "alice@example.com",
      city: "New York",
      country: "United States",
      originCountry: ORIGIN_COUNTRIES[1], 
      nativeLanguage: LANGUAGES[0],         
      age: 25,
      learningLanguage: LANGUAGES[1],
      fluencyLevel: FLUENCY_LEVELS[0],
      motivation: MOTIVATIONS[0],
      selfIntroduction: "Hi, I love languages!",
      imageUrl: "https://example.com/alice.jpg",
    });

    const savedUser = await user.save();
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe("Alice");
    expect(savedUser.email).toBe("alice@example.com");
    expect(savedUser.originCountry).toBe("The United States");
  });

  it("should not save a user without required fields", async () => {
    const user = new User({
      name: "Bob",
    });

    try {
      await user.save();
    } catch (error: any) {
      expect(error.errors.auth0Id).toBeDefined();
      expect(error.errors.email).toBeDefined();
    }
  });

  it("should enforce unique constraints", async () => {
    await new User({
      auth0Id: "auth0|duplicate",
      name: "Charlie",
      email: "charlie@example.com",
      originCountry: ORIGIN_COUNTRIES[0],
    }).save();

    try {
      await new User({
        auth0Id: "auth0|duplicate",
        name: "Charlie2",
        email: "charlie@example.com",
        originCountry: ORIGIN_COUNTRIES[0],
      }).save();
    } catch (error: any) {
      expect(error.code).toBe(11000);
    }
  });
});