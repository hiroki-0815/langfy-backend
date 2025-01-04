import express from "express"
import { jwtCheck, jwtParse } from "../middleware/auth";
import { getChatUser, getMessages, sendMessages} from "../controllers/message.controller";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.get('/users',jwtCheck,jwtParse, getChatUser)
router.get('/:id',jwtCheck,jwtParse, getMessages)

router.post(
"/send/:id",
upload.single("imageFile"),
jwtCheck,
jwtParse,
sendMessages)

export default router