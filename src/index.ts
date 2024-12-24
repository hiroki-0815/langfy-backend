import express, {Request, Response} from "express"
import cors from "cors"
import "dotenv/config"
import mongoose from "mongoose";
import myUserRoute from './routes/myUserRoute'
import {v2 as cloudinary} from "cloudinary"

const PORT = process.env.PORT || 7001;

mongoose.connect(process.env.MONGODB_CONNECTION_STRING as string).then(()=>{
  console.log("Connected to database");
  
})
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

const app = express();

app.use(cors())
app.use("/api/my/user", myUserRoute)
app.use(express.json())

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});    