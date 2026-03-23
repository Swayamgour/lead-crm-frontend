import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
    Users,
    Database,
    PhoneCall,
    Activity,
    GitBranch,
    BarChart3,
    LayoutDashboard,
    UserCircle,
    Settings,
    LogOut,
    ChevronDown,
    ChevronRight,
    X,
    Menu,
    Bell,
    Mail,
    FileText,
    Target,
    Award,
    Home,
    TrendingUp,
    Clock,
    Calendar
} from "lucide-react";
import { sidebarSections } from "../../sidebarConfig";
// import { sidebarSections } from "../config/sidebarConfig"; // Import your config
import logo from '../assets/logo.png'

function NavSidebar({ sidebarOpen, setSidebarOpen, mobileMenuOpen, setMobileMenuOpen }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [expandedMenus, setExpandedMenus] = useState({});

    // Get user role from localStorage or context
    const userRole = localStorage.getItem('userRole') || 'admin'; // Replace with actual role from auth

    // Filter sections based on user role
    const filteredSections = sidebarSections.filter(section => {
        if (!section.role) return true;
        return section.role.includes(userRole);
    });

    const toggleSubMenu = (menuName) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    const closeMobileMenu = () => {
        if (window.innerWidth < 1024) {
            setMobileMenuOpen(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    // Check if a section is active
    const isSectionActive = (section) => {
        if (section.path) {
            return section.path.some(path => location.pathname === path);
        }
        return false;
    };

    // Check if any submenu item is active
    const isSubmenuActive = (section) => {
        if (section.submenu) {
            return section.submenu.some(sub =>
                sub.path && sub.path.some(path => location.pathname === path)
            );
        }
        return false;
    };

    return (
        <div className={`
            h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 
            text-white flex flex-col shadow-2xl transition-all duration-300
            ${sidebarOpen ? 'w-72' : 'w-20'}
        `}>
            {/* Logo Section */}
            <div className={`
                flex items-center justify-between p-5 border-b border-gray-700/50
                ${!sidebarOpen && 'justify-center'}
            `}>
                <div className="flex items-center gap-3">
                    {/* <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Target size={20} className="text-white" />
                    </div> */}
                    {sidebarOpen && (
                        <div className="flex justify-center">
                            <img src={logo} alt="Logo" width={120} />
                        </div>
                    )}
                </div>

                {sidebarOpen && (
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
                {/* Dashboard - Always visible */}


                {/* Dynamic Sections from Config */}
                {filteredSections.map((section) => {
                    const Icon = section.icon;
                    const isActive = isSectionActive(section);
                    const hasSubmenu = section.submenu && section.submenu.length > 0;
                    const isExpanded = expandedMenus[section.title] || isSubmenuActive(section);

                    if (hasSubmenu) {
                        return (
                            <div key={section.key || section.title}>
                                <button
                                    onClick={() => toggleSubMenu(section.title)}
                                    className={`
                                        w-full flex items-center px-3 py-2.5 rounded-xl
                                        transition-all duration-200 group
                                        ${sidebarOpen ? 'justify-between' : 'justify-center'}
                                        hover:bg-white/10
                                        ${isSubmenuActive(section) ? 'bg-white/5' : ''}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1 rounded-lg bg-gradient-to-r ${section.color} bg-opacity-20`}>
                                            <Icon size={18} className="text-white" />
                                        </div>
                                        {sidebarOpen && (
                                            <span className={`text-sm font-medium ${isSubmenuActive(section) ? 'text-white' : 'text-gray-300'} group-hover:text-white`}>
                                                {section.title}
                                            </span>
                                        )}
                                    </div>
                                    {sidebarOpen && (
                                        <ChevronDown
                                            size={16}
                                            className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                        />
                                    )}
                                </button>

                                {sidebarOpen && isExpanded && (
                                    <div className="ml-9 mt-1 space-y-1">
                                        {section.submenu.map((sub) => {
                                            const SubIcon = sub.icon;
                                            const isSubActive = sub.path && sub.path.some(path => location.pathname === path);
                                            return (
                                                <NavLink
                                                    key={sub.title}
                                                    to={sub.path?.[0] || '#'}
                                                    onClick={closeMobileMenu}
                                                    className={`
                                                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                                                        transition-all duration-200
                                                        ${isSubActive
                                                            ? 'bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-400'
                                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                        }
                                                    `}
                                                >
                                                    <SubIcon size={14} />
                                                    <span>{sub.title}</span>
                                                </NavLink>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={section.key || section.title}
                            to={section.path?.[0] || '#'}
                            onClick={closeMobileMenu}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-3 py-2.5 rounded-xl
                                transition-all duration-200 group
                                ${sidebarOpen ? 'justify-start' : 'justify-center'}
                                ${isActive
                                    ? `bg-gradient-to-r ${section.color} bg-opacity-20 text-white shadow-sm`
                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                                }
                            `}
                        >
                            <div className={`p-1 rounded-lg bg-gradient-to-r ${section.color} bg-opacity-20`}>
                                <Icon size={18} className={`transition-colors ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
                            </div>
                            {sidebarOpen && (
                                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                                    {section.title}
                                </span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-4 border-t border-gray-700/50 space-y-2">

                <button
                    onClick={handleLogout}
                    className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                        transition-all duration-200 group
                        ${sidebarOpen ? 'justify-start' : 'justify-center'}
                        hover:bg-red-500/20 text-red-400 hover:text-red-300
                    `}
                >
                    <LogOut size={20} />
                    {sidebarOpen && (
                        <span className="text-sm font-medium">Logout</span>
                    )}
                </button>

                {/* System Status */}

            </div>
        </div>
    );
}

export default NavSidebar;