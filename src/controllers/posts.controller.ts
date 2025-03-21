import { RequestHandler, Request, Response } from "express";
import Post from "../model/posts";
import mongoose from "mongoose";
import User from "../model/user";

export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.userId; 

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId).select("learningLanguage nativeLanguage");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const filter: any = {};

    const matchingUsers = await User.find({
      learningLanguage: user.nativeLanguage,
      nativeLanguage: user.learningLanguage,
    }).select("_id");

    if (matchingUsers.length > 0) {
      filter["userId"] = { $in: matchingUsers.map((u) => u._id) };
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate<{ userId: { _id: string; name: string; nativeLanguage: string; learningLanguage: string; imageUrl: string } }>(
        "userId",
        "name nativeLanguage learningLanguage imageUrl"
      );

    const formattedPosts = posts.map((post) => ({
      id: post._id.toString(),
      content: post.content,
      authorId: post.userId._id.toString(),
      name: post.userId.name,
      nativeLanguage: post.userId.nativeLanguage,
      learningLanguage: post.userId.learningLanguage,
      imageUrl: post.userId.imageUrl,
      likesCount: post.likes.length,
      createdAt: post.createdAt,
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSelfPosts: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const filter = { userId };

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate<{ userId: { _id: string; name: string; nativeLanguage: string; learningLanguage: string; imageUrl: string } }>(
        "userId",
        "name nativeLanguage learningLanguage imageUrl"
      );

    const formattedPosts = posts.map((post) => ({
      id: post._id.toString(),
      content: post.content,
      authorId: post.userId._id.toString(),
      name: post.userId.name,
      nativeLanguage: post.userId.nativeLanguage,
      learningLanguage: post.userId.learningLanguage,
      imageUrl: post.userId.imageUrl,
      likesCount: post.likes.length,
      createdAt: post.createdAt,
    }));

    res.status(200).json(formattedPosts);
  } catch (error) {
    console.error("Error fetching self posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createPost: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content,
      } = req.body;
    const userId = req.userId; 

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return;
    }

    if (!content || content.trim() === "") {
      res.status(400).json({ error: "Content is required" })
      return;
    }

    const newPost = new Post({
      userId,
      content,
      likes: [],
    });

    await newPost.save();

    res.status(201).json({
      id: newPost._id.toString(),
      content: newPost.content,
      authorId: newPost.userId.toString(),
      likesCount: newPost.likes.length,
      createdAt: newPost.createdAt,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const likePost: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId,
      } = req.params;
    const userId = req.userId; 

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
    return}

    const post = await Post.findById(postId);
    if (!post) {
      res.status(400).json({ error: "Post not found" });
    return}

    const userObjectId = new mongoose.Types.ObjectId(userId);

    if (post.likes.some((like) => like.equals(userObjectId))) {
      res.status(400).json({ error: "Post already liked" });
      return;
    }

    post.likes.push(userObjectId);
    await post.save();

    res.status(200).json({
      id: post._id.toString(),
      content: post.content,
      authorId: post.userId.toString(),
      likesCount: post.likes.length,
      createdAt: post.createdAt,
    });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const unlikePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId,
      } = req.params;
    const userId = req.userId; 

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(400).json({ error: "Post not found" });
      return;
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    if (!post.likes.some((like) => like.equals(userObjectId))) {
      res.status(400).json({ error: "Post not liked yet" });
      return;
    }

    post.likes = post.likes.filter((like) => !like.equals(userObjectId));
    await post.save();

    res.status(200).json({
      id: post._id.toString(),
      content: post.content,
      authorId: post.userId.toString(),
      likesCount: post.likes.length,
      createdAt: post.createdAt,
    });
  } catch (error) {
    console.error("Error unliking post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = req.userId; 

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({ error: "Invalid post ID" });
      return;
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    if (post.userId.toString() !== userId) {
      res.status(403).json({ error: "Forbidden: You are not the owner of this post" });
      return;
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
