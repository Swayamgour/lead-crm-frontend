import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import NavSidebar from "../pages/NavSidebar.jsx";

function MainLayout() {

    const [sidebarOpen, setSidebarOpen] = useState(true);

    // detect screen size
    useEffect(() => {

        const handleResize = () => {

            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }

        };

        handleResize(); // run once

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);

    }, []);

    return (
        <div className="flex h-screen bg-gray-50">

            {/* Sidebar */}
            <NavSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Right Side */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 w-full
                 ${sidebarOpen ? "lg:ml-72" : "lg:ml-20"}
                `}
            >

                {/* Topbar */}
                <header className="h-14 bg-white shadow flex items-center justify-end px-6 z-30">



                    <div className="flex items-center gap-4">
                        <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
                    </div>

                </header>

                {/* Page Content */}
                {/* <main className="flex-1 overflow-y-auto sm:p-0 p-6 "> */}
                    <main className="flex-1 overflow-y-auto p-0 sm:p-6">

                    {/* </main> */}
 
                    <Outlet />

                </main>

            </div>

        </div>
    );
}

export default MainLayout;