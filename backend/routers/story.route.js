import express from "express";
import { addStory, getStories } from "../controllers/story.controller.js"; 
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js"; 

const router = express.Router();

router.route("/add").post(isAuthenticated, upload.single('image'), addStory);


router.route("/all").get(isAuthenticated, getStories); 

export default router;