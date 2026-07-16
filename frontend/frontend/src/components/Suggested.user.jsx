import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const SuggestedUsers = () => {
  const suggested = useSelector((store) => store.auth?.suggestedUsers) || [];

  return (
    <div className="w-full mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-gray-500">
          Suggested for you
        </h2>

        <button className="text-xs font-semibold text-black hover:text-gray-600 transition">
          See All
        </button>
      </div>

      {suggested.length === 0 ? (
        <p className="text-sm text-gray-400">
          No suggestions available.
        </p>
      ) : (
        <div className="space-y-4">
          {suggested.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between group"
            >
              {/* Left Side */}
              <Link
                to={`/profile/${user._id}`}
                className="flex items-center gap-3"
              >
                <Avatar className="h-11 w-11 ring-1 ring-gray-200">
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback>
                    {user?.username?.slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900 group-hover:underline">
                    {user?.username}
                  </span>

                  <span className="text-xs text-gray-500 truncate max-w-[150px]">
                    {user?.bio || "Suggested for you"}
                  </span>
                </div>
              </Link>

              {/* Right Side */}
              <button className="text-xs font-semibold text-sky-500 hover:text-sky-700 transition-colors">
                Follow
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestedUsers;