import express from "express"
import { jwtCheck, jwtParse } from "../middleware/auth";
import { getChatUser, getMessages, sendMesages } from "../controllers/message.controller";

const router = express.Router();

router.get('/users',jwtCheck,jwtParse, getChatUser)
router.get('/:id',jwtCheck,jwtParse, getMessages)

router.post("/send/:id,", jwtCheck, jwtParse, sendMesages)

export default router