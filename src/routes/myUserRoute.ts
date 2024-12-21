import express from "express"
import { createCurrentUser, updateCurrentUser } from "../controllers/createCurrentUser";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyUserRequest } from "../middleware/validation";

const router = express.Router();

router.post("/",jwtCheck, createCurrentUser)
router.put("/",jwtCheck, jwtParse, validateMyUserRequest, updateCurrentUser)

export default router