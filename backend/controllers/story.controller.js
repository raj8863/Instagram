import Story from "../models/story.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

// ==========================================
// 1. FETCH ALL ACTIVE STORIES
// ==========================================
export const getStories = async (req, res) => {
    try {
        const userId = req.id || req.user?._id; 

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User context not found. Please log in again."
            });
        }
        // Fetches active, non-expired stories
        const stories = await Story.find({
            expiresAt: { $gt: new Date() },
        })
        .populate("user", "username profilePicture") 
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            stories,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// ==========================================
// 2. UPLOAD & CREATE A NEW STORY
// ==========================================
export const addStory = async (req, res) => {
    try {
        // CRITICAL FIX: Fallback check to capture user ID from your authentication middleware setup
        const userId = req.id || req.user?._id || req.user?.id; 

        if (!userId) {
            return res.status(401).json({
                message: "User not authenticated. Please log in again.",
                success: false
            });
        }

        const file = req.file; 

        if (!file) {
            return res.status(400).json({
                message: "Please upload an image for your story.",
                success: false
            });
        }

        // Convert file buffer to Data URI and upload to Cloudinary
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri, {
            folder: "instagram_stories"
        });

        const newStory = await Story.create({
            user: userId, // Tied correctly to logged-in user (Krity)
            image: cloudResponse.secure_url
        });

        // Populate user data right away for immediate frontend rendering
        await newStory.populate({ path: 'user', select: 'username profilePicture' });

        return res.status(201).json({
            message: "Story uploaded successfully!",
            success: true,
            story: newStory
        });

    } catch (error) {
        console.log("Add Story Error:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};