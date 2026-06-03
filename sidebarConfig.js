import {
    Users,
    Database,
    PhoneCall,
    Activity,
    GitBranch,
    BarChart3,
    UserCircle,
    Settings,
    LayoutDashboard,
    TrendingUp,
    Clock,
    Calendar,
    FileText,
    Mail,
    MessageCircle,
    UserPlus,
    Eye,
    Edit,
    Trash2,
    Download,
    Upload,
    Shield,
    Bell,
    HelpCircle
} from "lucide-react";

export const sidebarSections = [
    {
        title: "Sales Executives",
        icon: Users,
        key: "salesExecutives",
        color: "from-green-500 to-emerald-600",
        path: ["/executives", "/addExecutive", "/editExecutive"],
        role: ["admin"],
        submenu: [
            {
                title: "All Executives",
                icon: Users,
                path: ["/ViewExecutives"]
            },
            {
                title: "Add Executive",
                icon: UserPlus,
                path: ["/addExecutive"]
            }
        ]
    },
    {
        title: "Lead",
        icon: Database,
        key: "leadSources",
        color: "from-purple-500 to-purple-600",
        path: ["/leads", "/addLeads", "/editLead"],
        role: ["admin", "executive"],
        submenu: [
            {
                title: "All Leads",
                icon: Database,
                path: ["/leads"]
            },
            {
                title: "Add Lead",
                icon: UserPlus,
                path: ["/addLeads"]
            }
        ]
    },
    {
        title: "Follow Up",
        icon: PhoneCall,
        key: "followUps",
        path: ["/followUps"],
        color: "from-yellow-500 to-amber-600",
        role: ["admin", "executive"]
    },
    {
        title: "Lead Timeline",
        icon: Activity,
        key: "leadTimeline",
        path: ["/LeadTimeline"],
        color: "from-indigo-500 to-indigo-600",
        role: ["admin", "executive"]
    },
    {
        title: "Lead Pipeline",
        icon: GitBranch,
        key: "leadPipeline",
        path: ["/LeadPipeline"],
        color: "from-pink-500 to-rose-600",
        role: ["admin", "executive"]
    },
    {
        title: "Report",
        icon: BarChart3,
        key: "reports",
        path: ["/Report"],
        color: "from-indigo-400 to-indigo-900",
        role: ["admin", "executive"],
        submenu: [
           
        ]
    }
];

// Optional: Additional configuration for user roles
export const userRoles = {
    admin: {
        name: "Administrator",
        permissions: ["all"],
        color: "from-red-500 to-pink-600"
    },
    executive: {
        name: "Sales Executive",
        permissions: ["view", "edit", "create"],
        color: "from-blue-500 to-indigo-600"
    }
};

// Optional: Navigation helper functions
export const getSectionByPath = (path) => {
    for (const section of sidebarSections) {
        if (section.path?.includes(path)) return section;
        if (section.submenu) {
            const found = section.submenu.find(sub => sub.path?.includes(path));
            if (found) return section;
        }
    }
    return null;
};

export const getBreadcrumbs = (path) => {
    const breadcrumbs = [];
    const section = getSectionByPath(path);

    if (section) {
        breadcrumbs.push({ title: section.title, path: section.path?.[0] });

        if (section.submenu) {
            const subItem = section.submenu.find(sub => sub.path?.includes(path));
            if (subItem) {
                breadcrumbs.push({ title: subItem.title, path: subItem.path?.[0] });
            }
        }
    }

    return breadcrumbs;
};