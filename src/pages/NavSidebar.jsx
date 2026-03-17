// Sidebar.jsx

import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    ChevronDown,
    ChevronRight,
    Bell,
    Menu,
    X,
    Users,
    Activity,
    Database,
    PhoneCall,
    BarChart3,
    LogOut  // Added LogOut icon
} from "lucide-react";
import { useGetProfileQuery } from "../redux/api";
import { sidebarSections } from "../components/data";

const NavSidebar = ({ sidebarOpen, setSidebarOpen }) => {

    const navigate = useNavigate();
    const location = useLocation();

    const { data } = useGetProfileQuery()

    const [expandedMenus, setExpandedMenus] = useState({
        leadSources: true,
        salesExecutives: false
    });

    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [hoveredItem, setHoveredItem] = useState(null);

    // Detect device type
    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);

            // Auto close sidebar on mobile
            if (width < 1024) {
                setSidebarOpen(false);
            }
        };

        checkDevice();
        window.addEventListener("resize", checkDevice);
        return () => window.removeEventListener("resize", checkDevice);
    }, [setSidebarOpen]);

    // Close sidebar on route change (mobile/tablet)
    useEffect(() => {
        if (isMobile || isTablet) {
            setSidebarOpen(false);
        }
    }, [location.pathname, isMobile, isTablet, setSidebarOpen]);

    const toggleMenu = (menu) => {
        setExpandedMenus((prev) => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    const isActiveRoute = (path) => {
        return location.pathname === path;
    };

    const isParentActive = (section) => {
        if (section.path && isActiveRoute(section.path)) return true;
        if (section.items) {
            return section.items.some(item => isActiveRoute(item.path));
        }
        return false;
    };

    // Logout handler
    const handleLogout = () => {
        // Clear any auth tokens/user data from storage
        localStorage.removeItem('token'); // or sessionStorage.removeItem('token')
        localStorage.removeItem('user'); // if you store user data

        // Clear any Redux persist data if you're using it
        // localStorage.removeItem('persist:root');

        // Redirect to login page
        navigate('/login');

        // Close sidebar on mobile/tablet
        if (isMobile || isTablet) {
            setSidebarOpen(false);
        }
    };

    const sidebarWidth = sidebarOpen
        ? (isMobile ? 'w-64' : isTablet ? 'w-56' : 'w-72')
        : (isMobile ? 'w-0' : 'lg:w-20');

    return (
        <>
            {/* Mobile/Tablet Overlay */}
            {(isMobile || isTablet) && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Toggle Button - Only visible on mobile/tablet when sidebar is closed */}
            {(isMobile || isTablet) && !sidebarOpen && (
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="fixed top-2 left-4 z-50 p-2.5 transition-colors"
                >
                    <Menu size={22} className="text-gray-700" />
                </button>
            )}

            {/* Sidebar */}
            <div
                className={`
                    fixed top-0 left-0 h-full bg-white z-50 shadow-xl
                    transition-all duration-300 ease-in-out
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    ${sidebarWidth}
                    overflow-y-auto overflow-x-hidden
                    scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
                    flex flex-col  /* Added flex column layout */
                `}
            >
                {/* Header with close button for mobile/tablet */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
                    <div className="flex h-14 items-center justify-between px-4 py-3">
                        {sidebarOpen && (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                    C
                                </div>
                                {!isMobile && !isTablet && (
                                    <span className="text-sm font-semibold text-gray-800">CRM</span>
                                )}
                            </div>
                        )}

                        {/* Close button for mobile/tablet */}
                        {(isMobile || isTablet) && sidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Navigation Area - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {/* User Profile - Only show when sidebar is open and not on very small mobile */}
                    {sidebarOpen && !isMobile && (
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                            <div className="flex items-center gap-2">
                                <div className="relative flex-shrink-0">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-base">
                                        {data?.name
                                            ?.split(" ")
                                            .map(word => word[0])
                                            .slice(0, 2)
                                            .join("")
                                            .toUpperCase()}
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-800 truncate">{data?.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{data?.role} · Online</p>
                                </div>
                                <button className="p-1.5 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0">
                                    <Bell size={16} className="text-gray-600" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className={`p-2 ${sidebarOpen ? 'px-2' : 'px-1'}`}>
                        {sidebarSections
                            ?.filter(section => section.role?.includes(data?.role))
                            ?.map((section, idx) => {
                                const hasItems = section.items && section.items.length > 0;
                                const isActive = isParentActive(section);
                                const isExpanded = expandedMenus[section.key];

                                return (
                                    <div
                                        key={section.key || idx}
                                        className="mb-1 relative group"
                                    >
                                        {/* Section Header */}
                                        <div
                                            onMouseEnter={() => setHoveredItem(section.key)}
                                            onMouseLeave={() => setHoveredItem(null)}
                                            className={`
                                            flex items-center rounded-lg transition-all duration-300 cursor-pointer
                                            ${sidebarOpen ? 'justify-between px-3' : 'justify-center px-2'}
                                            ${isActive
                                                    ? 'bg-gradient-to-r ' + section.color + ' text-white shadow-md'
                                                    : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                                                }
                                            ${hasItems ? 'py-1.5' : 'py-2'}
                                            relative overflow-hidden group
                                        `}
                                            onClick={() => {
                                                if (hasItems) {
                                                    toggleMenu(section.key);
                                                } else if (section.path) {
                                                    navigate(section.path);
                                                    if (isMobile || isTablet) setSidebarOpen(false);
                                                }
                                            }}
                                        >
                                            {/* Hover Gradient */}
                                            <div
                                                className={`absolute inset-0 bg-gradient-to-r ${section.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                                            />

                                            <div className={`flex items-center ${!sidebarOpen && 'justify-center w-full'}`}>
                                                <div
                                                    className={`
                                                    p-1.5 rounded-lg transition-all duration-300 flex-shrink-0
                                                    ${isActive ? 'bg-white/20' : ''}
                                                `}
                                                >
                                                    <section.icon
                                                        size={sidebarOpen ? 16 : 18}
                                                        className={`transition-all duration-300
                                                        ${isActive ? 'text-white' : 'text-gray-500'}
                                                    `}
                                                    />
                                                </div>

                                                {sidebarOpen && (
                                                    <span className="ml-2 text-xs font-medium flex-1 whitespace-nowrap">
                                                        {section.title}
                                                    </span>
                                                )}
                                            </div>

                                            {sidebarOpen && (
                                                <div className="flex items-center gap-1">
                                                    {section.badge && (
                                                        <span
                                                            className={`px-1.5 py-0.5 text-xs rounded-full
                                                            ${isActive
                                                                    ? 'bg-white/20 text-white'
                                                                    : 'bg-red-100 text-red-600'
                                                                }
                                                        `}
                                                        >
                                                            {section.badge}
                                                        </span>
                                                    )}

                                                    {hasItems && (
                                                        <div
                                                            className={`transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronDown size={14} />
                                                            ) : (
                                                                <ChevronRight size={14} />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Submenu */}
                                        {hasItems && sidebarOpen && isExpanded && (
                                            <div className="mt-1 ml-8 space-y-0.5 animate-slideDown">
                                                {section.items.map((item) => (
                                                    <NavLink
                                                        key={item.name}
                                                        to={item.path}
                                                        onClick={() => (isMobile || isTablet) && setSidebarOpen(false)}
                                                        className={({ isActive }) => `
                                                        flex items-center justify-between px-3 py-1.5 rounded-lg transition-all duration-200 text-xs
                                                        ${isActive
                                                                ? 'bg-blue-50 text-blue-600'
                                                                : item.danger
                                                                    ? 'text-red-600 hover:bg-red-50'
                                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                            }
                                                        group relative overflow-hidden
                                                    `}
                                                    >
                                                        <div className="flex items-center min-w-0">
                                                            <div
                                                                className={`
                                                                p-1 rounded-md mr-2 transition-all duration-200 flex-shrink-0
                                                                ${isActive ? 'bg-blue-100' : 'bg-gray-100 group-hover:scale-110'}
                                                            `}
                                                            >
                                                                <item.icon
                                                                    size={12}
                                                                    className={isActive ? 'text-blue-600' : 'text-gray-500'}
                                                                />
                                                            </div>
                                                            <span className="truncate">{item.name}</span>
                                                        </div>

                                                        {item.shortcut && !isMobile && (
                                                            <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                                                                {item.shortcut}
                                                            </span>
                                                        )}

                                                        {isActive && (
                                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-blue-600 rounded-r-full"></div>
                                                        )}
                                                    </NavLink>
                                                ))}
                                            </div>
                                        )}

                                        {/* Tooltip when collapsed - only on desktop */}
                                        {!sidebarOpen && !isMobile && !isTablet && section.title && (
                                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                                                {section.title}
                                                {section.badge && (
                                                    <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-xs">
                                                        {section.badge}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </nav>
                </div>

                {/* Logout Button - Fixed at bottom */}
                <div className="border-t border-gray-100 p-2 bg-white">
                    <button
                        onClick={handleLogout}
                        className={`
                            flex items-center rounded-lg transition-all duration-300 cursor-pointer w-full
                            ${sidebarOpen ? 'justify-between px-3' : 'justify-center px-2'}
                            hover:bg-red-50 text-gray-700 hover:text-red-600
                            py-2 relative overflow-hidden group
                        `}
                        onMouseEnter={() => setHoveredItem('logout')}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        {/* Hover Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

                        <div className={`flex items-center ${!sidebarOpen && 'justify-center w-full'}`}>
                            <div className="p-1.5 rounded-lg transition-all duration-300 flex-shrink-0 group-hover:scale-110">
                                <LogOut
                                    size={sidebarOpen ? 16 : 18}
                                    className="transition-all duration-300 group-hover:text-red-600 text-gray-500"
                                />
                            </div>

                            {sidebarOpen && (
                                <span className="ml-2 text-xs font-medium flex-1 whitespace-nowrap text-left">
                                    Logout
                                </span>
                            )}
                        </div>

                        {sidebarOpen && (
                            <div className="flex items-center gap-1">
                                {/* Optional: Add any badge or indicator here */}
                            </div>
                        )}
                    </button>

                    {/* Tooltip when collapsed - only on desktop */}
                    {!sidebarOpen && !isMobile && !isTablet && (
                        <div className="absolute left-full bottom-0 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                            Logout
                        </div>
                    )}
                </div>
            </div>

            {/* Animation */}
            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-6px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-slideDown {
                    animation: slideDown 0.2s ease-out forwards;
                }

                /* Custom scrollbar */
                .scrollbar-thin::-webkit-scrollbar {
                    width: 3px;
                }
                
                .scrollbar-thin::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                
                .scrollbar-thin::-webkit-scrollbar-thumb {
                    background: #cbd5e0;
                    border-radius: 3px;
                }
                
                .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                    background: #a0aec0;
                }
            `}</style>
        </>
    );
};

export default NavSidebar;