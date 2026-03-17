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
    Settings
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
    const [viewMode, setViewMode] = useState("timeline"); // timeline or compact

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
        return (
            <Loading data={'Lead timeLine'} />
        );
    }

    /* -----------------------
       UI
    ----------------------- */
    return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-200 overflow-hidden">
            {/* Responsive Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 sm:px-6 py-4 sm:py-5 relative overflow-hidden">
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="absolute top-4 right-4 sm:hidden text-white/80 hover:text-white"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 sm:gap-4 pr-12 sm:pr-0">
                        <div className="bg-white/20 p-2 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-sm">
                            <Clock className="text-white" size={20} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Activity Timeline</h2>
                            <p className="text-blue-100 text-xs sm:text-sm mt-0.5 sm:mt-1 hidden xs:block">Track every interaction with your leads</p>
                        </div>
                    </div>

                    {/* Mobile Menu Dropdown */}
                    {isMobileMenuOpen && (
                        <div className="mt-4 sm:hidden bg-white/10 backdrop-blur-md rounded-xl p-3 space-y-2">
                            <button
                                onClick={() => refetch()}
                                className="w-full flex items-center gap-2 px-3 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <RefreshCw size={16} />
                                <span>Refresh</span>
                            </button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-white hover:bg-white/20 rounded-lg transition-colors">
                                <Download size={16} />
                                <span>Download</span>
                            </button>
                            <button
                                onClick={() => setViewMode(viewMode === 'timeline' ? 'compact' : 'timeline')}
                                className="w-full flex items-center gap-2 px-3 py-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                            >
                                {viewMode === 'timeline' ? <List size={16} /> : <Grid size={16} />}
                                <span>{viewMode === 'timeline' ? 'Compact View' : 'Timeline View'}</span>
                            </button>
                        </div>
                    )}

                    {/* Desktop Action Buttons */}
                    <div className="hidden sm:flex items-center gap-2 absolute top-4 right-4">
                        <button
                            onClick={() => refetch()}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-white backdrop-blur-sm"
                            title="Refresh"
                        >
                            <RefreshCw size={18} />
                        </button>
                        <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-white backdrop-blur-sm">
                            <Download size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode(viewMode === 'timeline' ? 'compact' : 'timeline')}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-white backdrop-blur-sm"
                            title={viewMode === 'timeline' ? 'Switch to Compact View' : 'Switch to Timeline View'}
                        >
                            {viewMode === 'timeline' ? <List size={18} /> : <Grid size={18} />}
                        </button>
                    </div>

                    {/* Responsive Stats Grid */}
                    <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 sm:gap-3 mt-4 sm:mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3">
                            <p className="text-blue-100 text-[10px] sm:text-xs">Total</p>
                            <p className="text-white text-sm sm:text-base md:text-xl font-bold">{stats.total}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3">
                            <p className="text-blue-100 text-[10px] sm:text-xs">Leads</p>
                            <p className="text-white text-sm sm:text-base md:text-xl font-bold">{stats.leads}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3">
                            <p className="text-blue-100 text-[10px] sm:text-xs">Updates</p>
                            <p className="text-white text-sm sm:text-base md:text-xl font-bold">{stats.updates}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-3">
                            <p className="text-blue-100 text-[10px] sm:text-xs">Follow-ups</p>
                            <p className="text-white text-sm sm:text-base md:text-xl font-bold">{stats.followups}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Responsive Search and Filters */}
            <div className="p-3 sm:p-5 border-b border-gray-200 bg-gray-50/80">
                <div className="flex flex-col gap-3">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search leads or activities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                        />
                    </div>

                    {/* Filter Buttons - Mobile */}
                    <div className="flex sm:hidden gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg transition-colors text-sm ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-200 bg-white text-gray-700'
                                }`}
                        >
                            <Filter size={16} />
                            <span>Filters</span>
                        </button>
                        <button
                            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                            className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm"
                        >
                            <Clock size={16} />
                            <span className="hidden xs:inline">{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
                        </button>
                    </div>

                    {/* Filter Dropdowns - Desktop */}
                    <div className="hidden sm:flex flex-wrap gap-2">
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm min-w-[160px]"
                        >
                            <option value="all">📊 All Activities</option>
                            <option value="lead_created">✨ Lead Created</option>
                            <option value="lead_updated">📝 Lead Updated</option>
                            <option value="followup_created">🔔 Follow-up Created</option>
                            <option value="followup_updated">🔄 Follow-up Updated</option>
                            <option value="call">📞 Calls</option>
                            <option value="email">✉️ Emails</option>
                            <option value="meeting">📅 Meetings</option>
                        </select>

                        <select
                            value={selectedDateRange}
                            onChange={(e) => setSelectedDateRange(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm text-sm"
                        >
                            <option value="all">📆 All Time</option>
                            <option value="today">📅 Today</option>
                            <option value="week">📅 This Week</option>
                            <option value="month">📅 This Month</option>
                        </select>

                        <button
                            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-white transition-colors flex items-center gap-2 bg-white shadow-sm text-sm"
                        >
                            <Clock size={16} />
                            <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
                            {sortOrder === "desc" ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                        </button>
                    </div>

                    {/* Mobile Advanced Filters */}
                    {showFilters && (
                        <div className="sm:hidden space-y-2 mt-2">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                            >
                                <option value="all">All Activities</option>
                                <option value="lead_created">Lead Created</option>
                                <option value="lead_updated">Lead Updated</option>
                                <option value="followup_created">Follow-up Created</option>
                                <option value="followup_updated">Follow-up Updated</option>
                                <option value="call">Calls</option>
                                <option value="email">Emails</option>
                                <option value="meeting">Meetings</option>
                            </select>

                            <select
                                value={selectedDateRange}
                                onChange={(e) => setSelectedDateRange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Timeline Content */}
            <div className="p-3 sm:p-6 max-h-[500px] sm:max-h-[600px] overflow-y-auto bg-gradient-to-b from-white to-gray-50">
                {filteredLeads.length === 0 ? (
                    <div className="text-center py-12 sm:py-20">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <Clock size={24} className="text-blue-600" />
                        </div>
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-2">No activities found</h3>
                        <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                            Try adjusting your search or filters to see more results
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setFilterType("all");
                                setSelectedDateRange("all");
                            }}
                            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg sm:rounded-xl text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
                        >
                            Clear All Filters
                        </button>
                    </div>
                ) : (
                    <div className="relative">

                        <div className="flex flex-col gap-6">
                            {filteredLeads.map((leadBlock, blockIndex) => (
                                <div key={leadBlock._id} className="relative">
                                    {/* Lead Header - Responsive */}
                                    <div className={` mb-3 sm:mb-4`}>


                                        <div className="bg-gradient-to-r from-gray-50 to-white p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm">
                                            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                                                        {leadBlock.lead.name}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Phone size={12} className="text-blue-500" />
                                                            {leadBlock.lead.phone}
                                                        </span>
                                                        {leadBlock.lead.email && (
                                                            <span className="flex items-center gap-1">
                                                                <Mail size={12} className="text-purple-500" />
                                                                <span className="truncate max-w-[120px] sm:max-w-none">
                                                                    {leadBlock.lead.email}
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="self-start xs:self-auto px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                                                    {leadBlock.timeline.length} activities
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline Items for this Lead */}
                                    <div className={` space-y-2 sm:space-y-3`}>
                                        {leadBlock.timeline.map((item, index) => {
                                            const { time, relative, day, dateNum, month } = formatDateTime(item.createdAt);
                                            const uniqueId = `${leadBlock._id}-${index}`;
                                            const isExpanded = expandedItems.includes(uniqueId);
                                            const colorClass = getColorByType(item.type);

                                            return (
                                                <div
                                                    key={uniqueId}
                                                    className="relative group"
                                                >
                                                    {/* Timeline Dot - Hidden on mobile for compact view */}
                                                    {/* {viewMode === 'timeline' && (
                                                        <div className="hidden sm:block absolute -left-12 top-1/2 transform -translate-y-1/2">
                                                            <div className={`w-3 h-3 rounded-full ${colorClass} shadow-lg group-hover:scale-110 transition-transform`}>
                                                                <div className={`absolute inset-0 rounded-full ${colorClass} animate-ping opacity-20`}></div>
                                                            </div>
                                                        </div>
                                                    )} */}

                                                    {/* Timeline Card */}
                                                    <div className={`bg-white rounded-lg sm:rounded-xl border ${isExpanded ? 'border-blue-200 shadow-md' : 'border-gray-200 shadow-sm'} hover:shadow transition-all`}>
                                                        <div
                                                            className="p-3 sm:p-4 cursor-pointer"
                                                        // onClick={() => toggleExpand(uniqueId)}
                                                        >
                                                            <div className="flex items-start gap-2 sm:gap-3">
                                                                {/* Mobile Time Badge - Simplified */}
                                                                <div className="flex sm:hidden flex-col items-center min-w-[45px]">
                                                                    <span className="text-[10px] font-medium text-gray-500">{day}</span>
                                                                    <span className="text-sm font-bold text-gray-700">{dateNum}</span>
                                                                </div>

                                                                {/* Desktop Time Badge */}
                                                                <div className="hidden sm:flex flex-col items-center min-w-[60px]">
                                                                    <span className="text-xs font-medium text-gray-500">{day}</span>
                                                                    <span className="text-base font-bold text-gray-700">{dateNum}</span>
                                                                    <span className="text-xs text-gray-400">{month}</span>
                                                                </div>

                                                                {/* Icon */}
                                                                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${colorClass} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
                                                                    {getIconByType(item.type)}
                                                                </div>

                                                                {/* Content */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between gap-1 sm:gap-2">
                                                                        <h4 className="font-medium text-gray-800 text-xs sm:text-sm truncate max-w-[120px] xs:max-w-[200px] sm:max-w-none">
                                                                            {item.title}
                                                                        </h4>
                                                                        {/* <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                                                            <span className="text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                                                                {relative}
                                                                            </span>
                                                                            {isExpanded ? (
                                                                                <ChevronUp size={14} className="text-gray-400" />
                                                                            ) : (
                                                                                <ChevronDown size={14} className="text-gray-400" />
                                                                            )}
                                                                        </div> */}
                                                                    </div>

                                                                    <p className="text-xs text-gray-600 mt-1 line-clamp-1 sm:line-clamp-2">
                                                                        {item.description}
                                                                    </p>

                                                                    {/* Quick Info - Mobile */}
                                                                    <div className="flex sm:hidden items-center gap-2 mt-1 text-[10px] text-gray-500">
                                                                        <span className="flex items-center gap-0.5">
                                                                            <Clock size={10} />
                                                                            {time}
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-0.5">
                                                                            <User size={10} />
                                                                            {item.createdBy?.split(' ')[0] || "System"}
                                                                        </span>
                                                                    </div>

                                                                    {/* Quick Info - Desktop */}
                                                                    <div className="hidden sm:flex items-center gap-3 mt-2 text-xs text-gray-500">
                                                                        <span className="flex items-center gap-1">
                                                                            <Clock size={12} />
                                                                            {time}
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            <User size={12} />
                                                                            {item.createdBy || "System"}
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Tag size={12} />
                                                                            <span className="capitalize">{item.type.replace(/_/g, ' ')}</span>
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Expanded Content - Responsive */}
                                                        {isExpanded && (
                                                            <div className="p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-white border-t border-gray-200">
                                                                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                                                                    {item.details && Object.entries(item.details).map(([key, value]) => (
                                                                        <div key={key} className="col-span-1 p-2 sm:p-3 bg-white rounded-lg border border-gray-100">
                                                                            <span className="text-[10px] sm:text-xs text-gray-500 block mb-0.5 sm:mb-1 capitalize">{key}</span>
                                                                            <span className="text-xs sm:text-sm text-gray-800 font-medium break-words">{value || 'N/A'}</span>
                                                                        </div>
                                                                    ))}

                                                                    {item.attachments && item.attachments.length > 0 && (
                                                                        <div className="col-span-1 xs:col-span-2 mt-1 sm:mt-2">
                                                                            <span className="text-[10px] sm:text-xs text-gray-500 block mb-1 sm:mb-2">Attachments</span>
                                                                            <div className="flex flex-wrap gap-1 sm:gap-2">
                                                                                {item.attachments.map((att, idx) => (
                                                                                    <div key={idx} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-white rounded-lg border border-gray-200">
                                                                                        <Paperclip size={12} className="text-blue-500" />
                                                                                        <span className="text-[10px] sm:text-xs text-gray-700 truncate max-w-[80px] sm:max-w-none">
                                                                                            {att.name}
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Responsive Footer */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Activity size={14} className="text-blue-500 flex-shrink-0" />
                        <span>
                            <span className="font-semibold text-gray-800">
                                {filteredLeads.reduce((acc, lead) => acc + lead.timeline.length, 0)}
                            </span>
                            <span className="hidden xs:inline"> activities displayed</span>
                        </span>
                        <span className="text-gray-300 hidden sm:inline">|</span>
                        <span className="hidden sm:inline text-gray-500">
                            Updated: {new Date().toLocaleTimeString()}
                        </span>
                    </div>

                    {(searchTerm || filterType !== "all" || selectedDateRange !== "all") && (
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setFilterType("all");
                                setSelectedDateRange("all");
                            }}
                            className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm font-medium"
                        >
                            <X size={14} />
                            <span className="hidden xs:inline">Clear Filters</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LeadTimeline;