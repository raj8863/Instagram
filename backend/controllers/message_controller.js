import Conversation from "../models/conversation_models.js";
import { Message } from "../models/message_model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
// for chatting
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { message } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");
    // establish the conversation if not started yet.
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
    });

    conversation.messages = conversation.messages || [];
    if (newMessage) conversation.messages.push(newMessage._id);

    await Promise.all([conversation.save(), newMessage.save()]);

    // Implement socket io for real time data transfer
    let receiverSocketId;
    try {
      receiverSocketId = getReceiverSocketId(receiverId);
    } catch (socketLookupError) {
      console.error("getReceiverSocketId failed:", socketLookupError);
    }

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send message",
      error: error.message,
    });
  }
};

export const getMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;  
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages"); 

    if (!conversation)
      return res.status(200).json({ success: true, messages: [] });
      
    return res
      .status(200)
      .json({ success: true, messages: conversation?.messages });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
