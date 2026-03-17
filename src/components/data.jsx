import {
    Users,
    
    Activity,
    Database,
    PhoneCall,
    BarChart3
} from "lucide-react";



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

export const sidebarSections = [
    {
        title: "Sales Executives",
        icon: Users, // 👥 perfect
        key: "salesExecutives",
        color: "from-green-500 to-green-600",
        path: "/",
        role: ["admin"]
    },
    {
        title: "Lead Sources",
        icon: Database, // 📊 data / source feel
        key: "leadSources",
        color: "from-purple-500 to-purple-600",
        path: "/Leads",
        role: ["admin", "executive"]
    },
    {
        title: "Follow Up",
        icon: PhoneCall, // 📞 follow-up = call
        path: "/followUps",
        color: "from-yellow-500 to-yellow-600",
        role: ["admin", "executive"]
    },
    {
        title: "Lead Timeline",
        icon: Activity, // 📈 timeline activity
        path: "/LeadTimeline",
        color: "from-indigo-500 to-indigo-600",
        role: ["admin", "executive"]
    },
    {
        title: "Report",
        icon: BarChart3, // 📊 reports
        path: "/Report",
        color: "from-indigo-400 to-indigo-900",
        role: ["admin", "executive"]
    }
];