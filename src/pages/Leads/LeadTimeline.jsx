import React, { useState } from "react";
import {
    Clock,
    Search,
    ChevronDown,
    ChevronUp,
    User,
    Phone,
    Mail,
    Calendar,
    Filter,
    RefreshCw,
    Download,
    MoreVertical,
    MessageCircle,
    PhoneCall,
    Mail as MailIcon,
    Calendar as CalendarIcon,
    FileText,
    Tag,
    Users,
    Activity,
    Edit3,
    Bell,
    Paperclip,
    X,
    Menu,
    Grid,
    List,
    Settings,
    TrendingUp,
    Award,
    Target,
    Eye,
    MessageSquare,
    Zap,
    Star
} from "lucide-react";

import { useGetTimelineGroupedQuery } from "../../redux/api";
import Loading from "../../components/Loading";

function LeadTimeline() {
    const { data, isLoading, refetch } = useGetTimelineGroupedQuery();
    const leadsTimeline = data || [];

    const [searchTerm, setSearchTerm] = useState("");
    const [expandedItems, setExpandedItems] = useState([]);
    const [filterType, setFilterType] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const [sortOrder, setSortOrder] = useState("desc");
    const [selectedDateRange, setSelectedDateRange] = useState("all");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [viewMode, setViewMode] = useState("timeline");

    const toggleExpand = (id) => {
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    /* -----------------------
       DATE FORMAT
    ----------------------- */
    const formatDateTime = (dateString) => {
        const d = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - d);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let relativeTime = "";
        if (diffDays === 0) {
            relativeTime = "Today";
        } else if (diffDays === 1) {
            relativeTime = "Yesterday";
        } else if (diffDays < 7) {
            relativeTime = `${diffDays}d ago`;
        } else {
            relativeTime = d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric"
            });
        }

        return {
            date: d.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
            }),
            time: d.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit"
            }),
            relative: relativeTime,
            full: d,
            day: d.toLocaleDateString("en-US", { weekday: 'short' }),
            month: d.toLocaleDateString("en-US", { month: 'short' }),
            dateNum: d.getDate()
        };
    };

    /* -----------------------
       GET ICON BY TYPE
    ----------------------- */
    const getIconByType = (type) => {
        switch (type) {
            case 'lead_created':
                return <Star className="text-blue-600" size={16} />;
            case 'lead_updated':
                return <Edit3 className="text-green-600" size={16} />;
            case 'followup_created':
                return <MessageCircle className="text-purple-600" size={16} />;
            case 'followup_updated':
                return <Bell className="text-orange-600" size={16} />;
            case 'call':
                return <PhoneCall className="text-indigo-600" size={16} />;
            case 'email':
                return <MailIcon className="text-yellow-600" size={16} />;
            case 'meeting':
                return <CalendarIcon className="text-red-600" size={16} />;
            case 'note':
                return <FileText className="text-gray-600" size={16} />;
            default:
                return <Activity className="text-gray-500" size={16} />;
        }
    };

    /* -----------------------
       GET COLOR BY TYPE
    ----------------------- */
    const getColorByType = (type) => {
        switch (type) {
            case 'lead_created':
                return 'bg-blue-500';
            case 'lead_updated':
                return 'bg-green-500';
            case 'followup_created':
                return 'bg-purple-500';
            case 'followup_updated':
                return 'bg-orange-500';
            case 'call':
                return 'bg-indigo-500';
            case 'email':
                return 'bg-yellow-500';
            case 'meeting':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getTypeGradient = (type) => {
        switch (type) {
            case 'lead_created':
                return 'from-blue-400 to-blue-400';
            case 'lead_updated':
                return 'from-green-400 to-green-400';
            case 'followup_created':
                return 'from-purple-400 to-purple-400';
            case 'followup_updated':
                return 'from-orange-400 to-orange-400';
            case 'call':
                return 'from-indigo-400 to-indigo-400';
            case 'email':
                return 'from-yellow-400 to-yellow-400';
            case 'meeting':
                return 'from-red-400 to-red-400';
            default:
                return 'from-gray-400 to-gray-400';
        }
    };

    /* -----------------------
       FILTER DATA
    ----------------------- */
    const filterByDateRange = (date) => {
        const now = new Date();
        const itemDate = new Date(date);

        switch (selectedDateRange) {
            case 'today':
                return itemDate.toDateString() === now.toDateString();
            case 'week':
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                return itemDate >= weekAgo;
            case 'month':
                const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
                return itemDate >= monthAgo;
            default:
                return true;
        }
    };

    const filteredLeads = leadsTimeline?.map((leadBlock) => {
        const filteredTimeline = leadBlock.timeline
            .filter(item => {
                if (filterType !== "all" && item.type !== filterType) return false;
                if (!filterByDateRange(item.createdAt)) return false;

                if (searchTerm) {
                    const text = searchTerm.toLowerCase();
                    return (
                        item.title?.toLowerCase().includes(text) ||
                        item.description?.toLowerCase().includes(text) ||
                        item.createdBy?.toLowerCase().includes(text) ||
                        leadBlock.lead.name?.toLowerCase().includes(text) ||
                        leadBlock.lead.phone?.includes(text)
                    );
                }
                return true;
            })
            .sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
            });

        return {
            ...leadBlock,
            timeline: filteredTimeline
        };
    }).filter(lead => lead.timeline.length > 0);

    /* -----------------------
       STATS
    ----------------------- */
    const stats = {
        total: leadsTimeline.reduce((acc, lead) => acc + lead.timeline.length, 0),
        leads: leadsTimeline.reduce(
            (acc, lead) => acc + lead.timeline.filter(i => i.type === "lead_created").length, 0
        ),
        updates: leadsTimeline.reduce(
            (acc, lead) => acc + lead.timeline.filter(i => i.type === "lead_updated").length, 0
        ),
        followups: leadsTimeline.reduce(
            (acc, lead) => acc + lead.timeline.filter(i => i.type.includes("followup")).length, 0
        )
    };

    /* -----------------------
       LOADING
    ----------------------- */
    if (isLoading) {
        return <Loading data={'Lead Timeline'} />;
    }

    /* -----------------------
       UI
    ----------------------- */
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Clock size={20} className="text-white" />
                                </div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Activity Timeline
                                </h1>
                            </div>
                            <p className="text-gray-500 mt-1 text-sm">
                                Track every interaction and activity with your leads
                            </p>
                        </div>



                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                        <StatCard
                            title="Total Activities"
                            value={stats.total}
                            icon={<Activity size={20} />}
                            bgColor="bg-blue-50"
                            textColor="text-blue-600"
                            gradient="from-blue-500 to-blue-600"
                        />
                        <StatCard
                            title="Leads Created"
                            value={stats.leads}
                            icon={<Star size={20} />}
                            bgColor="bg-green-50"
                            textColor="text-green-600"
                            gradient="from-green-500 to-green-600"
                        />
                        <StatCard
                            title="Updates"
                            value={stats.updates}
                            icon={<Edit3 size={20} />}
                            bgColor="bg-orange-50"
                            textColor="text-orange-600"
                            gradient="from-orange-500 to-orange-600"
                        />
                        <StatCard
                            title="Follow-ups"
                            value={stats.followups}
                            icon={<MessageCircle size={20} />}
                            bgColor="bg-purple-50"
                            textColor="text-purple-600"
                            gradient="from-purple-500 to-purple-600"
                        />
                    </div>

                    {/* Filters Section */}
                    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 backdrop-blur-sm">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search leads or activities..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="relative min-w-[160px]">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 appearance-none bg-gray-50 hover:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                                >
                                    <option value="all">All Activities</option>
                                    <option value="lead_created">✨ Lead Created</option>
                                    <option value="lead_updated">📝 Lead Updated</option>
                                    <option value="followup_created">🔔 Follow-up Created</option>
                                    <option value="followup_updated">🔄 Follow-up Updated</option>
                                    <option value="call">📞 Calls</option>
                                    <option value="email">✉️ Emails</option>
                                    <option value="meeting">📅 Meetings</option>
                                </select>
                            </div>
                            <div className="relative min-w-[160px]">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <select
                                    value={selectedDateRange}
                                    onChange={(e) => setSelectedDateRange(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 appearance-none bg-gray-50 hover:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                </select>
                            </div>
                            <button
                                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all text-gray-700 flex items-center gap-2 group"
                            >
                                <Clock size={16} className="group-hover:rotate-180 transition-transform duration-300" />
                                <span className="text-sm font-medium">{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
                            </button>

                        </div>
                    </div>
                </div>

                {/* Timeline Content */}
                {filteredLeads.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-6">
                        {filteredLeads.map((leadBlock) => (
                            <LeadTimelineCard
                                key={leadBlock._id}
                                leadBlock={leadBlock}
                                expandedItems={expandedItems}
                                toggleExpand={toggleExpand}
                                formatDateTime={formatDateTime}
                                getIconByType={getIconByType}
                                getColorByType={getColorByType}
                                getTypeGradient={getTypeGradient}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ======================
   STAT CARD COMPONENT
====================== */
const StatCard = ({ title, value, icon, bgColor, textColor, gradient }) => (
    <div className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-lg transition-all duration-300 border border-gray-100 group">
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <div className={textColor}>{icon}</div>
            </div>
        </div>
    </div>
);

/* ======================
   LEAD TIMELINE CARD COMPONENT
====================== */
const LeadTimelineCard = ({
    leadBlock,
    expandedItems,
    toggleExpand,
    formatDateTime,
    getIconByType,
    getColorByType,
    getTypeGradient,
    viewMode
}) => {
    // Group activities by date for better organization
    const groupedByDate = leadBlock.timeline.reduce((acc, item) => {
        const dateKey = new Date(item.createdAt).toDateString();
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(item);
        return acc;
    }, {});

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
            {/* Lead Header - Modern with Gradient */}
            <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                    }}></div>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-lg ring-2 ring-white/30">
                            <span className="text-white font-bold text-xl">
                                {leadBlock.lead.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-xl mb-1">{leadBlock.lead.name}</h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
                                <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                    <Phone size={14} className="text-white" />
                                    {leadBlock.lead.phone}
                                </span>
                                {leadBlock.lead.email && (
                                    <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                        <Mail size={14} className="text-white" />
                                        <span className="truncate max-w-[200px]">{leadBlock.lead.email}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-white/20 backdrop-blur-lg rounded-xl">
                            <span className="text-sm font-bold text-white">
                                {leadBlock.timeline.length} Activities
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline Grid Layout */}
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
                {Object.entries(groupedByDate).map(([dateKey, items]) => {
                    const date = new Date(dateKey);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isYesterday = new Date(date.setDate(date.getDate() + 1)).toDateString() === new Date().toDateString();

                    let dateLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                    if (isToday) dateLabel = 'Today';
                    if (isYesterday) dateLabel = 'Yesterday';

                    return (
                        <div key={dateKey} className="mb-8 last:mb-0">
                            {/* Date Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                                    <Calendar size={20} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">{dateLabel}</h4>
                                    <p className="text-xs text-gray-500">{items.length} activities</p>
                                </div>
                                <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                            </div>

                            {/* Activities Grid - 2 columns on desktop, 1 on mobile */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {items.map((item, index) => {
                                    const { time, relative } = formatDateTime(item.createdAt);
                                    const uniqueId = `${leadBlock._id}-${dateKey}-${index}`;
                                    const isExpanded = expandedItems.includes(uniqueId);
                                    const gradientClass = getTypeGradient(item.type);

                                    return (
                                        <div
                                            key={uniqueId}
                                            className={`group relative bg-white rounded-xl border transition-all duration-300 overflow-hidden
                                                ${isExpanded ? 'border-indigo-300 shadow-xl scale-[1.02]' : 'border-gray-200 shadow-sm hover:shadow-lg hover:scale-[1.01]'}`}
                                        >
                                            {/* Colorful Top Bar */}
                                            <div className={`h-1.5 bg-gradient-to-r ${gradientClass}`}></div>

                                            <div className="p-5">
                                                {/* Header with Icon and Status */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${gradientClass} flex items-center justify-center shadow-md`}>
                                                            {getIconByType(item.type)}
                                                        </div>
                                                        <div>
                                                            <h5 className="font-semibold text-gray-800 text-sm">
                                                                {item.title}
                                                            </h5>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <Clock size={10} />
                                                                    {time}
                                                                </span>
                                                                <span className="text-xs text-gray-400">•</span>
                                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <User size={10} />
                                                                    {item.createdBy?.split(' ')[0] || "System"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">
                                                            {relative}
                                                        </span>
                                                        {/* <button
                                                            onClick={() => toggleExpand(uniqueId)}
                                                            className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                                                        >
                                                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                        </button> */}
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                                                    {item.description}
                                                </p>

                                                {/* Activity Type Badge */}
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                                                        <Tag size={10} />
                                                        <span className="capitalize">{item.type.replace(/_/g, ' ')}</span>
                                                    </span>
                                                </div>

                                               
                                            </div>

                                            {/* Hover Effect Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"></div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ======================
   EMPTY STATE COMPONENT
====================== */
const EmptyState = () => (
    <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-gray-100">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={40} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No activities found</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
            No activities match your current filters. Try adjusting your search or filters to see more results.
        </p>
        <button
            onClick={() => {
                // Reset filters logic
            }}
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
        >
            <RefreshCw size={16} className="mr-2" />
            Reset Filters
        </button>
    </div>
);

export default LeadTimeline;