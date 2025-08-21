import LeftSidebar from "@/main-layout/LeftSideBar";
import TopBar from "@/main-layout/TopBar";
import RightSidebar from "@/main-layout/RightSideBar";
import QAs from "@/main-layout/QAs";
import Resources from "@/main-layout/Resources";
import InterviewPosts from "@/main-layout/InterviewPosts";
import Opportunities from "@/main-layout/Opportunities";
import Roadmap from "@/main-layout/Roadmap";
import Feed from "@/main-layout/Feed";
import "@/css/home.css";
import { IoHomeOutline } from 'react-icons/io5';
import { GrResources } from 'react-icons/gr';
import { CgProfile } from 'react-icons/cg';

// import { signOut } from '@/services/authService';
{/* <button onClick={signOut} className="bg-red-500 text-white px-4 py-2 rounded"></button> */}

import { useState , useEffect } from "react";

export default function Home() {
  	const [collapsed, setCollapsed] = useState(true);
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);


  	// Handle window resize for responsive design
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);


	const navItems = [
		{ label: 'Feed', path: '/', icon: <IoHomeOutline /> },
		{ label: 'Resources', path: '/resources', icon: <GrResources /> },
		{ label: 'Profile', path: '/profile', icon: <CgProfile /> },
	];


  return (
    <div className="home-container">
      <h2>Welcome</h2>
      <TopBar />
      {!isMobile && (
						<LeftSidebar
							collapsed={collapsed}
							setCollapsed={setCollapsed}
              navItems={navItems}
						/>
					)}
      <div className="main-content">
        <QAs />
        <Resources />
        <InterviewPosts />
        <Opportunities />
        <Roadmap />
        <Feed />
      </div>
      <RightSidebar />
    </div>
  );
}