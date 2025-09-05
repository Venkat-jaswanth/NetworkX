import React, { useState, useCallback } from "react";
import {
  FaNewspaper,
  FaBook,
  FaLightbulb,
  FaBriefcase,
  FaRoad,
  FaUserFriends,
} from "react-icons/fa";
import "@/css/leftsidebar.css";
import type { Page } from "../NetworkX";

interface LeftSideBarProps {
  currentPage: Page;
  setCurrentPage: React.Dispatch<React.SetStateAction<Page>>;
  onExpandChange?: (expanded: boolean) => void;
}

const LeftSideBar: React.FC<LeftSideBarProps> = ({
  currentPage,
  setCurrentPage,
  onExpandChange,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleMouseEnter = useCallback(() => {
    setIsExpanded(true);
    onExpandChange?.(true);
  }, [onExpandChange]);

  const handleMouseLeave = useCallback(() => {
    setIsExpanded(false);
    onExpandChange?.(false);
  }, [onExpandChange]);

  const navItems = [
    { icon: <FaNewspaper />, label: "Feed", path: "feed" },
    { icon: <FaBook />, label: "Experiences", path: "interviews" },
    { icon: <FaLightbulb />, label: "Resources", path: "resources" },
    { icon: <FaBriefcase />, label: "Opportunities", path: "opportunities" },
    { icon: <FaRoad />, label: "Roadmaps", path: "roadmaps" },
    { icon: <FaUserFriends />, label: "Find a Mentor", path: "find-mentor" },
  ];

  return (
    <div
      className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <nav className="nav-menu">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => setCurrentPage(item.path as Page)}
            className={`nav-link ${currentPage === item.path ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default LeftSideBar;
