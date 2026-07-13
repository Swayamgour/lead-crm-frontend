// LeadTimelineDetail.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Clock,
    ArrowLeft,
    User,
    Phone,
    Mail,
    Calendar,
    Search,
    RefreshCw,
    MessageCircle,
    PhoneCall,
    Mail as MailIcon,
    Calendar as CalendarIcon,
    FileText,
    Tag,
    Activity,
    Edit3,
    Bell,
    Star,
    Sparkles,
    TrendingUp,
    ChevronDown,
    ChevronUp,
    MoreVertical,
    MessageSquare,
    Award,
    Target,
    Zap,
    Heart,
    Eye,
    UserPlus,
    UserCheck,
    RefreshCw as RefreshIcon,
    AlertCircle,
    CheckCircle,
    Info,
    Flag,
    Clock as ClockIcon,
    Paperclip,
    Link2,
    Share2,
    Bookmark
} from "lucide-react";
import { useGetTimelineGroupedByIdQuery } from "../../redux/api";
import Loading from "../../components/Loading";
import DateQuickFilter, { isWithinRange } from "../../components/DateQuickFilter";

function LeadTimelineDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, refetch } = useGetTimelineGroupedByIdQuery(id);
    const leadTimelineData = data || {};

    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [dateFilter, setDateFilter] = useState({ preset: "all", startDate: "", endDate: "" });
    const [sortOrder, setSortOrder] = useState("desc");
    const [expandedActivity, setExpandedActivity] = useState(null);

    // Format date function
    const formatDateTime = (dateString) => {
        if (!dateString) return { date: "N/A", time: "N/A", relative: "N/A", day: "N/A", month: "N/A", dateNum: 0 };
        const d = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

        return {
            date: d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            relative: diffDays === 0 ? "Today" : diffDays === 1 ? "Yesterday" : `${diffDays}d ago`,
            day: d.toLocaleDateString("en-US", { weekday: "long" }),
            month: d.toLocaleDateString("en-US", { month: "long" }),
            dateNum: d.getDate()
        };
    };

    // Get icon based on activity type
    const getActivityIcon = (type) => {
        const icons = {
            'lead_created': <Sparkles size={18} className="text-yellow-100" />,
            'lead_updated': <Edit3 size={18} className="text-green-100" />,
            'lead_assigned': <UserPlus size={18} className="text-blue-100" />,
            'remark_added': <MessageSquare size={18} className="text-purple-100" />,
            'remark_edited': <Edit3 size={18} className="text-orange-100" />,
            'followup_created': <Bell size={18} className="text-indigo-100" />,
            'followup_updated': <RefreshIcon size={18} className="text-amber-100" />,
            'call': <PhoneCall size={18} className="text-emerald-100" />,
            'email': <MailIcon size={18} className="text-red-100" />,
            'meeting': <CalendarIcon size={18} className="text-rose-100" />,
        };
        return icons[type] || <Activity size={18} className="text-gray-100" />;
    };

    // Get gradient based on activity type
    const getActivityGradient = (type) => {
        const gradients = {
            'lead_created': 'from-yellow-400 to-orange-500',
            'lead_updated': 'from-green-400 to-emerald-500',
            'lead_assigned': 'from-blue-400 to-cyan-500',
            'remark_added': 'from-purple-400 to-pink-500',
            'remark_edited': 'from-orange-400 to-amber-500',
            'followup_created': 'from-indigo-400 to-purple-500',
            'followup_updated': 'from-amber-400 to-yellow-500',
            'call': 'from-emerald-400 to-teal-500',
            'email': 'from-red-400 to-pink-500',
            'meeting': 'from-rose-400 to-red-500',
        };
        return gradients[type] || 'from-gray-400 to-gray-500';
    };

    // Get background color for stats
    const getStatColor = (type) => {
        const colors = {
            'lead_created': 'from-yellow-400 to-orange-500',
            'lead_updated': 'from-green-400 to-emerald-500',
            'lead_assigned': 'from-blue-400 to-cyan-500',
            'remark_added': 'from-purple-400 to-pink-500',
            'remark_edited': 'from-orange-400 to-amber-500',
            'followup_created': 'from-indigo-400 to-purple-500',
            'followup_updated': 'from-amber-400 to-yellow-500',
            'call': 'from-emerald-400 to-teal-500',
            'email': 'from-red-400 to-pink-500',
            'meeting': 'from-rose-400 to-red-500',
        };
        return colors[type] || 'from-gray-400 to-gray-500';
    };

    // Get readable label for activity type
    const getActivityLabel = (type) => {
        const labels = {
            'lead_created': 'Lead Created',
            'lead_updated': 'Lead Updated',
            'lead_assigned': 'Lead Assigned',
            'remark_added': 'Remark Added',
            'remark_edited': 'Remark Edited',
            'followup_created': 'Follow-up Created',
            'followup_updated': 'Follow-up Updated',
            'call': 'Call',
            'email': 'Email',
            'meeting': 'Meeting',
        };
        return labels[type] || type.replace(/_/g, ' ');
    };

    // Format description with metadata
    const formatDescription = (item) => {
        let description = item.description;

        // Handle metadata for better display
        if (item.metadata) {
            if (item.metadata.changes && item.metadata.changes.status) {
                const change = item.metadata.changes.status;
                description = `${item.title}: Status changed from "${change.old}" to "${change.new}"`;
            }
            if (item.metadata.text) {
                description = `"${item.metadata.text}"`;
            }
            if (item.metadata.oldText && item.metadata.newText) {
                description = `Changed from "${item.metadata.oldText}" to "${item.metadata.newText}"`;
            }
            if (item.metadata.updatedFields && item.metadata.updatedFields.length > 0) {
                description = `Updated fields: ${item.metadata.updatedFields.join(', ')}`;
            }
        }

        return description;
    };

    // Filter by date range
    const filterByDateRange = (date) => {
        if (dateFilter.preset === "all") return true;
        return isWithinRange(date, dateFilter.startDate, dateFilter.endDate);
    };

    // Get all timeline items
    const timelineItems = leadTimelineData.timelines || [];

    // Filter and sort activities
    const filteredActivities = timelineItems
        .filter(item => {
            if (filterType !== "all" && item.type !== filterType) return false;
            if (!filterByDateRange(item.createdAt)) return false;
            if (searchTerm) {
                const text = searchTerm.toLowerCase();
                return item.title?.toLowerCase().includes(text) ||
                    item.description?.toLowerCase().includes(text) ||
                    getActivityLabel(item.type).toLowerCase().includes(text);
            }
            return true;
        })
        .sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });

    // Group activities by date
    const groupedActivities = filteredActivities.reduce((acc, item) => {
        const dateKey = new Date(item.createdAt).toDateString();
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(item);
        return acc;
    }, {});

    // Calculate stats
    const stats = {
        total: timelineItems.length,
        leadCreated: timelineItems.filter(t => t.type === 'lead_created').length,
        leadUpdated: timelineItems.filter(t => t.type === 'lead_updated').length,
        leadAssigned: timelineItems.filter(t => t.type === 'lead_assigned').length,
        remarks: timelineItems.filter(t => t.type === 'remark_added' || t.type === 'remark_edited').length,
        followups: timelineItems.filter(t => t.type.includes('followup')).length,
        calls: timelineItems.filter(t => t.type === 'call').length,
        emails: timelineItems.filter(t => t.type === 'email').length,
        meetings: timelineItems.filter(t => t.type === 'meeting').length,
    };

    const engagementScore = Math.min(100, Math.floor((stats.total / 30) * 100));

    // Get lead info from the first timeline item
    const leadInfo = timelineItems[0]?.leadId ? {
        name: leadTimelineData.leadName || "Unknown Lead",
        phone: leadTimelineData.leadPhone || "N/A",
        email: leadTimelineData.leadEmail || "",
        createdAt: leadTimelineData.leadCreatedAt || new Date().toISOString()
    } : {
        name: "Loading...",
        phone: "N/A",
        email: "",
        createdAt: new Date().toISOString()
    };

    if (isLoading) {
        return <Loading data={'Lead Timeline'} />;
    }

    const initials = leadInfo.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "LD";

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                {/* <button
                    onClick={() => navigate('/leads')}
                    className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
                    <span>Back to All Leads</span>
                </button> */}

                {/* Lead Header Card */}
                <div className="relative mb-8">
                    <div className="relative bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] border border-gray-100 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#2653ef] to-[#f5a524]" />

                        {/* {console.log(data?.lead)} */}
                        <div className="pt-6 pb-6 px-8">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2653ef] to-[#1d40c9] flex items-center justify-center shadow-[0_6px_16px_rgba(38,83,239,0.3)] flex-shrink-0">
                                        <span className="text-white font-bold text-sm">{initials}</span>
                                    </span>
                                    <div>
                                    <h1 className="text-2xl font-bold text-gray-800">{data?.lead?.name}</h1>
                                    <div className="flex flex-wrap items-center gap-3 mt-2">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                                            <Phone size={14} className="text-gray-500" />
                                            <span className="text-sm text-gray-600">{data?.lead?.phone}</span>
                                        </div>
                                        {leadInfo.email && (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                                                <Mail size={14} className="text-gray-500" />
                                                <span className="text-sm text-gray-600">{data?.lead?.email}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                                            <Calendar size={14} className="text-gray-500" />
                                            <span className="text-sm text-gray-600">Joined {formatDateTime(data?.lead?.createdAt).date}</span>
                                        </div>
                                    </div>
                                    </div>
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Total Activities"
                        value={stats.total}
                        icon={<Activity size={20} />}
                        gradient="from-blue-500 to-cyan-500"
                    />
                    <StatCard
                        title="Lead Changes"
                        value={stats.leadUpdated + stats.leadAssigned}
                        icon={<Edit3 size={20} />}
                        gradient="from-green-500 to-emerald-500"
                    />
                    <StatCard
                        title="Remarks"
                        value={stats.remarks}
                        icon={<MessageSquare size={20} />}
                        gradient="from-purple-500 to-pink-500"
                    />
                    <StatCard
                        title="Follow-ups"
                        value={stats.followups}
                        icon={<Bell size={20} />}
                        gradient="from-orange-500 to-red-500"
                    />
                </div>

                {/* Engagement Score */}
                <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] p-5 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={18} className="text-[#2653ef]" />
                            <span className="font-semibold text-gray-700">Engagement Score</span>
                        </div>
                        <span className="text-2xl font-bold text-[#2653ef]">{engagementScore}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                            style={{ width: `${engagementScore}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Based on {stats.total} activities and interactions
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] p-4 mb-6">
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search activities..."
                                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-100 focus:ring-2 focus:ring-[#2653ef] text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: "all", label: "All", icon: Activity },
                                { value: "lead_created", label: "Created", icon: Sparkles },
                                { value: "lead_updated", label: "Updated", icon: Edit3 },
                                { value: "lead_assigned", label: "Assigned", icon: UserPlus },
                                { value: "remark_added", label: "Remarks", icon: MessageSquare },
                                { value: "followup_created", label: "Follow-ups", icon: Bell },
                                { value: "call", label: "Calls", icon: PhoneCall },
                                { value: "email", label: "Emails", icon: MailIcon },
                                { value: "meeting", label: "Meetings", icon: CalendarIcon }
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setFilterType(type.value)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${filterType === type.value
                                        ? 'bg-gradient-to-r from-[#2653ef] to-[#1d40c9] text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <type.icon size={12} />
                                    {type.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                            <DateQuickFilter value={dateFilter} onChange={setDateFilter} compact />
                            <button
                                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                                className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#2653ef] whitespace-nowrap"
                            >
                                <Clock size={12} />
                                {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                {Object.keys(groupedActivities).length === 0 ? (
                    <EmptyTimelineState />
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedActivities).map(([dateKey, items]) => {
                            const date = new Date(dateKey);
                            const isToday = date.toDateString() === new Date().toDateString();
                            const dateLabel = isToday ? "Today" : formatDateTime(dateKey).date;

                            return (
                                <div key={dateKey} className="relative">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                                            <Calendar size={16} className="text-white" />
                                        </div>
                                        <h3 className="font-bold text-gray-800 text-lg">{dateLabel}</h3>
                                        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                                        <span className="text-xs text-gray-400">{items.length} activities</span>
                                    </div>
                                    <div className="space-y-3 pl-4">
                                        {items.map((item, idx) => (
                                            <TimelineActivityCard
                                                key={item._id || idx}
                                                item={item}
                                                formatDateTime={formatDateTime}
                                                getActivityIcon={getActivityIcon}
                                                getActivityGradient={getActivityGradient}
                                                getActivityLabel={getActivityLabel}
                                                formatDescription={formatDescription}
                                                isExpanded={expandedActivity === item._id}
                                                onToggle={() => setExpandedActivity(expandedActivity === item._id ? null : item._id)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// Stat Card Component
const StatCard = ({ title, value, icon, gradient }) => (
    <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] p-4 hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-xs text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
            </div>
            <div className={`w-10 h-10 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                <div className="text-white">
                    {icon}
                </div>
            </div>
        </div>
    </div>
);

// Timeline Activity Card
const TimelineActivityCard = ({
    item,
    formatDateTime,
    getActivityIcon,
    getActivityGradient,
    getActivityLabel,
    formatDescription,
    isExpanded,
    onToggle
}) => {
    const { time, relative } = formatDateTime(item.createdAt);
    const gradient = getActivityGradient(item.type);
    const description = formatDescription(item);
    const activityLabel = getActivityLabel(item.type);

    // Check if description is long
    const isLongDescription = description?.length > 120;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] hover:shadow-md transition-all overflow-hidden group">
            <div className={`h-1 bg-gradient-to-r ${gradient}`}></div>
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                        {getActivityIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-semibold text-gray-800 text-sm">
                                        {item.title}
                                    </h4>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                                        <Tag size={10} />
                                        {activityLabel}
                                    </span>
                                </div>
                                <p className={`text-sm text-gray-600 mt-2 leading-relaxed ${!isExpanded && isLongDescription ? 'line-clamp-2' : ''}`}>
                                    {description}
                                </p>
                                {isLongDescription && (
                                    <button
                                        onClick={onToggle}
                                        className="text-xs text-[#2653ef] hover:text-indigo-700 mt-2 font-medium inline-flex items-center gap-1"
                                    >
                                        {isExpanded ? (
                                            <>Show less <ChevronUp size={12} /></>
                                        ) : (
                                            <>Read more <ChevronDown size={12} /></>
                                        )}
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-xl whitespace-nowrap">
                                    {time}
                                </span>
                                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                                    {relative}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-50">
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                <User size={10} />
                                {item.createdByName || item.createdBy?.split(' ')[0] || "System"}
                            </span>
                            {item.metadata?.updatedFields && (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-xl">
                                    <Edit3 size={10} />
                                    Updated: {item.metadata.updatedFields.join(', ')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Empty Timeline State
const EmptyTimelineState = () => (
    <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No activities found</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
            No activities match your current filters. Try adjusting your search or filter criteria to see more results.
        </p>
    </div>
);

export default LeadTimelineDetail;