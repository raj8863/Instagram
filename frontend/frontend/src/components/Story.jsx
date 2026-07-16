import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Plus, X } from "lucide-react";
import { useSelector } from "react-redux";

const Stories = () => {
  const [groupedStories, setGroupedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Ref to trigger file input programmatically without label side-effects
  const fileInputRef = useRef(null);

  // Fetch logged in user state context from Redux
  const { user } = useSelector((store) => store.auth) || {};

  // Modal Player States
  const [currentUserIndex, setCurrentUserIndex] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Helper function to group flat stories by User
  const groupStoriesByUser = (flatStories) => {
    const groups = {};

    flatStories.forEach((story) => {
      const userId = story.user?._id || "anonymous";
      if (!groups[userId]) {
        groups[userId] = {
          user: story.user,
          items: [],
        };
      }
      groups[userId].items.push(story);
    });

    return Object.values(groups);
  };

  const fetchStories = async () => {
    try {
      const res = await axios.get("https://instagram-bkev.onrender.com/api/v1/story/all", {
        withCredentials: true,
      });

      const flatStories = res.data.stories || [];
      const grouped = groupStoriesByUser(flatStories);
      setGroupedStories(grouped);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Timer effect for the active story progress bar
  useEffect(() => {
    if (currentUserIndex === null) return;

    setProgress(0);
    const duration = 4000;
    const intervalTime = 40;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          handleNextStory();
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentUserIndex, currentStoryIndex]);

  const handleNextStory = () => {
    const activeUser = groupedStories[currentUserIndex];
    if (!activeUser) return closePlayer();

    if (currentStoryIndex + 1 < activeUser.items.length) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else if (currentUserIndex + 1 < groupedStories.length) {
      setCurrentUserIndex((prev) => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      closePlayer();
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex - 1 >= 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    } else if (currentUserIndex - 1 >= 0) {
      const prevUserIndex = currentUserIndex - 1;
      setCurrentUserIndex(prevUserIndex);
      setCurrentStoryIndex(groupedStories[prevUserIndex].items.length - 1);
    }
  };

  const closePlayer = () => {
    setCurrentUserIndex(null);
    setCurrentStoryIndex(0);
    setProgress(0);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);
      const res = await axios.post(
        "http://localhost:8001/api/v1/story/add",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );
      if (res.data.success) fetchStories();
    } catch (error) {
      console.error("Error uploading story:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleOwnCircleClick = (myStoryGroup) => {
    if (myStoryGroup) {
      // If user has active stories, open the player modal
      const globalIdx = groupedStories.findIndex(
        (g) => g.user?._id === user?._id,
      );
      if (globalIdx !== -1) {
        setCurrentUserIndex(globalIdx);
        setCurrentStoryIndex(0);
      }
    } else {
      // If user has no stories, trigger hidden file picker programmatically
      if (!uploading && fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  if (loading)
    return <div className="text-center p-4 text-gray-500">Loading...</div>;

  const activeUserGroup =
    currentUserIndex !== null ? groupedStories[currentUserIndex] : null;
  const currentOpenStory = activeUserGroup
    ? activeUserGroup.items[currentStoryIndex]
    : null;

  // Segregate active user's story stack safely
  const myStoryGroup = groupedStories.find(
    (group) => group.user?._id === user?._id,
  );
  const otherUsersStories = groupedStories.filter(
    (group) => group.user?._id !== user?._id,
  );

  return (
    <div className="bg-white border rounded-lg p-4 mb-6 w-full shadow-sm relative">
      <div className="flex gap-4 overflow-x-auto max-w-full pb-2 scrollbar-none items-center">
        {/* HIDDEN FILE PICKER REF */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={uploading}
        />

        {/* LOGGED IN USER'S OWN STORY CIRCLE */}
        <div className="flex flex-col items-center flex-shrink-0 w-16 text-center">
          <div
            onClick={() => handleOwnCircleClick(myStoryGroup)}
            className="flex flex-col items-center cursor-pointer group w-full"
          >
            <div
              className={`w-14 h-14 rounded-full p-[2px] transition-all flex items-center justify-center ${myStoryGroup ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:scale-105" : "border-2 border-dashed border-gray-300 bg-gray-50"}`}
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              ) : myStoryGroup ? (
                <img
                  src={
                    user?.profilePicture || "https://via.placeholder.com/150"
                  }
                  alt="my-avatar"
                  className="w-full h-full rounded-full border-2 border-white object-cover"
                />
              ) : (
                <Plus className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
              )}
            </div>
            <p className="text-[11px] mt-2 text-center text-gray-500 font-medium truncate w-full">
              Your Story
            </p>
          </div>
        </div>

        {/* FEED STORIES ARRAY */}
        {otherUsersStories.map((group) => {
          const globalIdx = groupedStories.findIndex(
            (g) => g.user?._id === group.user?._id,
          );

          return (
            <div
              key={group.user?._id}
              onClick={() => {
                if (globalIdx !== -1) {
                  setCurrentUserIndex(globalIdx);
                  setCurrentStoryIndex(0);
                }
              }}
              className="flex flex-col items-center flex-shrink-0 w-16 cursor-pointer"
            >
              <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px] rounded-full hover:scale-105 transition-transform">
                {group.user?.profilePicture ? (
                  <img
                    src={group.user.profilePicture}
                    alt="user"
                    className="w-14 h-14 rounded-full border-2 border-white object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-sm">
                    {group.user?.username?.substring(0, 2).toUpperCase() || "U"}
                  </div>
                )}
              </div>
              <p className="text-[11px] mt-2 truncate w-full text-center text-gray-700 font-medium">
                {group.user?.username || "anonymous"}
              </p>
            </div>
          );
        })}
      </div>

      {/* FULLSCREEN STORY PLAYER */}
      {currentOpenStory && activeUserGroup && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center select-none">
          <div className="absolute inset-0" onClick={closePlayer} />

          <div className="relative w-full max-w-md h-[85vh] bg-zinc-900 md:rounded-xl overflow-hidden flex flex-col z-10 shadow-2xl">
            {/* Navigation Strip */}
            <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/60 to-transparent z-30 space-y-3">
              <div className="w-full flex gap-1 h-1">
                {activeUserGroup.items.map((_, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-white/30 h-full rounded-full overflow-hidden"
                  >
                    <div
                      className="bg-white h-full transition-all linear duration-40"
                      style={{
                        width:
                          idx < currentStoryIndex
                            ? "100%"
                            : idx === currentStoryIndex
                              ? `${progress}%`
                              : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <img
                    src={
                      currentOpenStory.user?.profilePicture ||
                      "https://via.placeholder.com/150"
                    }
                    className="w-8 h-8 rounded-full object-cover border border-white/20"
                    alt="avatar"
                  />
                  <span className="text-xs font-semibold">
                    {currentOpenStory.user?.username || "User"}
                  </span>
                </div>
                <button
                  onClick={closePlayer}
                  className="hover:text-gray-300 transition p-1 relative z-40"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Click regions */}
            <div
              className="absolute top-16 bottom-0 left-0 w-1/2 z-20 cursor-w-resize"
              onClick={handlePrevStory}
            />
            <div
              className="absolute top-16 bottom-0 right-0 w-1/2 z-20 cursor-e-resize"
              onClick={handleNextStory}
            />

            {/* Media Display Container */}
            <div className="w-full h-full flex items-center justify-center bg-zinc-950">
              <img
                src={currentOpenStory.image}
                alt="Story View"
                className="w-full max-h-full object-contain pointer-events-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;
