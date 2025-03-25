
import { RequestHandler, Request, Response } from "express";
import Comment from "../model/comments"; 
import Post from "../model/posts";       
import mongoose from "mongoose";


export const createComment: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId, text } = req.body;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" })
      return;
    }

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({ error: "Invalid or missing post ID" })
      return;
    }

    if (!text || text.trim() === "") {
      res.status(400).json({ error: "Comment text is required" })
      return;
    }

    const post = await Post.findById(postId);
    if (!post) {
       res.status(404).json({ error: "Post not found" })
       return;
    }

    const newComment = new Comment({
      userId,
      postId,
      text,
    });
    await newComment.save();

    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    const populatedComment = await Comment.findById(newComment._id).populate(
      "userId",
      "name imageUrl"
    );

    const commentsCount = await Comment.countDocuments({ postId });

    res.status(201).json({
      id: populatedComment?._id.toString(),
      postId: populatedComment?.postId.toString(),
      text: populatedComment?.text,
      user: populatedComment?.userId,
      createdAt: populatedComment?.createdAt,
      commentsCount,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getCommentsForPost: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({ error: "Invalid post ID" });
      return;
    }

    const comments = await Comment.find({ postId })
      .sort({ createdAt: 1 })
      .populate("userId", "name imageUrl");

    const formattedComments = comments.map((comment) => ({
      id: comment._id.toString(),
      postId: comment.postId.toString(),
      text: comment.text,
      user: comment.userId,
      createdAt: comment.createdAt,
    }));

    res.status(200).json({
      comments: formattedComments,
      commentsCount: formattedComments.length,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteComment: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      res.status(400).json({ error: "Invalid comment ID" });
      return;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    if (comment.userId.toString() !== userId) {
      res.status(403).json({ error: "Forbidden: You cannot delete this comment" });
      return;
    }

    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
