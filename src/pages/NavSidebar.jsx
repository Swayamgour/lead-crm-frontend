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
import { useGetProfileQuery } from "../redux/api";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";

function NavSidebar({ sidebarOpen, setSidebarOpen, mobileMenuOpen, setMobileMenuOpen }) {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [expandedMenus, setExpandedMenus] = useState({});

    // Get user role from localStorage or context
    // Replace with actual role from auth

    const { data } = useGetProfileQuery()

    // console.log(data?.role)

    const userRole = data?.role === "executive" ? 'executive' : 'admin';

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

    // const handleLogout = () => {
    //     localStorage.removeItem('token');
    //     localStorage.removeItem('userRole');
    //     navigate('/login');
    // };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Check if a section is active
    const isSectionActive = (section) => {
        if (section.path) {
            return section.path.some(path => location.pathname === path);
        }
        return false;
    };


    const handelClickHome = () => {
        if (userRole === 'admin') {
            navigate('/ViewExecutives')
        } else {
            navigate('/Leads')
        }
    }

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
            h-full relative bg-gradient-to-b from-[var(--brand-navy-950)] via-[var(--brand-navy-900)] to-[var(--brand-navy-950)] 
            text-white flex flex-col transition-all duration-300 overflow-hidden
            ${sidebarOpen ? 'w-72' : 'w-20'}
        `}>
            {/* Decorative glow */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[var(--brand-blue-600)]/25 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 -left-16 w-56 h-56 rounded-full bg-[var(--brand-amber-500)]/10 blur-3xl" />

            {/* Logo Section */}
            <div className={`
                relative flex items-center justify-between p-5 border-b border-white/10
                ${!sidebarOpen && 'justify-center'}
            `}>
                <div className="flex items-center gap-3">
                    {sidebarOpen ? (
                        <div onClick={() => handelClickHome()} className="flex justify-center cursor-pointer">
                            <img src={logo} alt="Logo" width={120} className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]" />
                        </div>
                    ) : (
                        <div onClick={() => handelClickHome()} className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand-blue-500)] to-[var(--brand-blue-600)] flex items-center justify-center shadow-lg cursor-pointer">
                            <img src={logo} alt="Logo" width={22} className="object-contain" />
                        </div>
                    )}
                </div>

                {sidebarOpen && (
                    <button
                        onClick={() => { setMobileMenuOpen(false); setSidebarOpen(false) }}
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="relative flex-1 overflow-y-auto py-6 px-3 space-y-1.5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
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
                                        transition-all duration-200 group cursor-pointer
                                        ${sidebarOpen ? 'justify-between' : 'justify-center'}
                                        hover:bg-white/[0.08]
                                        ${isSubmenuActive(section) ? 'bg-white/[0.06] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]' : ''}
                                    `}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`shrink-0 p-1.5 rounded-lg bg-gradient-to-r ${section.color} bg-opacity-20 shadow-sm`}>
                                            <Icon size={17} className="text-white" />
                                        </div>
                                        {sidebarOpen && (
                                            <span className={`text-sm font-medium truncate ${isSubmenuActive(section) ? 'text-white' : 'text-gray-300'} group-hover:text-white`}>
                                                {section.title}
                                            </span>
                                        )}
                                    </div>
                                    {sidebarOpen && (
                                        <ChevronDown
                                            size={16}
                                            className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-gray-300' : ''}`}
                                        />
                                    )}
                                </button>

                                {sidebarOpen && (
                                    <div
                                        className="ml-[22px] pl-4 border-l border-white/10 mt-1 space-y-0.5 overflow-hidden transition-all duration-300"
                                        style={{ maxHeight: isExpanded ? section.submenu.length * 44 + 8 : 0, opacity: isExpanded ? 1 : 0 }}
                                    >
                                        {section.submenu.map((sub) => {
                                            const SubIcon = sub.icon;
                                            const isSubActive = sub.path && sub.path.some(path => location.pathname === path);
                                            return (
                                                <NavLink
                                                    key={sub.title}
                                                    to={sub.path?.[0] || '#'}
                                                    onClick={closeMobileMenu}
                                                    className={`
                                                        flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
                                                        transition-all duration-200
                                                        ${isSubActive
                                                            ? 'bg-[var(--brand-blue-600)]/20 text-[var(--brand-blue-400)] font-medium'
                                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                        }
                                                    `}
                                                >
                                                    <SubIcon size={14} />
                                                    <span className="truncate">{sub.title}</span>
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
                                relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                                transition-all duration-200 group
                                ${sidebarOpen ? 'justify-start' : 'justify-center'}
                                ${isActive
                                    ? `bg-gradient-to-r ${section.color} bg-opacity-20 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]`
                                    : 'text-gray-400 hover:text-white hover:bg-white/[0.08]'
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[var(--brand-amber-500)]" />
                                    )}
                                    <div className={`shrink-0 p-1.5 rounded-lg bg-gradient-to-r ${section.color} bg-opacity-20 shadow-sm`}>
                                        <Icon size={17} className={`transition-colors ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
                                    </div>
                                    {sidebarOpen && (
                                        <span className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                                            {section.title}
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="relative p-4 border-t border-white/10 space-y-2">
                <button
                    onClick={handleLogout}
                    className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                        transition-all duration-200 group cursor-pointer
                        ${sidebarOpen ? 'justify-start' : 'justify-center'}
                        hover:bg-red-500/15 text-red-400 hover:text-red-300
                    `}
                >
                    <LogOut size={19} />
                    {sidebarOpen && (
                        <span className="text-sm font-medium">Logout</span>
                    )}
                </button>
            </div>
        </div>
    );
}

export default NavSidebar;