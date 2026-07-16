import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../redux/chartSlice.js";

const useGetAllMessage = () => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((store) => store.auth);

  useEffect(() => {
    const fetchAllMessage = async () => {
      if (!selectedUser?._id) return;

      try {
        const res = await axios.get(
          `https://instagram-bkev.onrender.com/api/v1/message/all/${selectedUser._id}`,
          { withCredentials: true },
        );

        if (res.data.success) {
          dispatch(setMessages(res.data.messages || []));
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchAllMessage();
  }, [dispatch, selectedUser?._id]);
};

export default useGetAllMessage;
