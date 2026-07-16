import React from "react";
import Feed from "./Feed";
import Stories from "./Story";
import RightSidebar from "./RightSiderbar";
import useGetAllPost from "./hooks/useGetAllPost";
import useGetSuggestUsers from "./hooks/userGetSuggestedUsers";

const Home = () => {
  useGetAllPost();
  useGetSuggestUsers();
  return (
    <div className="flex justify-center gap-8 px-6 py-6">
      <div className="w-full max-w-xl">
        <Stories />
        <Feed />
      </div>

      <div className="hidden lg:block w-[320px]">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;
