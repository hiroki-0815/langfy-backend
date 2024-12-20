import express from "express"
import { createCurrentUser } from "../controllers/createCurrentUser";

const router = express.Router();

router.post("/", createCurrentUser)

export default router