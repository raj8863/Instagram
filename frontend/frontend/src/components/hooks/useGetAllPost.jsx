import { setPosts } from "../redux/postSlice.js";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

const useGetAllPost = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAllPost = async () => {
      try {
        const res = await axios.get("http://localhost:8001/api/v1/post/all", {
          withCredentials: true,
        });

        if (res.data.success) {
          // 🔵 FIXED: Actually update your Redux store with the payload array!
          // Make sure 'res.data.posts' matches your backend JSON payload structure
          dispatch(setPosts(res.data.posts || res.data.allPosts));
          console.log("Posts synced to Redux successfully:", res.data);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchAllPost();
  }, [dispatch]); // Added dispatch to dependency array for safety guarantees
};

export default useGetAllPost;
