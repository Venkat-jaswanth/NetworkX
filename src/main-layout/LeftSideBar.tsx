import { useState } from 'react';

import "../css/LeftSideBar.css";

// Type definitions
interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
}

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    navItems: NavItem[];
}

interface UserProfileFooterProps {
    collapsed: boolean;
    isHovered: boolean;
}
// --- SVG Icon Components ---
// Using inline SVGs makes the component self-contained.
const IconReact = () => <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M440.2 203.5c-3.1-11.2-13.2-19.5-25.2-19.5s-22.1 8.3-25.2 19.5c-16.1 57.8-63.3 102.6-121.5 116.4-58.2-13.8-105.4-58.6-121.5-116.4-3.1-11.2-13.2-19.5-25.2-19.5s-22.1 8.3-25.2 19.5c-20.4 73.1 4.7 153.1 75.9 192.9 71.2 39.8 158.3 22.1 208.2-48.2 49.9-70.3 32.2-157.4-48.2-208.2zM256 32c-20.2 0-38.2 11.4-46.1 29.5-7.9-18.1-25.9-29.5-46.1-29.5-28.2 0-51.2 22.9-51.2 51.2 0 16.2 7.6 30.7 19.5 40-57.8 16.1-102.6 63.3-116.4 121.5-11.2 3.1-19.5 13.2-19.5 25.2s8.3 22.1 19.5 25.2c13.8 58.2 58.6 105.4 116.4 121.5-11.9 9.3-19.5 23.8-19.5 40 0 28.2 22.9 51.2 51.2 51.2 20.2 0 38.2-11.4 46.1-29.5 7.9 18.1 25.9 29.5 46.1 29.5 28.2 0 51.2-22.9 51.2-51.2 0-16.2-7.6-30.7-19.5-40 57.8-16.1 102.6-63.3 116.4-121.5 11.2-3.1 19.5-13.2 19.5-25.2s-8.3-22.1-19.5-25.2c-13.8-58.2-58.6-105.4-116.4-121.5 11.9-9.3 19.5-23.8 19.5-40 0-28.2-22.9-51.2-51.2-51.2zM256 224c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32z"></path></svg>;
const IconBars = () => <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"></path></svg>;
const IconSignOutAlt = () => <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436h-40c-6.6 0-12-5.4-12-12V88c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v336c0 6.6-5.4 12-12 12z"></path></svg>;

const Sidebar = ({ collapsed, setCollapsed, navItems}: SidebarProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [activePath, setActivePath] = useState('/');

    const handleMouseEnter = () => {
        if (collapsed) setIsHovered(true);
    };

    const handleMouseLeave = () => {
        if (collapsed) setIsHovered(false);
    };

    return (
        <div
            className={`sidebar ${collapsed && !isHovered ? 'collapsed' : 'expanded'}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="logo" onClick={() => setCollapsed(!collapsed)}>
                {(!collapsed || isHovered) ? <IconReact /> : <IconBars />}
                {(!collapsed || isHovered) && <span className="logo-text">Component</span>}
            </div>
            <nav className="nav-menu">
                {navItems.map((item: NavItem) => (
                    <a
                        key={item.path}
                        href={item.path}
                        onClick={(e) => { e.preventDefault(); setActivePath(item.path); }}
                        className={`nav-link ${activePath === item.path ? 'active' : ''}`}
                        title={collapsed && !isHovered ? item.label : ''}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        {(!collapsed || isHovered) && <span className="nav-text">{item.label}</span>}
                    </a>
                ))}
            </nav>
            <div className="sidebar-footer">
                <div>footer</div>
            </div>
        </div>
    );
};

export const UserProfileFooter = ({ collapsed, isHovered }: UserProfileFooterProps) => {
    const handleLogout = () => console.log("Logout clicked!");

    return (
        <>
             <div className="user-profile-section">
                <img
                    src="https://placehold.co/40x40/9929ea/white?text=U"
                    alt="User Avatar"
                    className="user-avatar"
                />
                {(!collapsed || isHovered) && (
                    <div className="user-details">
                        <span className="user-name">User Name</span>
                    </div>
                )}
            </div>
            <button
                onClick={handleLogout}
                className="nav-link logout-btn"
                title={collapsed && !isHovered ? 'Logout' : ''}
            >
                <span className="nav-icon"><IconSignOutAlt /></span>
                {(!collapsed || isHovered) && <span className="nav-text">Logout</span>}
            </button>
        </>
    );
};

export default Sidebar;