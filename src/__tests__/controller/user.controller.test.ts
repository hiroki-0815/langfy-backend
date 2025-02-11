import { Request, Response } from "express";
import cloudinary from "cloudinary";
import { createCurrentUser, getCurrentUser, updateCurrentUser } from "../../controllers/user.controller";
import User from "../../model/user";

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

const dummyNext = jest.fn();

jest.mock("../../model/user");
jest.mock("cloudinary", () => ({
  v2: {
    uploader: {
      upload: jest.fn().mockResolvedValue({
        url: "http://example.com/test-image.jpg", 
      }),
    },
  },
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe("getCurrentUser", () => {
  it("should return the current user if found", async () => {
    const req = { userId: "123" } as Request;
    const res = mockResponse();
    const fakeUser = { _id: "123", name: "Test User" };

    (User.findOne as jest.Mock).mockResolvedValue(fakeUser);
    await getCurrentUser(req, res, dummyNext);

    expect(User.findOne).toHaveBeenCalledWith({ _id: "123" });
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  it("should return 404 if user not found", async () => {
    const req = { userId: "123" } as Request;
    const res = mockResponse();

    (User.findOne as jest.Mock).mockResolvedValue(null);

    await getCurrentUser(req, res, dummyNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 500 on error", async () => {
    const req = { userId: "123" } as Request;
    const res = mockResponse();
    const error = new Error("Test error");

    (User.findOne as jest.Mock).mockRejectedValue(error);

    await getCurrentUser(req, res, dummyNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong" });
  });
});

describe("createCurrentUser", () => {
  it("should return 200 if user already exists", async () => {
    const req = {
      body: { auth0Id: "auth0|123", email: "test@test.com" },
    } as Request;
    const res = mockResponse();
    const existingUser = { _id: "123", auth0Id: "auth0|123" };

    (User.findOne as jest.Mock).mockResolvedValue(existingUser);

    await createCurrentUser(req, res, dummyNext);

    expect(User.findOne).toHaveBeenCalledWith({ auth0Id: "auth0|123" });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });

  it("should create a new user if one does not exist and return 201", async () => {
    const req = {
      body: { auth0Id: "auth0|123", email: "test@test.com" },
    } as Request;
    const res = mockResponse();

    (User.findOne as jest.Mock).mockResolvedValue(null);

    const saveMock = jest.fn().mockResolvedValue(undefined);
    const toObjectMock = jest.fn().mockReturnValue({
      _id: "123",
      auth0Id: "auth0|123",
      email: "test@test.com",
    });
    const newUserMock = {
      save: saveMock,
      toObject: toObjectMock,
    };

    (User as unknown as jest.Mock).mockImplementation(() => newUserMock);

    await createCurrentUser(req, res, dummyNext);

    expect(User.findOne).toHaveBeenCalledWith({ auth0Id: "auth0|123" });
    expect(saveMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      _id: "123",
      auth0Id: "auth0|123",
      email: "test@test.com",
    });
  });

  it("should return 500 on error when creating user", async () => {
    const req = {
      body: { auth0Id: "auth0|123", email: "test@test.com" },
    } as Request;
    const res = mockResponse();

    (User.findOne as jest.Mock).mockRejectedValue(new Error("Test error"));

    await createCurrentUser(req, res, dummyNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error creating user" });
  });
});

describe("updateCurrentUser", () => {
  it("should update user without a file and return the updated user", async () => {
    const req = {
      userId: "123",
      body: {
        name: "New Name",
        gender: "male",
        city: "City",
        country: "Country",
        originCountry: "Origin",
        nativeLanguage: "English",
        age: 30,
        learningLanguage: "Spanish",
        fluencyLevel: "beginner",
        motivation: "Test motivation",
        selfIntroduction: "Hello!",
      },
    } as Request;
    const res = mockResponse();

    const userMock = {
      _id: "123",
      save: jest.fn().mockResolvedValue(undefined),
    };

    (User.findById as jest.Mock).mockResolvedValue(userMock);

    await updateCurrentUser(req, res, dummyNext);

    expect(User.findById).toHaveBeenCalledWith("123");
    expect(userMock.save).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(userMock);
  });

  it("should update user with a file (using Cloudinary) and return the updated user", async () => {
    // Arrange
    const req = {
      userId: "123",
      body: {
        name: "New Name",
        gender: "male",
        city: "City",
        country: "Country",
        originCountry: "Origin",
        nativeLanguage: "English",
        age: 30,
        learningLanguage: "Spanish",
        fluencyLevel: "beginner",
        motivation: "Test motivation",
        selfIntroduction: "Hello!",
      },
      file: {
        buffer: Buffer.from("image-data"),
        mimetype: "image/png",
      },
    } as unknown as Request;
    const res = mockResponse();

    const cloudinaryResponse = { url: "http://cloudinary.com/image.png" };
    (cloudinary.v2.uploader.upload as jest.Mock).mockResolvedValue(cloudinaryResponse);
    const userMock: any = {
      _id: "123",
      imageUrl: "",
      save: jest.fn().mockResolvedValue(undefined),
    };

    (User.findById as jest.Mock).mockResolvedValue(userMock);

    await updateCurrentUser(req, res, dummyNext);

    expect(cloudinary.v2.uploader.upload).toHaveBeenCalled();
    expect(User.findById).toHaveBeenCalledWith("123");
    expect(userMock.imageUrl).toBe("http://cloudinary.com/image.png");
    expect(userMock.name).toBe("New Name");
    expect(userMock.save).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(userMock);
  });

  it("should return 500 if Cloudinary upload fails", async () => {
    const req = {
      userId: "123",
      body: {
        name: "New Name",
        gender: "male",
        city: "City",
        country: "Country",
        originCountry: "Origin",
        nativeLanguage: "English",
        age: 30,
        learningLanguage: "Spanish",
        fluencyLevel: "beginner",
        motivation: "Test motivation",
        selfIntroduction: "Hello!",
      },
      file: {
        buffer: Buffer.from("image-data"),
        mimetype: "image/png",
      },
    } as unknown as Request;
    const res = mockResponse();

    (cloudinary.v2.uploader.upload as jest.Mock).mockRejectedValue(new Error("Upload error"));

    await updateCurrentUser(req, res, dummyNext);

    expect(cloudinary.v2.uploader.upload).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error uploading image" });
  });

  it("should return 404 if the user is not found", async () => {
    const req = {
      userId: "123",
      body: {
        name: "New Name",
        gender: "male",
        city: "City",
        country: "Country",
        originCountry: "Origin",
        nativeLanguage: "English",
        age: 30,
        learningLanguage: "Spanish",
        fluencyLevel: "beginner",
        motivation: "Test motivation",
        selfIntroduction: "Hello!",
      },
    } as Request;
    const res = mockResponse();

    (User.findById as jest.Mock).mockResolvedValue(null);

    await updateCurrentUser(req, res, dummyNext);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 500 if an error occurs during update", async () => {
    const req = {
      userId: "123",
      body: {
        name: "New Name",
        gender: "male",
        city: "City",
        country: "Country",
        originCountry: "Origin",
        nativeLanguage: "English",
        age: 30,
        learningLanguage: "Spanish",
        fluencyLevel: "beginner",
        motivation: "Test motivation",
        selfIntroduction: "Hello!",
      },
    } as Request;
    const res = mockResponse();

    (User.findById as jest.Mock).mockRejectedValue(new Error("Test error"));

    await updateCurrentUser(req, res, dummyNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Error updating user" });
  });
});