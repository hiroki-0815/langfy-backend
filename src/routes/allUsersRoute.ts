import express from "express"
import { jwtCheck, jwtParse } from "../middleware/auth";
import { getAllUsers } from "../controllers/getAllUsers";


const router = express.Router();

router.get('/',jwtCheck,jwtParse, getAllUsers)

export default router