import { Request, RequestHandler, Response } from "express";
import User from "../model/user";

export const getAllUsers: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit as string) || 10, 1); 
    const skip = (page - 1) * limit;

    const {
      gender,
      country,
      originCountry,
      nativeLanguage,
      fluencyLevel,
      motivation,
      ageMin,      
      ageMax,      
      learningLanguage, 
    } = req.query;

    let query: any = {};

    if (gender) query.gender = gender;
    if (country) query.country = country;
    if (originCountry) query.originCountry = originCountry;
    if (nativeLanguage) query.nativeLanguage = nativeLanguage;
    if (fluencyLevel) query.fluencyLevel = fluencyLevel;
    if (motivation) query.motivation = motivation;
    if (learningLanguage) query.learningLanguage = learningLanguage;

    if (ageMin || ageMax) {  
      query.age = {};
      if (ageMin) query.age.$gte = parseInt(ageMin as string);
      if (ageMax) query.age.$lte = parseInt(ageMax as string);
    }

    if (req.userId) {
      query._id = { $ne: req.userId };
    }

    const users = await User.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const total = await User.countDocuments(query).exec();

    const response = {
      data: users,
      pagination: {
        total,
        page,
        limit, 
        pages: Math.ceil(total / limit),
      },
    };

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};