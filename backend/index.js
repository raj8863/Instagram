import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import UserRoute from "./routers/user_router.js";
import postRoute from "./routers/post_router.js";
import messageRoute from "./routers/message_route.js";
import storyRoute from "./routers/story.route.js";
import { app, server } from "./socket/socket.js";
dotenv.config();

const PORT = Number(process.env.PORT) || 8000;

// ==========================================
// MIDDLEWARES (Configured before routes)
// ==========================================
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// ==========================================
// ROUTES
// ==========================================
app.get("/", (_, res) => {
  return res.status(200).json({
    message: "I'm coming from backend",
    success: true,
  });
});

app.use("/api/v1/user", UserRoute);
app.use("/api/v1/post", postRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/story", storyRoute);

// ==========================================
// START SERVER & CONNECT DB
// ==========================================
const startServer = (portToUse) => {
  server.once("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const fallbackPort = portToUse === 0 ? 8001 : 0;
      console.warn(
        `Port ${portToUse} is already in use. Trying ${fallbackPort === 0 ? "a random free port" : fallbackPort}...`,
      );
      startServer(fallbackPort);
    } else {
      console.error("Server error:", error);
      process.exit(1);
    }
  });

  server.listen(portToUse, async () => {
    try {
      await connectDB();
      const address = server.address();
      const actualPort =
        typeof address === "object" && address ? address.port : portToUse;
      console.log(`Server listening at port ${actualPort}`);
    } catch (error) {
      console.log("Database connection failed during boot:", error);
    }
  });
};

startServer(PORT);
