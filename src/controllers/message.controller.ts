import { RequestHandler, Request, Response } from "express";
import User from "../model/user";
import Message from "../model/message";
import cloudinary from "cloudinary";
import { getReceiverSocketId, io } from "../lib/socket";

export const getChatUser: RequestHandler =async (req:Request, res:Response) => {
  try {
    const currentUser = await User.findOne({ _id: req.userId });

    if(!currentUser){
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { clickedUserId } = req.query;

    console.log("Received clickedUserId:", clickedUserId);

    const messages = await Message.find({
      $or:[
        {senderId: currentUser._id},
        {receiverId: currentUser._id}
      ],
    })
    .populate("senderId", "name imageUrl")
    .populate("receiverId", "name imageUrl");

    const userIds = new Set<string>();
    messages.forEach(message =>{
      if(message.senderId.toString() !== currentUser._id.toString()){
        userIds.add((message.senderId as any)._id.toString())
      }  
      if(message.receiverId.toString() !== currentUser._id.toString()){
        userIds.add((message.receiverId as any)._id.toString())
      }
    })

    if (clickedUserId && clickedUserId !== currentUser._id.toString()) {
      userIds.add(clickedUserId as string);
    }

    const users = await User.find({
      _id: { $in: Array.from(userIds), $ne: currentUser._id },
    }).select("name imageUrl");

    res.status(200).json(users)
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
}

export const getMessages =async (req: Request, res: Response) => {
  try {
    const {id:userToChatId} = req.params
    const myId = req.userId

    const messages = await Message.find({
      $or:[
        {senderId:myId, receiverId:userToChatId},
        {senderId:userToChatId, receiverId:myId}
      ]
    })

    res.status(200).json(messages)
  } catch (error) {
    console.log(error);
    res.status(500).json({message:"Something went wrong"});
    return;
  }
}

export const sendMessages: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.userId;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.v2.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};