import express from "express"
import { createPost, deletePost, getAllPosts, getPost, getSelfPosts, getUserPosts, likePost, unlikePost, } from "../controllers/posts.controller";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = express.Router();

router.get('/',
jwtCheck,jwtParse,
getAllPosts)

router.post('/',
jwtCheck,jwtParse,
 createPost)

router.post('/:postId/like',
jwtCheck,jwtParse,
 likePost)

router.post('/:postId/unlike',
jwtCheck,jwtParse,
 unlikePost)

router.delete('/:postId/',
jwtCheck,jwtParse,
deletePost)

router.get('/self',
jwtCheck,jwtParse,
getSelfPosts)

router.get('/:postId/',
jwtCheck,jwtParse,
getPost)

router.get('/user/:userId/',
jwtCheck,jwtParse,
getUserPosts)

export default router;