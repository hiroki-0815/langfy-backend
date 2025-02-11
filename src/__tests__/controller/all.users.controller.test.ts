import { Request, Response } from "express";
import User from "../../model/user";
import { getAllUsers } from "../../controllers/all.users.controller";

jest.mock("../../model/user");

const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const dummyNext = jest.fn();

describe("getAllUsers - Age Filter", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should add age filter when both ageMin and ageMax are provided", async () => {
    const req = {
      query: {
        page: "1",
        limit: "10",
        ageMin: "18",
        ageMax: "30",
      },
    } as unknown as Request;
    const res = mockResponse();

    const fakeUsers = [{ name: "Alice", age: 25 }];
    const fakeTotal = 1;

    const execFindMock = jest.fn().mockResolvedValue(fakeUsers);
    const sortMock = jest.fn().mockReturnThis();
    const skipMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockReturnThis();
    const leanMock = jest.fn().mockReturnThis();
    (User.find as jest.Mock).mockReturnValue({
      sort: sortMock,
      skip: skipMock,
      limit: limitMock,
      lean: leanMock,
      exec: execFindMock,
    });

    const execCountMock = jest.fn().mockResolvedValue(fakeTotal);
    (User.countDocuments as jest.Mock).mockReturnValue({
      exec: execCountMock,
    });

    await getAllUsers(req, res, dummyNext);

    const expectedQuery = {
      age: { $gte: 18, $lte: 30 },
    };
    expect(User.find).toHaveBeenCalledWith(expectedQuery);
    expect(sortMock).toHaveBeenCalledWith({ name: 1 });
    expect(skipMock).toHaveBeenCalledWith(0);
    expect(limitMock).toHaveBeenCalledWith(10);

    const expectedResponse = {
      data: fakeUsers,
      pagination: {
        total: fakeTotal,
        page: 1,
        limit: 10,
        pages: Math.ceil(fakeTotal / 10),
      },
    };
    expect(res.json).toHaveBeenCalledWith(expectedResponse);
  });

  it("should add age filter when only ageMin is provided", async () => {
    const req = {
      query: {
        page: "1",
        limit: "10",
        ageMin: "21",
      },
    } as unknown as Request;
    const res = mockResponse();

    const fakeUsers = [{ name: "Bob", age: 25 }];
    const fakeTotal = 1;

    const execFindMock = jest.fn().mockResolvedValue(fakeUsers);
    const sortMock = jest.fn().mockReturnThis();
    const skipMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockReturnThis();
    const leanMock = jest.fn().mockReturnThis();
    (User.find as jest.Mock).mockReturnValue({
      sort: sortMock,
      skip: skipMock,
      limit: limitMock,
      lean: leanMock,
      exec: execFindMock,
    });

    const execCountMock = jest.fn().mockResolvedValue(fakeTotal);
    (User.countDocuments as jest.Mock).mockReturnValue({
      exec: execCountMock,
    });

    await getAllUsers(req, res, dummyNext);

    const expectedQuery = {
      age: { $gte: 21 },
    };
    expect(User.find).toHaveBeenCalledWith(expectedQuery);
  });

  it("should add age filter when only ageMax is provided", async () => {
    const req = {
      query: {
        page: "1",
        limit: "10",
        ageMax: "40",
      },
    } as unknown as Request;
    const res = mockResponse();

    const fakeUsers = [{ name: "Carol", age: 35 }];
    const fakeTotal = 1;

    // Chainable mocks for User.find()
    const execFindMock = jest.fn().mockResolvedValue(fakeUsers);
    const sortMock = jest.fn().mockReturnThis();
    const skipMock = jest.fn().mockReturnThis();
    const limitMock = jest.fn().mockReturnThis();
    const leanMock = jest.fn().mockReturnThis();
    (User.find as jest.Mock).mockReturnValue({
      sort: sortMock,
      skip: skipMock,
      limit: limitMock,
      lean: leanMock,
      exec: execFindMock,
    });

    const execCountMock = jest.fn().mockResolvedValue(fakeTotal);
    (User.countDocuments as jest.Mock).mockReturnValue({
      exec: execCountMock,
    });

    await getAllUsers(req, res, dummyNext);

    const expectedQuery = {
      age: { $lte: 40 },
    };
    expect(User.find).toHaveBeenCalledWith(expectedQuery);
  });
});

describe("getAllUsers - Error Handling", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should catch errors and return 500", async () => {
    const req = { query: {} } as unknown as Request;
    const res = mockResponse();

    (User.find as jest.Mock).mockImplementation(() => {
      throw new Error("Test error");
    });

    await getAllUsers(req, res, dummyNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Something went wrong" });
  });
});

it("should add gender, country, originCountry, etc. to the query if present", async () => {
  const req = {
    query: {
      page: "1",
      limit: "10",
      gender: "male",
      country: "USA",
      originCountry: "Japan",
      nativeLanguage: "English",
      fluencyLevel: "C1",
      motivation: "business",
      learningLanguage: "German",
    },
  } as unknown as Request;

  const res = mockResponse();

  const fakeUsers = [{ name: "Test" }];
  const fakeTotal = 1;
  const execFindMock = jest.fn().mockResolvedValue(fakeUsers);
  const sortMock = jest.fn().mockReturnThis();
  const skipMock = jest.fn().mockReturnThis();
  const limitMock = jest.fn().mockReturnThis();
  const leanMock = jest.fn().mockReturnThis();
  (User.find as jest.Mock).mockReturnValue({
    sort: sortMock,
    skip: skipMock,
    limit: limitMock,
    lean: leanMock,
    exec: execFindMock,
  });

  const execCountMock = jest.fn().mockResolvedValue(fakeTotal);
  (User.countDocuments as jest.Mock).mockReturnValue({
    exec: execCountMock,
  });

  await getAllUsers(req, res, dummyNext);

  expect(User.find).toHaveBeenCalledWith({
    gender: "male",
    country: "USA",
    originCountry: "Japan",
    nativeLanguage: "English",
    fluencyLevel: "C1",
    motivation: "business",
    learningLanguage: "German",
  });

  expect(res.json).toHaveBeenCalledWith({
    data: fakeUsers,
    pagination: {
      total: fakeTotal,
      page: 1,
      limit: 10,
      pages: 1,
    },
  });
});