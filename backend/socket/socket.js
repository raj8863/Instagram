import { Server } from "socket.io";
import express from "express";
import http from "http";
import jwt from "jsonwebtoken";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Maps userId -> socket.id
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  if (!receiverId || typeof userSocketMap !== "object" || userSocketMap === null) {
    return undefined;
  }
  return userSocketMap[receiverId];
};

// Helper function to parse raw cookies from socket handshake headers
const parseCookies = (cookieString) => {
  const cookies = {};
  if (!cookieString) return cookies;
  cookieString.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    cookies[parts.shift().trim()] = decodeURI(parts.join("="));
  });
  return cookies;
};

// Socket.io Authentication Middleware
io.use((socket, next) => {
  try {
    const rawCookies = socket.handshake.headers.cookie;
    const cookies = parseCookies(rawCookies);
    const token = cookies.token;

    if (!token) {
      return next(new Error("Authentication error: No token found"));
    }

    // Decode and verify the JWT token using your secret key
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded || !decoded.userId) {
      return next(new Error("Authentication error: Invalid token"));
    }

    // Attach verified userId to the socket object safely
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Socket Auth Error:", error.message);
    return next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId; // Retrieved securely from the JWT token

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User connected: UserId = ${userId}, SocketId = ${socket.id}`);
  }

  // Send updated online users list to everyone
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if (userId) {
      console.log(`User disconnected: UserId = ${userId}, SocketId = ${socket.id}`);
      
      // FIX: Only delete from map if the disconnecting socket is the CURRENT active one.
      // This prevents a page refresh (which creates a new socket before killing the old one) 
      // from accidentally deleting the newly refreshed connection.
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io };