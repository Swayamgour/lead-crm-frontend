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
    CheckCircle,
    XCircle,
    AlertCircle,
    MessageCircle,
    PhoneCall,
    Mail as MailIcon,
    Calendar as CalendarIcon,
    FileText,
    Tag,
    Users,
    TrendingUp,
    Activity,
    Eye,
    Edit3,
    Star,
    Zap,
    Loader,
    Bell,
    Paperclip,
    Camera,
    Video,
    Link
} from "lucide-react";

import { useGetTimelineGroupedQuery } from "../../redux/api";

function LeadTimeline() {
    const { data, isLoading, refetch } = useGetTimelineGroupedQuery();
    const leadsTimeline = data || [];

    const [searchTerm, setSearchTerm] = useState("");
    const [expandedItems, setExpandedItems] = useState([]);
    const [filterType, setFilterType] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const [sortOrder, setSortOrder] = useState("desc");

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
            relativeTime = `${diffDays} days ago`;
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
            full: d
        };
    };

    /* -----------------------
       GET ICON BY TYPE
    ----------------------- */
    const getIconByType = (type) => {
        switch (type) {
            case 'lead_created':
                return <User className="text-blue-600" size={16} />;
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
                return 'bg-blue-100 border-blue-200';
            case 'lead_updated':
                return 'bg-green-100 border-green-200';
            case 'followup_created':
                return 'bg-purple-100 border-purple-200';
            case 'followup_updated':
                return 'bg-orange-100 border-orange-200';
            default:
                return 'bg-gray-100 border-gray-200';
        }
    };

    /* -----------------------
       FILTER DATA
    ----------------------- */
    const filteredLeads = leadsTimeline?.map((leadBlock) => {
        const filteredTimeline = leadBlock.timeline
            .filter(item => {
                if (filterType !== "all" && item.type !== filterType) return false;

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
        return (
            <div className="min-h-[400px] flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-600 animate-pulse" />
                    </div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Loading timeline...</p>
                <p className="text-sm text-gray-400 mt-1">Please wait while we fetch the data</p>
            </div>
        );
    }

    /* -----------------------
       UI
    ----------------------- */
    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* HEADER with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Clock className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Lead Timeline</h2>
                            <p className="text-blue-100 text-sm">Track all lead activities and updates</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => refetch()}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white"
                            title="Refresh"
                        >
                            <RefreshCw size={16} />
                        </button>
                        <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-white">
                            <Download size={16} />
                        </button>
                    </div>
                </div>

                {/* STATS Cards */}
                <div className="grid grid-cols-4 gap-3 mt-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-blue-100 text-xs">Total Activities</p>
                        <p className="text-white text-xl font-bold">{stats.total}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-blue-100 text-xs">New Leads</p>
                        <p className="text-white text-xl font-bold">{stats.leads}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-blue-100 text-xs">Updates</p>
                        <p className="text-white text-xl font-bold">{stats.updates}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-blue-100 text-xs">Follow-ups</p>
                        <p className="text-white text-xl font-bold">{stats.followups}</p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by lead name, phone, or activity..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="all">All Activities</option>
                            <option value="lead_created">Lead Created</option>
                            <option value="lead_updated">Lead Updated</option>
                            <option value="followup_created">Follow-up Created</option>
                            <option value="followup_updated">Follow-up Updated</option>
                            <option value="call">Calls</option>
                            <option value="email">Emails</option>
                            <option value="meeting">Meetings</option>
                            <option value="note">Notes</option>
                        </select>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-2.5 border rounded-xl transition-colors flex items-center gap-2 ${showFilters
                                    ? 'bg-blue-50 border-blue-300 text-blue-600'
                                    : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                                }`}
                        >
                            <Filter size={18} />
                            <span className="hidden sm:inline">Filters</span>
                        </button>

                        <button
                            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
                            title={sortOrder === "desc" ? "Newest first" : "Oldest first"}
                        >
                            <Clock size={18} className="text-gray-600" />
                            <span className="hidden sm:inline">{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
                        </button>
                    </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Date: All Time</option>
                                <option>Today</option>
                                <option>This Week</option>
                                <option>This Month</option>
                                <option>Last Month</option>
                            </select>
                            <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Created By: Anyone</option>
                                <option>Me</option>
                                <option>Team</option>
                                <option>System</option>
                            </select>
                            <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option>Priority: All</option>
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* TIMELINE */}
            <div className="p-6 max-h-[600px] overflow-y-auto bg-gradient-to-b from-white to-gray-50">
                {filteredLeads.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock size={32} className="text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No timeline data found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setFilterType("all");
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredLeads.map((leadBlock) => (
                            <div key={leadBlock._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                {/* LEAD HEADER */}
                                <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                                                {leadBlock.lead.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{leadBlock.lead.name}</h3>
                                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Phone size={12} />
                                                        {leadBlock.lead.phone}
                                                    </span>
                                                    {leadBlock.lead.email && (
                                                        <span className="flex items-center gap-1">
                                                            <Mail size={12} />
                                                            {leadBlock.lead.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                {leadBlock.timeline.length} activities
                                            </span>
                                            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                                                <MoreVertical size={16} className="text-gray-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* TIMELINE ITEMS */}
                                <div className="p-4 space-y-3">
                                    {leadBlock.timeline.map((item, index) => {
                                        const { time, relative } = formatDateTime(item.createdAt);
                                        const uniqueId = leadBlock._id + index;
                                        const isExpanded = expandedItems.includes(uniqueId);
                                        const colorClass = getColorByType(item.type);

                                        return (
                                            <div
                                                key={uniqueId}
                                                className={`border rounded-xl transition-all duration-200 ${isExpanded ? 'shadow-md' : 'hover:shadow-sm'
                                                    }`}
                                            >
                                                <div
                                                    className={`p-4 cursor-pointer ${isExpanded ? 'border-b border-gray-100' : ''}`}
                                                    onClick={() => toggleExpand(uniqueId)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
                                                            {getIconByType(item.type)}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <h4 className="font-medium text-gray-800 truncate">
                                                                    {item.title}
                                                                </h4>
                                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                                        {relative}
                                                                    </span>
                                                                    {isExpanded ? (
                                                                        <ChevronUp size={18} className="text-gray-400" />
                                                                    ) : (
                                                                        <ChevronDown size={18} className="text-gray-400" />
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                                {item.description}
                                                            </p>

                                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock size={12} />
                                                                    {time}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <User size={12} />
                                                                    {item.createdBy || "System"}
                                                                </span>
                                                                {item.type && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Tag size={12} />
                                                                        {item.type.replace(/_/g, ' ')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expanded Content */}
                                                {isExpanded && (
                                                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            {item.details && Object.entries(item.details).map(([key, value]) => (
                                                                <div key={key} className="col-span-2 sm:col-span-1">
                                                                    <span className="text-xs text-gray-500 block capitalize">{key}</span>
                                                                    <span className="text-gray-700">{value || 'N/A'}</span>
                                                                </div>
                                                            ))}

                                                            {item.attachments && item.attachments.length > 0 && (
                                                                <div className="col-span-2 mt-2">
                                                                    <span className="text-xs text-gray-500 block mb-2">Attachments</span>
                                                                    <div className="flex gap-2">
                                                                        {item.attachments.map((att, idx) => (
                                                                            <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-white rounded border">
                                                                                <Paperclip size={12} />
                                                                                <span className="text-xs">{att.name}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* FOOTER */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                        {filteredLeads.reduce((acc, lead) => acc + lead.timeline.length, 0)} activities displayed
                    </span>
                </div>

                {searchTerm && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            Filtered: {filteredLeads.reduce((acc, lead) => acc + lead.timeline.length, 0)} results
                        </span>
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setFilterType("all");
                            }}
                            className="text-xs text-red-600 hover:text-red-700"
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .timeline-item {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}

export default LeadTimeline;