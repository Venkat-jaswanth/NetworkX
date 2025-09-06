import React, { useState, useRef, useEffect, Fragment } from "react";
import {
  FaCog,
  FaUserCircle,
  FaShieldAlt,
  FaPalette,
  FaQuestionCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { signOut } from "@/services/authService";
import type { Page } from "../NetworkX";
import { useHoverPrefetch } from "../hooks/useHoverPrefetch";

interface SettingsProps {
setCurrentPage: React.Dispatch<React.SetStateAction<Page>>;
}

const SettingsMenu: React.FC<SettingsProps> = ({ setCurrentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
    const { prefetchProfile } = useHoverPrefetch();
  // Close popup when clicking outside - This logic remains unchanged.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- UPDATED DATA STRUCTURE with onClick, onHover, onLeave ---
  const menuOptions = [
    {
      icon: <FaUserCircle />,
      label: "Profile",
      onClick: () => setCurrentPage("profile"),
      onHover: prefetchProfile,
    },
    {
      icon: <FaShieldAlt />,
      label: "Privacy",
      onClick: () => alert("Privacy clicked"),
    },
    {
      icon: <FaPalette />,
      label: "Theme", // This item now has no actions
    },
    {
      icon: <FaQuestionCircle />,
      label: "Help",
      onClick: () => alert("Help clicked"),
      onHover: () => console.log("Hovering over Help!"),
      onLeave: () => console.log("Left Help hover."),
    },
    {
      icon: <FaSignOutAlt />,
      label: "Sign Out",
      onClick: signOut,
    },
  ];

  return (
    <Fragment>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;500;600;700&display=swap");

        .themed-settings-container {
          position: relative;
          font-family: "Segoe UI", sans-serif;
          z-index: 100;
        }

        .settings-trigger-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          color: #d1d5db; /* Light gray text */
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .settings-trigger-btn .icon {
          font-size: 1.25rem;
          color: #ea580c; /* Fiery orange icon */
          transition: transform 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .settings-trigger-btn:hover {
          background: rgba(234, 88, 12, 0.1); /* Subtle orange glow on hover */
          color: #fff;
        }
        
        .settings-trigger-btn:hover .icon {
            transform: rotate(180deg);
            transition: transform 0.7s ease;
        }

        @keyframes fadeInScaleUp {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .settings-popup {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 220px;
          background: rgba(15, 23, 42, 0.85); /* Semi-transparent dark blue from sidebar */
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(234, 88, 12, 0.2); /* Subtle orange border */
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          z-index: 1000;
          animation: fadeInScaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: top right;
          overflow: hidden;
        }

        .settings-option {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 12px;
          background: none;
          border: none;
          text-align: left;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          color: #d1d5db; /* Light gray text */
          border-radius: 8px;
          transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }

        .settings-option .icon {
            color: #ea580c;
            font-size: 1.1rem;
            display: flex;
        }

        .settings-option:hover {
          background: rgba(234, 88, 12, 0.15); /* Orange highlight on hover */
          color: #fff; /* White text on hover */
          transform: translateX(4px);
        }
      `}</style>

      <div className="themed-settings-container" ref={menuRef}>
        <button
          className="settings-trigger-btn"
          onMouseEnter={() => setIsOpen(true)}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <span className="icon" >
            <FaCog style={{ fontSize: "1.5rem" }} />
          </span>
          {/* <span></span> */}
        </button>

        {isOpen && (
          <div
            className="settings-popup"
            role="menu"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            {menuOptions.map((option) => (
              <button
                key={option.label}
                className="settings-option"
                role="menuitem"
                // --- APPLIED THE FLEXIBLE EVENT HANDLERS ---
                onClick={() => {
                  if (option.onClick) option.onClick();
                  setIsOpen(false); // Close menu after click
                }}
                onMouseEnter={() => {
                  if (option.onHover) option.onHover();
                }}
                onMouseLeave={() => {
                  if (option.onLeave) option.onLeave();
                }}
              >
                <span className="icon">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default SettingsMenu;