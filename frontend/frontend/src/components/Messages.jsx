import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useGetRTM from "./hooks/useGetRTM";

const Messages = ({ selectedUser }) => {
  // Pull real-time global messages and current log profile tracking criteria
  useGetRTM();
  const { messages } = useSelector((store) => store.chat);
  const { userProfile } = useSelector((store) => store.auth);

  return (
    <div className="overflow-y-auto flex-1 p-4 space-y-3">
      {/* Upper Bio presentation panel */}
      <div className="flex justify-center mb-4">
        <div className="flex flex-col items-center justify-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
            <AvatarFallback>
              {selectedUser?.username?.slice(0, 2).toUpperCase() || "CN"}
            </AvatarFallback>
          </Avatar>

          <span className="font-semibold mt-2">{selectedUser?.username}</span>
          <Link to={`/profile/${selectedUser?._id}`}>
            <Button className="h-8 my-2" variant="secondary">
              View profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Dynamic Messaging list render rendering pipeline */}
      {messages && messages.length > 0 ? (
        messages.map((msg) => {
          const isMyMessage = msg.senderId === userProfile?._id;

          return (
            <div
              key={msg._id || Math.random()}
              className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg text-sm shadow-sm ${
                  isMyMessage
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-center text-gray-400 text-sm py-8">
          No messages yet. Say hello!
        </p>
      )}
    </div>
  );
};

export default Messages;