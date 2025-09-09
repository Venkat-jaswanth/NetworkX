import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { getPageFromPath } from "@/routes";

import "@/css/networkx.css";

import NavBar from "./main-layout/NavBar";
import LeftSideBar from "./main-layout/LeftSideBar";

export type Page =
  | "profile"
  | "search"
  | "messages"
  | "feed"
  | "interviews"
  | "resources"
  | "opportunities"
  | "roadmaps"
  | "find-mentor";

export default function NetworkX() {
  const location = useLocation();
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);
  
  // Get current page from URL path
  const currentPage = getPageFromPath(location.pathname);

  return (
    <div className="networkx-container">
      <NavBar currentPage={currentPage} />
      <div
        className={`content-wrapper ${
          sidebarExpanded ? "shift-expanded" : "shift-collapsed"
        }`}
      >
        <LeftSideBar
          currentPage={currentPage}
          onExpandChange={setSidebarExpanded}
        />
        {/* Main Content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
