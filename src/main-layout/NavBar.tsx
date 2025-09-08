import {FaSearch, FaComments} from "react-icons/fa";
import { useHoverPrefetch } from "../hooks/useHoverPrefetch";
import React from "react";
import { Link } from "react-router-dom";
import type { Page } from "../NetworkX"; 
import "@/css/NavBar.css";
import SettingsMenu from "./SettingsMenu";
interface NavBarProps {
  currentPage: Page;
}

const NavBar: React.FC<NavBarProps> = ({ currentPage }) => {
  const { prefetchMessages, prefetchSearch, prefetchProfile, prefetchFeed } = useHoverPrefetch();
  return (
    <nav className="navbar">
            
            {/* <div className="navbar-brand">
        <h1>NetworkX</h1>
      </div> */}

<div className="nav-brand-name-container">
      <Link
        to="/"
        className="nav-brand-name"
        onMouseEnter={prefetchFeed}
        style={{ cursor: "pointer", textDecoration: "none" }}>
        <span className="nav-brand-name-text">Network</span>
          <span className="nav-brand-name-text" style={{
            color:"var(--c-border-focus)"
          }}>X</span>
      </Link>
      </div>


      <div className="navbar-nav">
        <Link
          to="/search"
          className={`nav-item ${currentPage === "search" ? "active" : ""}`}
          onMouseEnter={prefetchSearch}
        >
          <FaSearch style={{ fontSize: "1.5rem" }} />
          <span>Search</span>
        </Link>
        <Link
          to="/messages"
          className={`nav-item nav-item-large ${currentPage === "messages" ? "active" : ""}`}
          onMouseEnter={prefetchMessages}
          style={{ fontSize: "1.1rem", padding: "0.75rem 1.5rem", textDecoration: "none" }}
        >
          <FaComments style={{ fontSize: "1.5rem" }} />
          {/* <span style={{ fontSize: "1.2rem" }}>Messages</span> */}
        </Link>
        <SettingsMenu onHoverProfile={prefetchProfile} />
      </div>
    </nav>
  );
};

export default NavBar;
