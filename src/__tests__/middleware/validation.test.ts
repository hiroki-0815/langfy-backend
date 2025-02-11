import request from "supertest";
import express from "express";
import { validateMyUserRequest } from "../../middleware/validation";
import {
  ORIGIN_COUNTRIES,
  LANGUAGES,
  GENDERS,
  FLUENCY_LEVELS,
  MOTIVATIONS,
} from "../../model/enums/enum";

const app = express();
app.use(express.json());

app.post("/validate-user", validateMyUserRequest, (req: any, res: any) => {
  res.status(200).json({ message: "Validation Passed" });
});

describe("User Validation Middleware Tests", () => {
  it("should pass validation with valid data", async () => {
    const res = await request(app).post("/validate-user").send({
      name: "Alice",
      gender: GENDERS[0], 
      city: "Tokyo",
      country: "Japan",
      originCountry: ORIGIN_COUNTRIES[0], 
      nativeLanguage: LANGUAGES[0], 
      age: 25,
      learningLanguage: LANGUAGES[1], 
      fluencyLevel: FLUENCY_LEVELS[0], 
      motivation: MOTIVATIONS[0], 
      selfIntroduction: "I love learning languages!",
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Validation Passed" });
  });

  it("should return 400 if name is missing", async () => {
    const res = await request(app).post("/validate-user").send({
      gender: GENDERS[1], 
      nativeLanguage: LANGUAGES[0], 
      learningLanguage: LANGUAGES[1], 
      fluencyLevel: FLUENCY_LEVELS[1],
      motivation: MOTIVATIONS[1], 
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: "Name must be a string" }),
      ])
    );
  });

  it("should return 400 if gender is invalid", async () => {
    const res = await request(app).post("/validate-user").send({
      name: "Alice",
      gender: "unknown",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: "Gender must be one of the predefined values" }),
      ])
    );
  });

  it("should return 400 if originCountry is invalid", async () => {
    const res = await request(app).post("/validate-user").send({
      name: "Alice",
      originCountry: "Unknownland",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: "Invalid origin country" }),
      ])
    );
  });

  it("should return 400 if learningLanguage is missing", async () => {
    const res = await request(app).post("/validate-user").send({
      name: "Alice",
      nativeLanguage: LANGUAGES[0], 
      fluencyLevel: FLUENCY_LEVELS[0],
      motivation: MOTIVATIONS[0], 
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: "Invalid learning language" }),
      ])
    );
  });

  it("should return 400 if fluencyLevel is invalid", async () => {
    const res = await request(app).post("/validate-user").send({
      name: "Alice",
      fluencyLevel: "super advanced",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: "Fluency level must be one of the predefined values" }),
      ])
    );
  });

  it("should return 400 if motivation is invalid", async () => {
    const res = await request(app).post("/validate-user").send({
      name: "Alice",
      motivation: "just browsing",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: "Motivation must be one of the predefined values" }),
      ])
    );
  });

  it("should return 400 if age is negative", async () => {
    const res = await request(app).post("/validate-user").send({
      name: "Alice",
      age: -5,
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: "Age must be a positive integer" }),
      ])
    );
  });

  it("should return 400 if age is not a number", async () => {
    const res = await request(app).post("/validate-user").send({
      name: "Alice",
      age: "twenty-five",
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: "Age must be a positive integer" }),
      ])
    );
  });

  it("should pass validation even if optional fields are missing", async () => {
    const res = await request(app).post("/validate-user").send({
      name: "Alice",
      nativeLanguage: LANGUAGES[0], 
      learningLanguage: LANGUAGES[1], 
      motivation: MOTIVATIONS[0], 
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Validation Passed" });
  });
});