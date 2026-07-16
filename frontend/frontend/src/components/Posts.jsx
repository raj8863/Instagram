import React from "react";
import Post from "./Post";
import { useSelector } from "react-redux";

const Posts = () => {
  // Pull array cleanly from store state
  const posts = useSelector((store) => store.post?.posts);

  console.log("Current Feed Posts:", posts);

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center mt-10 text-gray-500">
        No Posts Available
      </div>
    );
  }

  return (
    <div className="w-full">
      {posts.map((post) => (
        <Post
          key={post._id || post.id} // Safeguard fallback if your API returns standard structural 'id'
          post={post} // 🔵 FIXED: Changed postData to post to match Post.jsx props structure
        />
      ))}
    </div>
  );
};

export default Posts;