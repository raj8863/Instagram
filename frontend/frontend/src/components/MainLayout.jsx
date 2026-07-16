import React from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      <LeftSidebar />

      <main className="ml-[16%] flex justify-center">
        <div className="w-full max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;