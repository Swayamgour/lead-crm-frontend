import React, { useState } from "react";
import {
    MessageCircle,
    Phone,
    FileText,
    User,
    Calendar,
    Clock,
    Filter,
    Search,
    Download,
    Upload,
    Plus,
    MoreVertical,
    Edit3,
    Trash2,
    Copy,
    Star,
    AlertCircle,
    CheckCircle,
    XCircle,
    Mail,
    Link,
    Paperclip,
    Image,
    Video,
    Headphones,
    Bell,
    Tag,
    Users,
    Settings,
    RefreshCw,
    Maximize2,
    Minimize2,
    ChevronDown,
    ChevronUp,
    Play,
    Pause,
    Archive,
    Share2,
    Printer,
    Bookmark,
    ThumbsUp,
    MessageSquare
} from "lucide-react";

const timeline = [
    {
        id: 1,
        type: "lead",
        title: "Lead Created",
        description: "Lead added manually by Rahul Sharma",
        date: "06 Mar 2026",
        time: "10:30 AM",
        user: "Rahul Sharma",
        avatar: "RS",
        color: "bg-blue-500",
        attachments: [],
        priority: "normal",
        status: "completed"
    },
    {
        id: 2,
        type: "call",
        title: "Call Done",
        description: "Customer interested in dining table. Requested for catalog.",
        date: "07 Mar 2026",
        time: "02:15 PM",
        user: "Priya Singh",
        avatar: "PS",
        color: "bg-green-500",
        duration: "12:30",
        attachments: [],
        priority: "high",
        status: "completed"
    },
    {
        id: 3,
        type: "whatsapp",
        title: "WhatsApp Message",
        description: "Product images shared - Dining Table Collection",
        date: "07 Mar 2026",
        time: "03:45 PM",
        user: "Priya Singh",
        avatar: "PS",
        color: "bg-green-500",
        attachments: [
            { type: "image", name: "dining-table-1.jpg", size: "2.3 MB" },
            { type: "image", name: "dining-table-2.jpg", size: "1.8 MB" }
        ],
        priority: "normal",
        status: "completed"
    },
    {
        id: 4,
        type: "note",
        title: "Quotation Sent",
        description: "Quotation sent on WhatsApp - Amount: ₹45,000",
        date: "08 Mar 2026",
        time: "11:20 AM",
        user: "Priya Singh",
        avatar: "PS",
        color: "bg-purple-500",
        attachments: [
            { type: "pdf", name: "quotation-2026-03-08.pdf", size: "450 KB" }
        ],
        priority: "high",
        status: "completed",
        value: "₹45,000"
    },
    {
        id: 5,
        type: "email",
        title: "Email Sent",
        description: "Follow-up email with product catalog",
        date: "09 Mar 2026",
        time: "09:45 AM",
        user: "Rahul Sharma",
        avatar: "RS",
        color: "bg-blue-500",
        attachments: [
            { type: "pdf", name: "catalog-2026.pdf", size: "5.2 MB" }
        ],
        priority: "medium",
        status: "pending"
    },
    {
        id: 6,
        type: "meeting",
        title: "Meeting Scheduled",
        description: "Virtual meeting to discuss final requirements",
        date: "10 Mar 2026",
        time: "03:00 PM",
        user: "Amit Verma",
        avatar: "AV",
        color: "bg-orange-500",
        duration: "45 min",
        link: "https://meet.google.com/abc-defg-hij",
        priority: "high",
        status: "upcoming"
    }
];

const typeIcons = {
    lead: { icon: User, bg: "bg-blue-100", color: "text-blue-600", label: "Lead" },
    call: { icon: Phone, bg: "bg-green-100", color: "text-green-600", label: "Call" },
    whatsapp: { icon: MessageCircle, bg: "bg-emerald-100", color: "text-emerald-600", label: "WhatsApp" },
    email: { icon: Mail, bg: "bg-purple-100", color: "text-purple-600", label: "Email" },
    note: { icon: FileText, bg: "bg-gray-100", color: "text-gray-600", label: "Note" },
    meeting: { icon: Users, bg: "bg-orange-100", color: "text-orange-600", label: "Meeting" },
    task: { icon: CheckCircle, bg: "bg-yellow-100", color: "text-yellow-600", label: "Task" },
    system: { icon: Settings, bg: "bg-indigo-100", color: "text-indigo-600", label: "System" }
};

const priorityColors = {
    high: { bg: "bg-red-100", text: "text-red-600", dot: "bg-red-500" },
    medium: { bg: "bg-yellow-100", text: "text-yellow-600", dot: "bg-yellow-500" },
    normal: { bg: "bg-blue-100", text: "text-blue-600", dot: "bg-blue-500" },
    low: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-500" }
};

const statusColors = {
    completed: { bg: "bg-green-100", text: "text-green-600", icon: CheckCircle },
    pending: { bg: "bg-yellow-100", text: "text-yellow-600", icon: AlertCircle },
    upcoming: { bg: "bg-blue-100", text: "text-blue-600", icon: Clock },
    cancelled: { bg: "bg-red-100", text: "text-red-600", icon: XCircle }
};

function LeadTimeline() {
    const [selectedItem, setSelectedItem] = useState(null);
    const [filterType, setFilterType] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedItems, setExpandedItems] = useState([]);
    const [viewMode, setViewMode] = useState("timeline"); // timeline or list
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [showFilters, setShowFilters] = useState(false);
    const [sortOrder, setSortOrder] = useState("desc"); // asc or desc

    const toggleExpand = (id) => {
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const getIcon = (type) => {
        const config = typeIcons[type] || typeIcons.lead;
        const IconComponent = config.icon;
        return <IconComponent size={18} className={config.color} />;
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const formatDate = (date, time) => {
        return `${date} at ${time}`;
    };

    const filteredTimeline = timeline
        .filter(item => {
            if (filterType !== "all" && item.type !== filterType) return false;
            
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return (
                    item.title.toLowerCase().includes(searchLower) ||
                    item.description.toLowerCase().includes(searchLower) ||
                    item.user.toLowerCase().includes(searchLower)
                );
            }
            
            return true;
        })
        .sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });

    const groupedByDate = filteredTimeline.reduce((acc, item) => {
        if (!acc[item.date]) {
            acc[item.date] = [];
        }
        acc[item.date].push(item);
        return acc;
    }, {});

    const stats = {
        total: timeline.length,
        calls: timeline.filter(i => i.type === "call").length,
        messages: timeline.filter(i => i.type === "whatsapp").length,
        emails: timeline.filter(i => i.type === "email").length,
        meetings: timeline.filter(i => i.type === "meeting").length
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <Clock className="text-blue-600" size={24} />
                            Interaction History
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Track all communications and activities
                        </p>
                    </div>

                   
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600">Total</p>
                        <p className="text-lg font-bold text-gray-800">{stats.total}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-600">Calls</p>
                        <p className="text-lg font-bold text-gray-800">{stats.calls}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3">
                        <p className="text-xs text-emerald-600">Messages</p>
                        <p className="text-lg font-bold text-gray-800">{stats.messages}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-xs text-purple-600">Emails</p>
                        <p className="text-lg font-bold text-gray-800">{stats.emails}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs text-orange-600">Meetings</p>
                        <p className="text-lg font-bold text-gray-800">{stats.meetings}</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mt-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search interactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Filter size={18} />
                            Filters
                            <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Type</label>
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="lead">Lead</option>
                                        <option value="call">Call</option>
                                        <option value="whatsapp">WhatsApp</option>
                                        <option value="email">Email</option>
                                        <option value="note">Note</option>
                                        <option value="meeting">Meeting</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Sort Order</label>
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="desc">Newest First</option>
                                        <option value="asc">Oldest First</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Date Range</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={dateRange.start}
                                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="date"
                                            value={dateRange.end}
                                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Timeline Content */}
            <div className="p-6 max-h-[600px] overflow-y-auto">
                {viewMode === "timeline" ? (
                    // Timeline View
                    <div className="relative">
                        {/* Vertical Line */}
                        {/* <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div> */}

                        {Object.entries(groupedByDate).map(([date, items]) => (
                            <div key={date} className="mb-6">
                                {/* Date Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                        {new Date(date).getDate()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">
                                            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </h3>
                                        <p className="text-xs text-gray-500">{items.length} activities</p>
                                    </div>
                                </div>

                                {/* Timeline Items */}
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="relative group">
                                            {/* Timeline Dot */}
                                            {/* <div className="absolute left-[21px] top-6 w-3 h-3 rounded-full bg-white border-2 border-blue-600 z-10"></div> */}

                                            <div >
                                                <div className={`
                                                    bg-white rounded-lg border border-gray-100 p-4 hover:shadow-md transition-all duration-300
                                                    ${expandedItems.includes(item.id) ? 'shadow-md' : ''}
                                                    ${selectedItem?.id === item.id ? 'ring-2 ring-blue-500' : ''}
                                                `}>
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between cursor-pointer"
                                                         onClick={() => toggleExpand(item.id)}>
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${typeIcons[item.type]?.bg || 'bg-gray-100'}`}>
                                                                {getIcon(item.type)}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h4 className="font-semibold text-gray-800">{item.title}</h4>
                                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[item.priority]?.bg || priorityColors.normal.bg}`}>
                                                                        {item.priority}
                                                                    </span>
                                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[item.status]?.bg || statusColors.completed.bg}`}>
                                                                        {item.status}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                                                
                                                                {/* Meta Info */}
                                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock size={12} />
                                                                        {item.time}
                                                                    </span>
                                                                    {item.duration && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Play size={12} />
                                                                            {item.duration}
                                                                        </span>
                                                                    )}
                                                                    <span className="flex items-center gap-1">
                                                                        <User size={12} />
                                                                        {item.user}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {item.value && (
                                                                <span className="text-sm font-semibold text-green-600">
                                                                    {item.value}
                                                                </span>
                                                            )}
                                                            {expandedItems.includes(item.id) ? 
                                                                <ChevronUp size={18} className="text-gray-400" /> : 
                                                                <ChevronDown size={18} className="text-gray-400" />
                                                            }
                                                        </div>
                                                    </div>

                                                    {/* Expanded Content */}
                                                    {expandedItems.includes(item.id) && (
                                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                                            {/* Attachments */}
                                                            {item.attachments && item.attachments.length > 0 && (
                                                                <div className="mb-4">
                                                                    <p className="text-sm font-medium text-gray-700 mb-2">Attachments</p>
                                                                    <div className="space-y-2">
                                                                        {item.attachments.map((att, idx) => (
                                                                            <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                                                <Paperclip size={14} className="text-gray-400" />
                                                                                <span className="text-sm flex-1">{att.name}</span>
                                                                                <span className="text-xs text-gray-500">{att.size}</span>
                                                                                <button className="p-1 hover:bg-gray-200 rounded">
                                                                                    <Download size={14} />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Meeting Link */}
                                                            {item.link && (
                                                                <div className="mb-4">
                                                                    <p className="text-sm font-medium text-gray-700 mb-2">Meeting Link</p>
                                                                    <a href={item.link} target="_blank" rel="noopener noreferrer" 
                                                                       className="text-sm text-blue-600 hover:underline flex items-center gap-2">
                                                                        <Link size={14} />
                                                                        {item.link}
                                                                    </a>
                                                                </div>
                                                            )}

                                                            {/* Quick Actions */}
                                                            <div className="flex gap-2">
                                                                <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 text-sm">
                                                                    <Edit3 size={14} />
                                                                    Edit
                                                                </button>
                                                                <button className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm">
                                                                    <Copy size={14} />
                                                                    Copy
                                                                </button>
                                                                <button className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm">
                                                                    <Trash2 size={14} />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // List View
                    <div className="space-y-3">
                        {filteredTimeline.map((item) => (
                            <div key={item.id} 
                                 className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                 onClick={() => setSelectedItem(item)}>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeIcons[item.type]?.bg || 'bg-gray-100'}`}>
                                    {getIcon(item.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-gray-800">{item.title}</h4>
                                        <span className={`w-2 h-2 rounded-full ${priorityColors[item.priority]?.dot}`}></span>
                                    </div>
                                    <p className="text-sm text-gray-600">{item.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-800">{item.date}</p>
                                    <p className="text-xs text-gray-500">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredTimeline.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">No interactions found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your filters or add a new interaction</p>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Add Interaction
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Showing {filteredTimeline.length} of {timeline.length} interactions</span>
                    <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Interaction Details</h3>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="p-1 hover:bg-gray-100 rounded-lg"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <pre className="bg-gray-50 p-4 rounded-lg text-sm">
                                {JSON.stringify(selectedItem, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LeadTimeline;