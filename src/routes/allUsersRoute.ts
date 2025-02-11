import express from "express"
import { jwtCheck, jwtParse } from "../middleware/auth";
import { getAllUsers } from "../controllers/all.users.controller";

const router = express.Router();

router.get('/',jwtCheck,jwtParse, getAllUsers)

export default router