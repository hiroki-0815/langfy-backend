import { Request, RequestHandler, Response } from "express";
import User from "../model/user";

export const getAllUsers: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const pageSize = Math.max(parseInt(req.query.pageSize as string) || 10, 1);
    const skip = (page - 1) * pageSize;

    const {
      gender,
      country,
      originCountry,
      nativeLanguage,
      fluencyLevel,
      motivation,
      minAge,
      maxAge,
    } = req.query;

    let query: any = {};

    if (gender) query.gender = gender;
    if (country) query.country = country;
    if (originCountry) query.originCountry = originCountry;
    if (nativeLanguage) query.nativeLanguage = nativeLanguage;
    if (fluencyLevel) query.fluencyLevel = fluencyLevel;
    if (motivation) query.motivation = motivation;

    if (minAge || maxAge) {
      query.age = {};
      if (minAge) query.age.$gte = parseInt(minAge as string);
      if (maxAge) query.age.$lte = parseInt(maxAge as string);
    }

    const users = await User.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(pageSize)
      .lean()
      .exec();

    const total = await User.countDocuments(query).exec();

    const response = {
      data: users,
      pagination: {
        total,
        page,
        pageSize,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
