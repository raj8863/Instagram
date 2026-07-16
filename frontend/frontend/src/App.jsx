import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./components/Home";
import Profile from "./components/Profile";
import MainLayout from "./components/MainLayout";
import Signup from "./components/Signup";
import Login from "./components/Login";
import EditProfile from "./components/EditProfile";
import ChartPage from "./components/ChartPage";
import { io } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setOnlineUsers } from "./components/redux/chartSlice";
import { useEffect } from "react";
import { setLikeNotification } from "./components/redux/rtnSlice";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "profile/:id", element: <Profile /> },
      { path: "account/edit", element: <EditProfile /> },
      { path: "chat", element: <ChartPage /> },
      { path: "chart", element: <ChartPage /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
]);

// EXPORT THIS: This lets other files import the live socket safely without Redux!
export let liveSocket = null;

function App() {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      liveSocket = io("http://localhost:8001", {
        query: { userId: user._id },
        transports: ["websocket"],
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      liveSocket.on("getOnlineUsers", (onlineUsers) => {
        dispatch(setOnlineUsers(onlineUsers));
      });
      liveSocket.on("notification", (notification) => {
        dispatch(setLikeNotification(notification));
      });
      // Don't store Socket in Redux - it's not serializable. Use liveSocket global instead.

      // Handle back-forward cache - disconnect when page is hidden
      const handlePageHide = () => {
        if (liveSocket) {
          liveSocket.disconnect();
        }
      };

      // Reconnect when page comes back from cache
      const handlePageShow = () => {
        if (liveSocket && !liveSocket.connected) {
          liveSocket.connect();
        }
      };

      window.addEventListener("pagehide", handlePageHide);
      window.addEventListener("pageshow", handlePageShow);

      return () => {
        window.removeEventListener("pagehide", handlePageHide);
        window.removeEventListener("pageshow", handlePageShow);
        if (liveSocket) {
          liveSocket.close();
          liveSocket = null;
        }
      };
    }
  }, [user, dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
