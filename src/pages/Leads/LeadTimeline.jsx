// LeadOverview.jsx
import React, { useState, useEffect } from "react";
import {
    Clock,
    Search,
    User,
    Phone,
    Mail,
    Calendar,
    Filter,
    RefreshCw,
    Download,
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
    Eye,
    Star,
    TrendingUp,
    Award,
    Target,
    Zap,
    ArrowRight,
    Sparkles,
    BarChart3,
    CheckCircle,
    AlertCircle,
    MoreVertical,
    MapPin,
    Briefcase,
    DollarSign,
    ThumbsUp,
    MessageSquare,
    Shield,
    Heart,
    Layers,
    PieChart,
    Grid,
    List,
    Filter as FilterIcon,
    X,
    ChevronDown,
    ChevronUp,
    Menu
} from "lucide-react";
import { Link } from "react-router-dom";
import { useGetTimelineGroupedQuery } from "../../redux/api";
import Loading from "../../components/Loading";

function LeadOverview() {
    const { data, isLoading, refetch } = useGetTimelineGroupedQuery();
    const leadsTimeline = data || [];

    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortBy, setSortBy] = useState("activity");
    const [viewMode, setViewMode] = useState("grid");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [dateRange, setDateRange] = useState("all");

    // Process leads data with enhanced metrics
    const processedLeads = leadsTimeline.map(lead => {
        const timeline = lead.timeline || [];
        const now = new Date();
        const last7Days = timeline.filter(t => {
            const activityDate = new Date(t.createdAt);
            const diffDays = Math.floor((now - activityDate) / (1000 * 60 * 60 * 24));
            return diffDays <= 7;
        }).length;

        return {
            ...lead,
            totalActivities: timeline.length,
            latestActivity: timeline[0]?.createdAt || null,
            earliestActivity: timeline[timeline.length - 1]?.createdAt || null,
            activitiesByType: {
                calls: timeline.filter(t => t.type === 'call').length,
                emails: timeline.filter(t => t.type === 'email').length,
                meetings: timeline.filter(t => t.type === 'meeting').length,
                followups: timeline.filter(t => t.type.includes('followup')).length,
                updates: timeline.filter(t => t.type === 'lead_updated').length,
                remarks: timeline.filter(t => t.type.includes('remark')).length,
            },
            lastInteraction: timeline[0]?.createdAt || null,
            engagementScore: Math.min(100, Math.floor((timeline.length / 30) * 100)),
            recentActivityCount: last7Days,
            activityTrend: timeline.length > 10 ? 'high' : timeline.length > 5 ? 'medium' : 'low',
        };
    });

    // Filter leads with date range
    const filteredLeads = processedLeads
        .filter(lead => {
            if (!searchTerm) return true;
            const search = searchTerm.toLowerCase();
            return (
                lead.lead.name?.toLowerCase().includes(search) ||
                lead.lead.phone?.includes(search) ||
                lead.lead.email?.toLowerCase().includes(search) ||
                lead.lead.company?.toLowerCase().includes(search)
            );
        })
        .filter(lead => {
            if (filterStatus === "all") return true;
            if (filterStatus === "active") return lead.totalActivities > 8;
            if (filterStatus === "moderate") return lead.totalActivities > 3 && lead.totalActivities <= 8;
            if (filterStatus === "low") return lead.totalActivities <= 3;
            return true;
        })
        .filter(lead => {
            if (dateRange === "all") return true;
            if (dateRange === "today") {
                return lead.latestActivity && new Date(lead.latestActivity).toDateString() === new Date().toDateString();
            }
            if (dateRange === "week") {
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return lead.latestActivity && new Date(lead.latestActivity) >= weekAgo;
            }
            if (dateRange === "month") {
                const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                return lead.latestActivity && new Date(lead.latestActivity) >= monthAgo;
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "activity") return b.totalActivities - a.totalActivities;
            if (sortBy === "recent") return new Date(b.latestActivity) - new Date(a.latestActivity);
            if (sortBy === "name") return a.lead.name.localeCompare(b.lead.name);
            if (sortBy === "engagement") return b.engagementScore - a.engagementScore;
            return 0;
        });

    // Enhanced stats
    const stats = {
        totalLeads: processedLeads.length,
        totalActivities: processedLeads.reduce((sum, l) => sum + l.totalActivities, 0),
        avgEngagement: Math.floor(processedLeads.reduce((sum, l) => sum + l.engagementScore, 0) / processedLeads.length) || 0,
        activeLeads: processedLeads.filter(l => l.totalActivities > 8).length,
        totalCalls: processedLeads.reduce((sum, l) => sum + l.activitiesByType.calls, 0),
        totalEmails: processedLeads.reduce((sum, l) => sum + l.activitiesByType.emails, 0),
        totalMeetings: processedLeads.reduce((sum, l) => sum + l.activitiesByType.meetings, 0),
        highEngagement: processedLeads.filter(l => l.engagementScore >= 70).length,
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Never";
        const d = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    if (isLoading) {
        return <Loading data={'Lead Overview'} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
            {/* Animated Background */}
            {/* <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div> */}

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section with Animation */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                                    <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl">
                                        <Users size={24} className="text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                                        Lead Overview
                                    </h1>
                                    <p className="text-gray-500 mt-1 text-sm">
                                        Track and manage all your leads with powerful insights
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                    </div>

                    {/* Enhanced Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                        <EnhancedStatCard
                            title="Total Leads"
                            value={stats.totalLeads}
                            icon={<Users size={22} />}
                            gradient="from-blue-500 to-cyan-500"
                            trend="+12%"
                            description="Active leads this month"
                        />
                        <EnhancedStatCard
                            title="Total Activities"
                            value={stats.totalActivities}
                            icon={<Activity size={22} />}
                            gradient="from-purple-500 to-pink-500"
                            trend="+8%"
                            description="Across all interactions"
                        />
                        <EnhancedStatCard
                            title="Engagement Rate"
                            value={`${stats.avgEngagement}%`}
                            icon={<TrendingUp size={22} />}
                            gradient="from-green-500 to-emerald-500"
                            trend="+5%"
                            description="Average engagement score"
                        />
                        <EnhancedStatCard
                            title="Active Leads"
                            value={stats.activeLeads}
                            icon={<Zap size={22} />}
                            gradient="from-orange-500 to-red-500"
                            trend="+3%"
                            description="High activity leads"
                        />
                    </div>

                    {/* Secondary Stats Row */}
                    {/* <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
                        <MiniStatCard title="Calls" value={stats.totalCalls} icon={<PhoneCall size={14} />} color="blue" />
                        <MiniStatCard title="Emails" value={stats.totalEmails} icon={<MailIcon size={14} />} color="red" />
                        <MiniStatCard title="Meetings" value={stats.totalMeetings} icon={<CalendarIcon size={14} />} color="purple" />
                        <MiniStatCard title="Updates" value={processedLeads.reduce((s, l) => s + l.activitiesByType.updates, 0)} icon={<Edit3 size={14} />} color="green" />
                        <MiniStatCard title="Remarks" value={processedLeads.reduce((s, l) => s + l.activitiesByType.remarks, 0)} icon={<MessageSquare size={14} />} color="orange" />
                        <MiniStatCard title="Follow-ups" value={processedLeads.reduce((s, l) => s + l.activitiesByType.followups, 0)} icon={<Bell size={14} />} color="indigo" />
                    </div> */}

                    {/* Enhanced Filters Section */}
                    <div className="mt-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search leads by name, phone, email or company..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-indigo-500 transition-all bg-gray-50/50 hover:bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="px-4 py-2.5 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 transition-all flex items-center gap-2"
                                >
                                    <FilterIcon size={16} />
                                    <span className="text-sm">Filters</span>
                                    {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                                <div className="flex gap-1 bg-gray-100 rounded-2xl p-1">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`px-3 py-1.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-white shadow-md text-indigo-600" : "text-gray-500"}`}
                                    >
                                        <Grid size={18} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode("list")}
                                        className={`px-3 py-1.5 rounded-xl transition-all ${viewMode === "list" ? "bg-white shadow-md text-indigo-600" : "text-gray-500"}`}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Filters */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-1 block">Lead Status</label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-100 focus:ring-2 focus:ring-indigo-500 text-sm"
                                        >
                                            <option value="all">All Leads</option>
                                            <option value="active">Active (8+ activities)</option>
                                            <option value="moderate">Moderate (4-7 activities)</option>
                                            <option value="low">Low (1-3 activities)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-1 block">Sort By</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-100 focus:ring-2 focus:ring-indigo-500 text-sm"
                                        >
                                            <option value="activity">Most Active</option>
                                            <option value="recent">Recently Active</option>
                                            <option value="engagement">Highest Engagement</option>
                                            <option value="name">Name A-Z</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 mb-1 block">Date Range</label>
                                        <select
                                            value={dateRange}
                                            onChange={(e) => setDateRange(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-100 focus:ring-2 focus:ring-indigo-500 text-sm"
                                        >
                                            <option value="all">All Time</option>
                                            <option value="today">Today</option>
                                            <option value="week">Last 7 Days</option>
                                            <option value="month">Last 30 Days</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Leads Display */}
                {filteredLeads.length === 0 ? (
                    <EnhancedEmptyState />
                ) : (
                    <div className={viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "space-y-4"
                    }>
                        {filteredLeads.map((lead) => (
                            viewMode === "grid"
                                ? <EnhancedLeadCard key={lead._id} lead={lead} formatDate={formatDate} />
                                : <EnhancedLeadListItem key={lead._id} lead={lead} formatDate={formatDate} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Enhanced Stat Card Component
const EnhancedStatCard = ({ title, value, icon, gradient, trend, description }) => (
    <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            <TrendingUp size={12} className="text-green-500" />
                            <span className="text-xs text-green-600">{trend}</span>
                            <span className="text-xs text-gray-400 ml-1">{description}</span>
                        </div>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">{icon}</div>
                </div>
            </div>
        </div>
    </div>
);

// Mini Stat Card
const MiniStatCard = ({ title, value, icon, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        red: "bg-red-50 text-red-600",
        purple: "bg-purple-50 text-purple-600",
        green: "bg-green-50 text-green-600",
        orange: "bg-orange-50 text-orange-600",
        indigo: "bg-indigo-50 text-indigo-600",
    };

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 text-center hover:shadow-md transition-all group">
            <div className={`w-8 h-8 rounded-xl ${colors[color]} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <p className="text-lg font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-500">{title}</p>
        </div>
    );
};

// Enhanced Lead Card (Grid View)
const EnhancedLeadCard = ({ lead, formatDate }) => {
    const initials = lead.lead.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const engagementColor = lead.engagementScore >= 70 ? "bg-green-500" : lead.engagementScore >= 40 ? "bg-yellow-500" : "bg-red-500";
    const trendIcon = lead.activityTrend === 'high' ? <TrendingUp size={12} className="text-green-500" /> :
        lead.activityTrend === 'medium' ? <Activity size={12} className="text-yellow-500" /> :
            <TrendingUp size={12} className="text-red-500 rotate-180" />;

    return (
        <Link to={`/lead-timeline/${lead._id}`} className="block group">
            <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
                {/* Gradient Border */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ padding: '2px', margin: '-2px' }}>
                    <div className="absolute inset-0 bg-white rounded-2xl"></div>
                </div>

                <div className="relative bg-white rounded-2xl p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                                    <span className="text-white font-bold text-lg">{initials}</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 text-base group-hover:text-indigo-600 transition-colors">
                                    {lead.lead.name}
                                </h3>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <Phone size={12} className="text-gray-400" />
                                    <span className="text-xs text-gray-500">{lead.lead.phone}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-xl">
                            {trendIcon}
                            <span className="text-xs font-medium text-gray-600">{lead.recentActivityCount} recent</span>
                        </div>
                    </div>

                    {/* Engagement Score */}
                    {/* <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Engagement Score</span>
                            <span className="font-semibold text-gray-700">{lead.engagementScore}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${engagementColor}`}
                                style={{ width: `${lead.engagementScore}%` }}
                            ></div>
                        </div>
                    </div> */}

                    {/* Activity Stats */}
                   

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <Clock size={12} className="text-gray-400" />
                            <span className="text-xs text-gray-500">{formatDate(lead.lastInteraction)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-indigo-600 text-xs font-medium group-hover:gap-2 transition-all">
                            <span>View Timeline</span>
                            <ArrowRight size={12} className="group-hover:translate-x-1 transition" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

// Enhanced Lead List Item
const EnhancedLeadListItem = ({ lead, formatDate }) => {
    const initials = lead.lead.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const engagementColor = lead.engagementScore >= 70 ? "bg-green-500" : lead.engagementScore >= 40 ? "bg-yellow-500" : "bg-red-500";

    return (
        <Link to={`/lead-timeline/${lead._id}`} className="block group">
            <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 p-4 hover:bg-gradient-to-r hover:from-white hover:to-indigo-50/30">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
                        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{initials}</span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                                    {lead.lead.name}
                                </h3>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <Phone size={12} />
                                        {lead.lead.phone}
                                    </span>
                                    {lead.lead.email && (
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <Mail size={12} />
                                            {lead.lead.email}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-gray-800">{lead.totalActivities} Activities</div>
                                    <div className="text-xs text-gray-500">Last: {formatDate(lead.lastInteraction)}</div>
                                </div>
                                <div className="w-16">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">Score</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${engagementColor}`}
                                            style={{ width: `${lead.engagementScore}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-right mt-1 font-medium text-gray-600">
                                        {lead.engagementScore}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

// Enhanced Empty State
const EnhancedEmptyState = () => (
    <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-16 text-center overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-r from-pink-500/10 to-orange-500/10 rounded-full blur-3xl"></div>

        <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Users size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No leads found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
                Try adjusting your search or filters to find leads. You can also add new leads from the CRM dashboard.
            </p>
            <button className="mt-6 px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:shadow-lg transition-all inline-flex items-center gap-2">
                <Sparkles size={16} />
                Clear Filters
            </button>
        </div>
    </div>
);

// Add these styles to your global CSS
const styles = `
@keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
}

.animate-blob {
    animation: blob 7s infinite;
}

.animation-delay-2000 {
    animation-delay: 2s;
}

.animation-delay-4000 {
    animation-delay: 4s;
}
`;

export default LeadOverview;