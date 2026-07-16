import React, { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { AtSign, Heart, MessageCircle, Grid, Bookmark, PlaySquare, UserSquare2 } from "lucide-react";

import useGetUserProfile from "./hooks/useGetUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

// 1. Extracted to map icons to tabs for a better UI
const TAB_CONFIG = {
  posts: { icon: <Grid size={16} />, label: "Posts" },
  saved: { icon: <Bookmark size={16} />, label: "Saved" },
  reels: { icon: <PlaySquare size={16} />, label: "Reels" },
  tags: { icon: <UserSquare2 size={16} />, label: "Tagged" },
};

const Profile = () => {
  const { id: userId } = useParams();
  useGetUserProfile(userId);

  const { userProfile, user: loggedInUser } = useSelector((store) => store.auth);
  const [activeTab, setActiveTab] = useState("posts");

  const isLoggedInUserProfile = loggedInUser?._id === userProfile?._id;
  const isFollowing = loggedInUser?.following?.includes(userProfile?._id);

  // 2. Dynamically determine available tabs (hide "saved" if not the logged-in user)
  const availableTabs = useMemo(() => {
    const baseTabs = ["posts", "reels", "tags"];
    return isLoggedInUserProfile ? ["posts", "saved", "reels", "tags"] : baseTabs;
  }, [isLoggedInUserProfile]);

  // 3. Memoized derived state to prevent unnecessary recalculations
  const displayedPosts = useMemo(() => {
    switch (activeTab) {
      case "posts":
        return userProfile?.posts || [];
      case "saved":
        return userProfile?.bookmarks || [];
      default:
        return [];
    }
  }, [activeTab, userProfile]);

  // 4. Loading state handling (optional but recommended)
  if (!userProfile) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    // 5. Improved responsiveness (px-4 for mobile, pl-10 for larger screens)
    <div className="mx-auto flex max-w-5xl justify-center px-4 md:pl-10">
      <div className="flex w-full flex-col gap-12 md:gap-20 py-8">
        
        {/* Profile Header section - responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 items-center">
          <section className="flex justify-center md:col-span-1">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={userProfile?.profilePicture} alt={`${userProfile?.username}'s profile`} />
              <AvatarFallback className="text-xl md:text-3xl font-semibold">
                {userProfile?.username ? userProfile.username.substring(0, 2).toUpperCase() : "NA"}
              </AvatarFallback>
            </Avatar>
          </section>

          <section className="md:col-span-2 flex flex-col items-center md:items-start text-center md:text-left gap-5">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <span className="text-xl font-bold">{userProfile?.username}</span>
              <div className="flex gap-2">
                {isLoggedInUserProfile ? (
                  <>
                    <Link to="/account/edit">
                      <Button variant="secondary" className="h-8 hover:bg-gray-200">
                        Edit profile
                      </Button>
                    </Link>
                    <Button variant="secondary" className="h-8 hover:bg-gray-200 hidden sm:flex">
                      View archive
                    </Button>
                    <Button variant="secondary" className="h-8 hover:bg-gray-200 hidden sm:flex">
                      Ad tools
                    </Button>
                  </>
                ) : isFollowing ? (
                  <>
                    <Button variant="secondary" className="h-8 w-24">Unfollow</Button>
                    <Button variant="secondary" className="h-8 w-24">Message</Button>
                  </>
                ) : (
                  <Button className="h-8 w-24 bg-[#0095F6] text-white hover:bg-[#1877F2]">
                    Follow
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 md:gap-10">
              <p><span className="font-semibold">{userProfile?.posts?.length || 0}</span> posts</p>
              <p><span className="font-semibold">{userProfile?.followers?.length || 0}</span> followers</p>
              <p><span className="font-semibold">{userProfile?.following?.length || 0}</span> following</p>
            </div>

            <div className="flex flex-col items-center md:items-start gap-2">
              <span className="text-sm font-medium whitespace-pre-wrap">
                {userProfile?.bio || "No bio yet..."}
              </span>
              <Badge className="w-fit" variant="secondary">
                <AtSign className="h-3 w-3 mr-1" />
                <span>{userProfile?.username}</span>
              </Badge>
            </div>
          </section>
        </div>

        {/* Tabs System */}
        <div className="border-t border-t-gray-200">
          <div className="flex items-center justify-center gap-8 md:gap-16 text-xs md:text-sm tracking-widest uppercase">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 py-4 font-semibold transition-colors ${
                  activeTab === tab
                    ? "border-t border-black text-black -mt-[1px]"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {TAB_CONFIG[tab].icon}
                <span className="hidden sm:inline">{TAB_CONFIG[tab].label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Display Grid System */}
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {displayedPosts.length > 0 ? (
            displayedPosts.map((post, idx) => (
              <div
                key={post?._id || `post-${idx}`}
                className="group relative aspect-square cursor-pointer overflow-hidden bg-gray-100"
              >
                <img
                  src={post?.image}
                  alt={`Post by ${userProfile?.username}`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-6 bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div className="flex items-center gap-2 text-white">
                    <Heart className="fill-white" />
                    <span className="font-bold">{post?.likes?.length || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white">
                    <MessageCircle className="fill-white" />
                    <span className="font-bold">{post?.comments?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 flex flex-col items-center justify-center py-20 text-gray-500">
              <div className="mb-4 rounded-full border-2 border-gray-500 p-4">
                {TAB_CONFIG[activeTab].icon}
              </div>
              <h1 className="text-2xl font-bold text-black">No {TAB_CONFIG[activeTab].label} Yet</h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;