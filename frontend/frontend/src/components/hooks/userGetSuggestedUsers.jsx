import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setSuggestedUsers } from "../redux/authSlice.js";

const useGetSuggestUsers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const res = await axios.get(
          "https://instagram-bkev.onrender.com/api/v1/user/suggested",
          {
            withCredentials: true,
          },
        );

        if (res.data.success) {
          dispatch(setSuggestedUsers(res.data.users || []));
        }
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      }
    };

    fetchSuggestedUsers();
  }, [dispatch]);
};

export default useGetSuggestUsers;
