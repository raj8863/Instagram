import React, { useState } from "react";
import {
  Heart,
  Home as HomeIcon,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button"; // Added missing import
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "./redux/authSlice.js";
import CreatePost from "./CreatePost.jsx";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  // Grab the states correctly from Redux
  const { user } = useSelector((store) => store.auth);
  const { likeNotification } = useSelector((store) => store.realTimeNotification);

  const logoutHandler = async () => {
    try {
      const res = await axios.get("https://instagram-bkev.onrender.com/api/v1/user/logout", {
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(setAuthUser(null));
        localStorage.removeItem("user");
        toast.success(res.data.message || "Logged out successfully");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong during logout");
    }
  };

  const sidebarHandler = (textType) => {
    switch (textType) {
      case "Home":
        navigate("/");
        break;
      case "Profile":
        const userId = user?._id || user?.id;
        if (userId) {
          navigate(`/profile/${userId}`);
        } else {
          toast.error("User profile ID not found. Please log in again.");
        }
        break;
      case "Messages":
        navigate("/chat"); // Corrected path variant if needed
        break;
      case "Create":
        setOpen(true);
        break;
      case "Logout":
        logoutHandler();
        break;
      default:
        break;
    }
  };

  const sidebarItems = [
    { icon: <HomeIcon />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <TrendingUp />, text: "Explore" },
    { icon: <MessageCircle />, text: "Messages" },
    { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className="h-6 w-6">
          <AvatarImage src={user?.profilePicture} alt="profile" />
          <AvatarFallback>
            {user?.username ? user.username.substring(0, 2).toUpperCase() : "CN"}
          </AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { icon: <LogOut />, text: "Logout" },
  ];

  return (
    <div className="fixed top-0 left-0 z-10 h-screen w-[16%] border-r border-gray-200 bg-white px-4 flex flex-col justify-between py-6">
      <div className="flex flex-col">
        <h1 className="my-8 pl-3 text-xl font-bold tracking-wider">Logo</h1>
        <div className="space-y-1">
          {sidebarItems.map((item, index) => {
            // Base layout row item structure
            const itemContent = (
              <div
                onClick={() => item.text !== "Notifications" && sidebarHandler(item.text)}
                className="relative flex cursor-pointer items-center gap-4 rounded-lg p-3 hover:bg-gray-100 transition duration-200 text-sm font-medium w-full"
              >
                {item.icon}
                <span className="hidden xl:inline">{item.text}</span>

                {/* Badge layout indicator */}
                {item.text === "Notifications" && likeNotification.length > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {likeNotification.length}
                  </span>
                )}
              </div>
            );

            // Wrap notifications item exclusively with Popover container
            if (item.text === "Notifications") {
              return (
                <Popover key={index}>
                  <PopoverTrigger asChild>{itemContent}</PopoverTrigger>
                  <PopoverContent className="w-80 ml-4" side="right" align="start">
                    <div className="space-y-3">
                      <h3 className="font-semibold border-b pb-2 text-sm text-gray-700">Notifications</h3>
                      {likeNotification.length === 0 ? (
                        <p className="text-sm text-gray-500 py-2 text-center">No new notifications</p>
                      ) : (
                        likeNotification.map((notification, idx) => (
                          <div key={notification.userId || idx} className="flex items-center gap-3 py-1">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={notification.userDetails?.profilePicture} />
                              <AvatarFallback>
                                {notification.userDetails?.username?.substring(0, 2).toUpperCase() || "UN"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                              <span className="font-semibold mr-1">{notification.userDetails?.username}</span>
                              <span className="text-gray-600">liked your post. ❤️</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              );
            }

            return <React.Fragment key={index}>{itemContent}</React.Fragment>;
          })}
        </div>
      </div>

      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
};

export default LeftSidebar;
