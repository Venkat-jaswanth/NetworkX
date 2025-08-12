import "@/css/topbar.css"; // Assuming you have a CSS file for styling

interface TopBarProps {
  toggleLogin: () => void;
  isLoginVisible: boolean;
}

import React, { useEffect, useState } from "react";

const TopBar = ({ toggleLogin, isLoginVisible }: TopBarProps) => {
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setShow(false); // Scrolling down
      } else {
        setShow(true); // Scrolling up
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className={`top-bar${show ? "" : " top-bar--hidden"}`}>
      <div
        className="brand-name"
        onClick={isLoginVisible ? toggleLogin : undefined}
      >
        <h2>Kairo</h2>
      </div>
      <button onClick={toggleLogin}>
        {isLoginVisible ? "Back To Home" : "Sign up"}
      </button>
    </div>
  );
};

export default TopBar;
