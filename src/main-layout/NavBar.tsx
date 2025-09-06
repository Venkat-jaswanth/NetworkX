import {FaSearch, FaComments} from "react-icons/fa";
import { useHoverPrefetch } from "../hooks/useHoverPrefetch";
import React from "react";
import type { Page } from "../NetworkX"; 
import "@/css/NavBar.css";
import SettingsMenu from "./SettingsMenu";
interface NavBarProps {
  currentPage: Page;
  setCurrentPage: React.Dispatch<React.SetStateAction<Page>>;
}

const NavBar: React.FC<NavBarProps> = ({ currentPage, setCurrentPage }) => {
  const {prefetchMessages } = useHoverPrefetch();
  return (
    <nav className="navbar">
            
            {/* <div className="navbar-brand">
        <h1>NetworkX</h1>
      </div> */}

<div className="nav-brand-name-container">
      <div
        className="nav-brand-name">
        <span className="nav-brand-name-text">Network</span>
          <span className="nav-brand-name-text" style={{
            color:"var(--c-border-focus)"
          }}>X</span>
      </div>
      </div>


      <div className="navbar-nav">
        <button
          className={`nav-item ${currentPage === "search" ? "active" : ""}`}
          onClick={() => setCurrentPage("search")}
        >
          <FaSearch style={{ fontSize: "1.5rem" }} />
          <span>Search</span>
        </button>
        <button
          className={`nav-item nav-item-large ${currentPage === "messages" ? "active" : ""}`}
          onClick={() => setCurrentPage("messages")}
          onMouseEnter={prefetchMessages}
          style={{ fontSize: "1.1rem", padding: "0.75rem 1.5rem" }}
        >
          <FaComments style={{ fontSize: "1.5rem" }} />
          {/* <span style={{ fontSize: "1.2rem" }}>Messages</span> */}
        </button>
        <SettingsMenu setCurrentPage={setCurrentPage} />
      </div>
    </nav>
  );
};

export default NavBar;
