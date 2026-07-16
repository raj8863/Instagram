import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserProfile } from "../redux/authSlice.js";

// Ensure axios sends cookies for cross-site requests by default
axios.defaults.withCredentials = true;

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUsersProfile = async () => {
      try {
        const headers = {};
        const token = localStorage.getItem("token");
        if (token) headers.Authorization = `Bearer ${token}`;

        const res = await axios.get(
          `https://instagram-bkev.onrender.com/api/v1/user/${userId}/profile`,
          { headers },
        );
        console.log(res.data);
        if (res.data.success) {
          dispatch(setUserProfile(res.data.user)); // or res.data.profile
        }
      } catch (error) {
        console.error(
          "Error fetching user profile:",
          error.response?.data || error.message || error,
        );
      }
    };

    fetchUsersProfile();
  }, [userId, dispatch]);
};

export default useGetUserProfile;
