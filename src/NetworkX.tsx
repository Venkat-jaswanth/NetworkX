import { useOnboarding } from "@/hooks/useOnboarding";
import OnboardingForm from "./components/OnboardingForm";
import Loader from "./components/Loader";
import { useState } from "react";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Search from "@/pages/Search";
import Messages from "@/pages/Messages";
import Feed from "@/main-layout/Feed";
import InterviewPosts from "@/main-layout/interviewposts";
import Resources from "@/main-layout/Resources";
import Opportunities from "@/main-layout/Opportunities";
import Roadmap from "@/main-layout/Roadmap";

import "@/css/networkx.css";

import NavBar from "./main-layout/NavBar";
import LeftSideBar from "./main-layout/LeftSideBar";

export type Page =
  | "home"
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
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(false);

  if (loading) {
    return <Loader />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingForm onComplete={() => window.location.reload()} />;
  }

  const renderMainContent = () => {
    switch (currentPage) {
      case "home":
        return <Home />;
      case "profile":
        return <Profile />;
      case "search":
        return <Search />;
      case "messages":
        return <Messages />;
      case "feed":
        return <Feed />;
      case "interviews":
        return <InterviewPosts />;
      case "resources":
        return <Resources />;
      case "opportunities":
        return <Opportunities />;
      case "roadmaps":
        return <Roadmap />;
      case "find-mentor":
        return <div>Find a Mentor Feature Coming Soon</div>;
      default:
        return <Home />;
    }
  };

  return (
    <div className="networkx-container">
      <NavBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div
        className={`content-wrapper ${
          sidebarExpanded ? "shift-expanded" : "shift-collapsed"
        }`}
      >
        <LeftSideBar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onExpandChange={setSidebarExpanded}
        />
        {/* Main Content */}
        <main className="main-content">{renderMainContent()}</main>
      </div>
    </div>
  );
}
