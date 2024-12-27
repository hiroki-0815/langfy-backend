import { Request, RequestHandler, Response } from "express";
import User from "../model/user";

export const getAllUsers: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1); // Ensure positive page number
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    let query: any = {};

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
