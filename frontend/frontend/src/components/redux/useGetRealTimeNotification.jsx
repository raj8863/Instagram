import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLikeNotification } from "../redux/rtnSlice";

const useGetRealTimeNotification = () => {
  const dispatch = useDispatch();
  const { socket } = useSelector((store) => store.socketio);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingNotification = (res) => {
      // Expecting backend response payload payload: { type: "like" | "dislike", userId, postId, userDetails }
      dispatch(setLikeNotification(res));
    };

    socket.on("notification", handleIncomingNotification);

    return () => {
      socket.off("notification", handleIncomingNotification);
    };
  }, [socket, dispatch]);
};

export default useGetRealTimeNotification;
