import express from "express"
import { createCurrentUser, getCurrentUser, updateCurrentUser } from "../controllers/createCurrentUser";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyUserRequest } from "../middleware/validation";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5mb
  },
});

router.get('/',jwtCheck,jwtParse, getCurrentUser)
router.post("/",jwtCheck, createCurrentUser)
router.put(
  "/",
  jwtCheck,
  jwtParse,
  upload.single("imageFile"),
  validateMyUserRequest,
  updateCurrentUser
);

export default router