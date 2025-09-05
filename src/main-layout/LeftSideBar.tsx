import React, { useState, useCallback, useEffect, Fragment } from "react";
import {
  FaNewspaper,
  FaBook,
  FaLightbulb,
  FaBriefcase,
  FaRoad,
  FaUserFriends,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import type {Page} from "../NetworkX";

interface LeftSideBarProps {
  currentPage: Page;
  setCurrentPage: React.Dispatch<React.SetStateAction<Page>>;
  onExpandChange?: (expanded: boolean) => void;
}

const ResponsiveSidebar: React.FC<LeftSideBarProps> = ({
  currentPage,
  setCurrentPage,
  onExpandChange,
}) => {
  // --- State for tracking screen size ---
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- State and handlers for Desktop Sidebar ---
  const [isDesktopExpanded, setIsDesktopExpanded] = useState<boolean>(false);

  // On desktop, we notify the parent to move content.
  const handleMouseEnter = useCallback(() => {
    setIsDesktopExpanded(true);
    onExpandChange?.(true);
  }, [onExpandChange]);
  const handleMouseLeave = useCallback(() => {
    setIsDesktopExpanded(false);
    onExpandChange?.(false);
  }, [onExpandChange]);

  // --- State and handlers for Mobile Sidebar ---
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  
  // On mobile, the state is self-contained. We DO NOT notify the parent.
  const toggleMobileMenu = useCallback(() => {
    setIsMobileOpen(prevState => !prevState);
    // The onExpandChange call is intentionally removed here.
    // This prevents the main content from being pushed on mobile.
  }, []);

  const handleMobileNavigation = (page: Page) => {
    setCurrentPage(page);
    toggleMobileMenu(); // Close menu after selection
  };

  // --- Common Navigation Items ---
  const navItems = [
    { icon: <FaNewspaper />, label: "Feed", path: "feed" },
    { icon: <FaBook />, label: "Experiences", path: "interviews" },
    { icon: <FaLightbulb />, label: "Resources", path: "resources" },
    { icon: <FaBriefcase />, label: "Opportunities", path: "opportunities" },
    { icon: <FaRoad />, label: "Roadmaps", path: "roadmaps" },
    { icon: <FaUserFriends />, label: "Find a Mentor", path: "find-mentor" },
  ];

  return (
    <Fragment>
      <style>{`
        /* --- Universal Font Import --- */
        @import url("https://fonts.googleapis.com/css2?family=Anta&family=Segoe+UI:wght@400;500;600;700&display=swap");

        /* --- DESKTOP SIDEBAR STYLES (> 768px) --- */
        :root {
          --desktop-sidebar-bg: linear-gradient(120deg, #0f172a, #0f172a8e, #ea580c);
          --desktop-link-active: linear-gradient(90deg, #ea580c, rgba(234, 88, 12, 0.1));
          --desktop-sidebar-bg-focus: linear-gradient(120deg, #0f172a, #0f172a8e, #ea580c);
          --desktop-sidebar-collapsed: 80px;
          --desktop-sidebar-expanded: 250px;
        }

        .desktop-sidebar {
          background: var(--desktop-sidebar-bg);
          height: calc(100vh - 90px);
          backdrop-filter: blur(15px);
          color: white;
          height: calc(100vh - 90px);
          position: fixed;
          left: 20px;
          top: 80px;
          border-radius: 20px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          font-family: "Segoe UI", sans-serif;
        }
        .desktop-sidebar:hover {
          background: var(--desktop-sidebar-bg-focus);
        }
        .desktop-sidebar.collapsed {
          width: var(--desktop-sidebar-collapsed);
        }
        .desktop-sidebar.expanded {
          width: var(--desktop-sidebar-expanded);
        }
        .desktop-sidebar .nav-menu {
          flex-grow: 1;
          padding: 8px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .desktop-sidebar .nav-link {
          color: #ea580c;
          padding: 10px;
          margin: 0.25rem 0;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          border-radius: 10px;
          transition: all 0.2s ease;
          white-space: nowrap;
          background: transparent;
          width: 100%;
          text-align: left;
          overflow: hidden;
          position: relative;
          z-index: 1;
          border: none;
          cursor: pointer;
        }
        .desktop-sidebar .nav-text {
          color: antiquewhite;
          opacity: 0;
          max-width: 0;
          transition: opacity 0.2s ease, max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .desktop-sidebar.expanded .nav-text {
          opacity: 1;
          max-width: 150px; 
          transition-delay: 0.1s;
        }
        .desktop-sidebar.collapsed .nav-link {
          justify-content: center;
        }
        .desktop-sidebar .nav-link:hover {
          background: rgba(234, 88, 12, 0.15);
          color: #fff;
          transform: translateX(4px);
        }
        .desktop-sidebar.collapsed .nav-link:hover {
           transform: scale(1.06) translateX(0);
        }
        .desktop-sidebar .nav-link::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: var(--desktop-link-active);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.5s ease, height 0.5s ease;
          z-index: -1;
        }
        .desktop-sidebar .nav-link.active {
          color: #fff;
          scale: 1.05;
        }
        .desktop-sidebar .nav-link.active::before {
          width: 300%;
          height: 300%;
        }
        .desktop-sidebar .nav-icon {
          font-size: 1.25rem;
          min-width: 24px;
          text-align: center;
        }

        /* --- MOBILE SIDEBAR STYLES (<= 768px) --- */
        :root {
          --mobile-sidebar-bg: linear-gradient(140deg, #0f172a, #1e293b);
          --mobile-sidebar-highlight: #ea580c;
          --mobile-sidebar-highlight-transparent: rgba(234, 88, 12, 0.1);
          --mobile-link-active: linear-gradient(90deg, #ea580c, rgba(234, 88, 12, 0.2));
          --mobile-sidebar-expanded-width: 280px;
        }
        .hamburger-menu {
          position: fixed;
          top: 10px;
          left: 10px;
          z-index: 1010;
          background-color: var(--mobile-sidebar-highlight);
          border: none;
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 5px 20px rgba(234, 88, 12, 0.5);
          transition: transform 0.2s ease, background-color 0.2s ease;
        }
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          z-index: 1000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease-in-out;
        }
        .sidebar-overlay.visible {
          opacity: 1;
          pointer-events: auto;
        }
        .mobile-sidebar {
          background: var(--mobile-sidebar-bg);
          color: white;
          height: 100vh;
          width: var(--mobile-sidebar-expanded-width);
          position: fixed;
          top: 0;
          left: 0;
          border-radius: 0 15px 15px 0;
          z-index: 1005;
          display: flex;
          flex-direction: column;
          font-family: "Segoe UI", sans-serif;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transform: translateX(-100%);
          transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
        .mobile-sidebar.open {
          transform: translateX(0);
        }
        .mobile-sidebar .sidebar-header {
          padding: 1rem 1.25rem;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          min-height: 80px;
        }
        .mobile-sidebar .close-btn {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 1.75rem;
          cursor: pointer;
        }
        .mobile-sidebar .nav-menu {
          flex-grow: 1;
          padding: 0 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .mobile-sidebar .nav-link {
          color: #d1d5db;
          padding: 12px 15px;
          display: flex;
          align-items: center;
          gap: 15px;
          font-weight: 500;
          border-radius: 10px;
          background: transparent;
          width: 100%;
          text-align: left;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }
        .mobile-sidebar .nav-icon {
          color: var(--mobile-sidebar-highlight);
          font-size: 1.25rem;
          min-width: 24px;
        }
        .mobile-sidebar .nav-link:hover {
          background: var(--mobile-sidebar-highlight-transparent);
          color: #fff;
          transform: translateX(5px);
        }
        .mobile-sidebar .nav-link.active {
          background: var(--mobile-link-active);
          color: #fff;
          font-weight: 600;
        }
      `}</style>

      {/* --- Conditional Rendering Logic --- */}
      {isMobile ? (
        // --- MOBILE VIEW ---
        <Fragment>
          <button className="hamburger-menu" onClick={toggleMobileMenu} aria-label="Open menu">
            <FaBars />
          </button>
          <div className={`sidebar-overlay ${isMobileOpen ? "visible" : ""}`} onClick={toggleMobileMenu}></div>
          <div className={`mobile-sidebar ${isMobileOpen ? "open" : ""}`}>
            <div className="sidebar-header">
              <button className="close-btn" onClick={toggleMobileMenu} aria-label="Close menu">
                <FaTimes />
              </button>
            </div>
            <nav className="nav-menu">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleMobileNavigation(item.path as Page)}
                  className={`nav-link ${currentPage === item.path ? "active" : ""}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </Fragment>
      ) : (
        // --- DESKTOP VIEW ---
        <div
          className={`desktop-sidebar ${isDesktopExpanded ? "expanded" : "collapsed"}`}
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
      )}
    </Fragment>
  );
};

export default ResponsiveSidebar;

