import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import NavSidebar from "../pages/NavSidebar.jsx";
import { useGetProfileQuery } from "../redux/api.jsx";
import { Menu, X, ChevronRight, Bell, User, LogOut, Settings, ChevronDown } from "lucide-react";

function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { data: profile } = useGetProfileQuery();

    // Detect screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setSidebarOpen(false);
                setMobileMenuOpen(false);
            } else {
                setSidebarOpen(true);
                setMobileMenuOpen(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    const toggleSidebar = () => {
        if (window.innerWidth < 1024) {
            setMobileMenuOpen(!mobileMenuOpen);
        } else {
            setSidebarOpen(!sidebarOpen);
        }
    };

    const handleLogout = () => {
        // Add your logout logic here
        localStorage.removeItem('token');
        navigate('/login');
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('dashboard')) return 'Dashboard';
        if (path.includes('leads')) return 'Lead Management';
        if (path.includes('follow-ups')) return 'Follow-ups';
        if (path.includes('pipeline')) return 'Lead Pipeline';
        if (path.includes('timeline')) return 'Activity Timeline';
        if (path.includes('reports')) return 'Reports & Analytics';
        if (path.includes('addLeads')) return 'Add New Lead';
        if (path.includes('editLead')) return 'Edit Lead';
        if (path.includes('profile')) return 'My Profile';
        return 'Dashboard';
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
    fixed lg:sticky top-0 left-0 h-screen z-50
    transition-all duration-300 ease-in-out
    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    w-64 lg:${sidebarOpen ? 'w-72' : 'w-20'}
  `}
            >
                <NavSidebar
                    sidebarOpen={mobileMenuOpen ? true : sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    mobileMenuOpen={mobileMenuOpen}
                    setMobileMenuOpen={setMobileMenuOpen}
                />
            </div>

            {/* Right Side Content */}
            <div
                className={`
                    flex-1 flex flex-col transition-all duration-300 w-full overflow-hidden
                    ${sidebarOpen ? '' : ''}
                `}
            >
                {/* Topbar */}
                <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3">
                        {/* Left Section - Menu Button & Page Title */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 lg:hidden"
                                aria-label="Toggle Menu"
                            >
                                {mobileMenuOpen ? (
                                    <X size={20} className="text-gray-600" />
                                ) : (
                                    <Menu size={20} className="text-gray-600" />
                                )}
                            </button>

                            <button
                                onClick={toggleSidebar}
                                className="hidden lg:block p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                                aria-label="Toggle Sidebar"
                            >
                                {sidebarOpen ? (
                                    <ChevronRight size={20} className="text-gray-600" />
                                ) : (
                                    <Menu size={20} className="text-gray-600" />
                                )}
                            </button>

                            {/* Page Title */}
                            <div className="hidden sm:block">
                                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                    {getPageTitle()}
                                </h1>
                                <p className="text-xs text-gray-500 hidden md:block">
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Right Section - User Menu & Notifications */}
                        <div className="flex items-center gap-2 sm:gap-4">
                            {/* Notification Button */}

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 sm:gap-3 p-1.5 rounded-xl hover:bg-gray-100 transition-all duration-200"
                                >
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                                        <span className="text-white font-semibold text-sm">
                                            {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div className="hidden md:flex flex-col items-start">
                                        <span className="text-sm font-semibold text-gray-700">
                                            {profile?.name || 'User'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {profile?.role || 'Employee'}
                                        </span>
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={`hidden md:block text-gray-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                {showUserMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowUserMenu(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-slideDown">
                                            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                                                        <span className="text-white font-bold">
                                                            {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{profile?.name || 'User'}</p>
                                                        <p className="text-xs text-gray-500">{profile?.email || 'user@example.com'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* <div className="p-2">
                                                <button
                                                    onClick={() => {
                                                        navigate('/profile');
                                                        setShowUserMenu(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                                                >
                                                    <User size={18} className="text-gray-500" />
                                                    <span className="text-sm text-gray-700">My Profile</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigate('/settings');
                                                        setShowUserMenu(false);
                                                    }}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                                                >
                                                    <Settings size={18} className="text-gray-500" />
                                                    <span className="text-sm text-gray-700">Settings</span>
                                                </button>
                                            </div> */}

                                            <div className="border-t border-gray-100 p-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-red-600"
                                                >
                                                    <LogOut size={18} />
                                                    <span className="text-sm font-medium">Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Page Title */}
                    <div className="sm:hidden px-4 pb-3">
                        <h1 className="text-lg font-bold text-gray-800">{getPageTitle()}</h1>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Add animations */}
            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-slideDown {
                    animation: slideDown 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

export default MainLayout;