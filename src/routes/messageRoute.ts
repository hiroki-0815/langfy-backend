import express from "express"
import { jwtCheck, jwtParse } from "../middleware/auth";
import { getMessages, getUsersForMessageSidebar, sendMesages } from "../controllers/message.controller";

const router = express.Router();

router.get('/users',jwtCheck,jwtParse, getUsersForMessageSidebar)
router.get('/:id',jwtCheck,jwtParse, getMessages)

router.post("/send/:id,", jwtCheck, jwtParse, sendMesages)

export default router