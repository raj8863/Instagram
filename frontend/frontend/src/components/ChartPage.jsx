import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { MessageCircleCode } from "lucide-react";
import { setSelectedUser } from "../components/redux/authSlice";
import { setMessages } from "./redux/chartSlice";
import Messages from "./Messages"; // Make sure the path matches your project structure

const ChatPage = () => {
  const dispatch = useDispatch();

  const { userProfile, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth,
  );
  const { onlineUsers, messages } = useSelector((store) => store.chat);

  const [textMessage, setTextMessage] = useState("");

  // Determine if the currently selected user is online
  const isSelectedUserOnline = onlineUsers?.includes(selectedUser?._id);

  // FIX 1: Fetch actual specific user messages when selectedUser changes
  useEffect(() => {
    const fetchConversation = async () => {
      if (!selectedUser?._id) return;
      try {
        const res = await axios.get(
          `https://instagram-bkev.onrender.com/api/v1/message/all/${selectedUser._id}`,
          { withCredentials: true }
        );
        if (res.data.success) {
          dispatch(setMessages(res.data.messages));
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        dispatch(setMessages([])); // Reset messages on error
      }
    };

    fetchConversation();
  }, [selectedUser?._id, dispatch]);

  // Clean up selected user when leaving page
  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, [dispatch]);

  const handleSendMessage = async () => {
    if (!selectedUser?._id || !textMessage.trim()) return;

    try {
      const res = await axios.post(
        `https://instagram-bkev.onrender.com/api/v1/message/send/${selectedUser._id}`,
        {
          message: textMessage.trim(),
        },
        { withCredentials: true },
      );

      if (res.data.success) {
        dispatch(setMessages([...(messages || []), res.data.newMessage]));
        setTextMessage("");
      }
    } catch (error) {
      console.error(
        "Message send failed:",
        error.response?.data || error.message,
      );
    }
  };

  return (
    <div className="flex max-w-5xl mx-auto h-[85vh] border border-gray-200 rounded-lg overflow-hidden bg-white mt-4">
      {/* Left Sidebar */}
      <section className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
        <h1 className="text-xl font-bold mb-4">
          {userProfile?.username || "My Profile"}
        </h1>

        <hr className="mb-4" />

        <div className="space-y-2">
          {suggestedUsers?.map((user) => {
            const isOnline = onlineUsers?.includes(user?._id);

            return (
              <div
                key={user._id}
                onClick={() => dispatch(setSelectedUser(user))}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                  selectedUser?._id === user._id
                    ? "bg-gray-100"
                    : "hover:bg-gray-50"
                }`}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={user.profilePicture} />
                  <AvatarFallback>
                    {user.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <span className="font-semibold">{user.username}</span>
                  <span
                    className={`text-xs ${
                      isOnline ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Right Chat Grid View */}
      <section className="flex-1 flex flex-col bg-gray-50">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-white">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedUser.profilePicture} />
                <AvatarFallback>
                  {selectedUser.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <h2 className="font-semibold">{selectedUser.username}</h2>
                <p
                  className={`text-xs ${
                    isSelectedUserOnline ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {isSelectedUserOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            {/* FIX 2: Replaced old hardcoded template block with the dedicated Messages UI component */}
            <Messages selectedUser={selectedUser} />

            {/* Input fields */}
            <div className="flex items-center gap-2 border-t p-4 bg-white">
              <input
                type="text"
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center flex-1 text-gray-500">
            <MessageCircleCode size={70} />
            <h2 className="text-2xl font-semibold mt-4">Your Messages</h2>
            <p className="text-sm">Send a message to start a chat.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ChatPage;
