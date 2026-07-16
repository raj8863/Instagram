import React from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import Suggested from "./Suggested.user";
import { Link } from "react-router-dom";

const RightSidebar = () => {
  const { user } = useSelector((store) => store.auth);

  return (
    <div className="w-fit my-10 pr-32 text-sm">
      <div className="flex items-start gap-3">
        <Link to={`/profile/${user?._id}`}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.profilePicture} />
            <AvatarFallback>
              {user?.username?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Link>

        {/* Username & Bio */}
        <div className="flex flex-col">
          <Link
            to={`/profile/${user?._id}`}
            className="font-semibold text-sm hover:underline"
          >
            {user?.username || "Unknown User"}
          </Link>

          <p className="text-xs text-gray-500 max-w-[220px] break-words leading-4">
            {user?.bio || "Bio here..."}
          </p>
        </div>
      </div>

      <Suggested />
    </div>
  );
};

export default RightSidebar;