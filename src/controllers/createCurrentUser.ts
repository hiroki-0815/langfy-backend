import {Request, RequestHandler, Response} from "express"
import User from "../model/user";

export const createCurrentUser: RequestHandler = async(req:Request, res: Response): Promise<void>=>{
try {
  const {auth0Id} = req.body;
  const existingUser = await User.findOne({auth0Id})

  if(existingUser) {
   res.status(200).send();
   return
  }

  const newUser = new User(req.body)
  await newUser.save();

  res.status(201).json(newUser.toObject())
} catch (error) {
  console.log(error);
  res.status(500).json({message: "Error creating user"})
}
}