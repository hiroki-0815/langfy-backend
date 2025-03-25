import express from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { createComment, deleteComment, getCommentsForPost } from "../controllers/comments.controller";

const router = express.Router();

router.post("/", jwtCheck, jwtParse, createComment);
router.get("/:postId", jwtCheck, jwtParse, getCommentsForPost);
router.delete("/:commentId", jwtCheck, jwtParse, deleteComment);

export default router;
