import express from "express"
import { createCurrentUser, getCurrentUser, getUserByQuery, updateCurrentUser } from "../controllers/user.controller";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyUserRequest } from "../middleware/validation";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
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
  updateCurrentUser,
);
router.get('/byQuery', getUserByQuery);

export default router