import { Request, RequestHandler, Response } from "express";
import User from "../model/user";
import cloudinary from "cloudinary";

export const getCurrentUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const currentUser = await User.findOne({ _id: req.userId });
    if (!currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(currentUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};

export const createCurrentUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { auth0Id } = req.body;
    const existingUser = await User.findOne({ auth0Id });

    if (existingUser) {
      res.status(200).send();
      return;
    }

    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).json(newUser.toObject());
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

export const updateCurrentUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      gender,
      city,
      country,
      nationality,
      nativeLanguage,
      age,
      learningLanguage,
      fluencyLevel,
      motivation,
      selfIntroduction,
    } = req.body;

    let uploadResponse;
    if (req.file) {
      const image = req.file as Express.Multer.File;
      const base64Image = Buffer.from(image.buffer).toString("base64");
      const dataURI = `data:${image.mimetype};base64,${base64Image}`;

      // Add Cloudinary upload with logging
      try {
        uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
        console.log("Cloudinary upload successful:", uploadResponse.url);
      } catch (uploadError) {
        console.error("Cloudinary upload failed:", uploadError);
        res.status(500).json({ message: "Error uploading image" });
        return;
      }
    }

    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (uploadResponse) {
      user.imageUrl = uploadResponse.url;
    }

    user.name = name;
    user.gender = gender;
    user.city = city;
    user.country = country;
    user.nationality = nationality;
    user.nativeLanguage = nativeLanguage;
    user.age = age;
    user.learningLanguage = learningLanguage;
    user.fluencyLevel = fluencyLevel;
    user.motivation = motivation;
    user.selfIntroduction = selfIntroduction;

    await user.save();

    res.send(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};

