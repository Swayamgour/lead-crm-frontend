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
        title: "Banner",
        icon: BarChart3,
        key: "leadPipeline",
        path: ["/"],
        color: "from-pink-500 to-rose-600",
        role: ["admin", "executive"]
    },
    {
        title: "Category",
        icon: GitBranch,
        key: "leadPipeline",
        path: ["/Category"],
        color: "from-pink-500 to-rose-600",
        role: ["admin", "executive"]
    },
   
    {
        title: "Products",
        icon: Activity,
        key: "leadTimeline",
        path: ["/Products"],
        color: "from-indigo-500 to-indigo-600",
        role: ["admin", "executive"]
    },
    
   
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