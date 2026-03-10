import {
    Home,
    Users,

    UserPlus,

    GitBranch,

    Clock,


    Eye,
    ChevronDown,
    ChevronRight,
    Wifi,
    Activity,
    Bell,

    Plus,
    Layout,


} from "lucide-react";
import { Menu } from "lucide-react"; 2

export const sidebarSections = [
    // {
    //     title: "Dashboard",
    //     icon: Layout,
    //     path: "/Dashboard",
    //     badge: null,
    //     color: "from-blue-500 to-blue-600"
    // },

    {
        title: "Sales Executives",
        icon: Users,
        key: "salesExecutives",
        color: "from-green-500 to-green-600",
        badge: null,
        path: "/ViewExecutives",

        // items: [
        //     { name: "Add Executive", path: "/addExecutive", icon: UserPlus, shortcut: "⌘E" },
        //     { name: "View Executives", path: "/ViewExecutives", icon: Users, shortcut: "⌘S" },
        //     // { name: "Performance", path: "/executivePerformance", icon: TrendingUp }
        // ]
    },
    {
        title: "Lead Sources",
        icon: Wifi,
        key: "leadSources",
        color: "from-purple-500 to-purple-600",
        badge: 12,
        path: "/Leads",

        // items: [
        //     { name: "Add Manually", path: "/addLeads", icon: Plus, shortcut: "⌘N" },
        //     { name: "View Leads", path: "/Leads", icon: Eye, shortcut: "⌘V" },

        // ]
    },

    {
        title: "Lead Pipeline",
        icon: GitBranch,
        path: "/LeadPipeline",
        color: "from-orange-500 to-orange-600",
        badge: 5
    },
    {
        title: "Follow Up",
        icon: Clock,
        path: "/followUps",
        color: "from-yellow-500 to-yellow-600",
        badge: 3
    },
    {
        title: "Lead Timeline",
        icon: Activity,
        path: "/LeadTimeline",
        color: "from-indigo-500 to-indigo-600",
        badge: null
    },

];



export const leadStatus = [
    { value: "Incoming", icon: "📥", color: "bg-blue-100 text-blue-700" },
    { value: "Interested", icon: "⭐", color: "bg-green-100 text-green-700" },
    { value: "Ongoing", icon: "🔄", color: "bg-purple-100 text-purple-700" },
    { value: "Cold", icon: "❄️", color: "bg-gray-100 text-gray-700" },
    { value: "Won", icon: "🏆", color: "bg-emerald-100 text-emerald-700" },
    { value: "Lost", icon: "📉", color: "bg-red-100 text-red-700" },
    { value: "Next Follow Up", icon: "⏰", color: "bg-yellow-100 text-yellow-700" },
    { value: "No Response", icon: "🔇", color: "bg-gray-100 text-gray-700" }
];