import { useOnboarding } from "@/hooks/useOnboarding";
import OnboardingForm from "./components/OnboardingForm";
import Loader from "./components/Loader";
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
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
  const { hasCompletedOnboarding, loading } = useOnboarding();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);
  
  // Get current page from URL path
  const currentPage = getPageFromPath(location.pathname);

  if (loading) {
    return <Loader />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingForm onComplete={() => navigate('/', { replace: true })} />;
  }

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
