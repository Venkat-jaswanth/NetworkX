import { FaUser, FaSearch, FaComments, FaSignOutAlt } from "react-icons/fa";
import { signOut } from "@/services/authService";
import { useHoverPrefetch } from "../hooks/useHoverPrefetch";
import React from "react";
import type { Page } from "../NetworkX"; 
import "@/css/NavBar.css";

interface NavBarProps {
  currentPage: Page;
  setCurrentPage: React.Dispatch<React.SetStateAction<Page>>;
}

const NavBar: React.FC<NavBarProps> = ({ currentPage, setCurrentPage }) => {
  const { prefetchProfile, prefetchMessages } = useHoverPrefetch();
  return (
    <nav className="navbar">
            
            {/* <div className="navbar-brand">
        <h1>NetworkX</h1>
      </div> */}

<div className="brand-name-container">
      <div
        className="brand-name">
        <span className="brand-name-text">Network</span>
          <span className="brand-name-text" style={{
            color:"var(--c-border-focus)"
          }}>X</span>
      </div>
      </div>
      <div className="navbar-nav">
        <button
          className={`nav-item ${currentPage === "search" ? "active" : ""}`}
          onClick={() => setCurrentPage("search")}
        >
          <FaSearch />
          <span>Search</span>
        </button>
        <button
          className={`nav-item ${currentPage === "messages" ? "active" : ""}`}
          onClick={() => setCurrentPage("messages")}
          onMouseEnter={prefetchMessages}
        >
          <FaComments />
          <span>Messages</span>
        </button>
        <button
          className={`nav-item ${currentPage === "profile" ? "active" : ""}`}
          onClick={() => setCurrentPage("profile")}
          onMouseEnter={prefetchProfile}
        >
          <FaUser />
          <span>Profile</span>
        </button>
      </div>
      <div className="navbar-actions">
        <button className="nav-item sign-out" onClick={signOut}>
          <FaSignOutAlt />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
