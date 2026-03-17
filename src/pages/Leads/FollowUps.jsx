import React, { useState } from "react";
import {
    Phone,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    Calendar,
    User,
    Clock,
    Filter,
    Search,
    MoreVertical,
    CheckCircle,
    XCircle,
    AlertCircle,
    PhoneCall,
    Mail,
    CalendarClock,
    UserCircle,
    FileText,
    Download,
    RefreshCw
} from "lucide-react";
import { useGetFollowUpsQuery } from "../../redux/api";
import Loading from "../../components/Loading";

function FollowUps() {
    const { data, isLoading } = useGetFollowUpsQuery();
    const followups = data || [];

    const [expandedLead, setExpandedLead] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("table"); // table or card

    /* ---------------------------
       GROUP FOLLOWUPS BY LEAD
    ----------------------------*/
    const groupedFollowups = Object.values(
        followups.reduce((acc, item) => {
            const leadId = item?.leadId?._id;
            if (!acc[leadId]) {
                acc[leadId] = {
                    lead: item.leadId,
                    history: []
                };
            }
            acc[leadId].history.push(item);
            return acc;
        }, {})
    );

    /* ---------------------------
       GET NEXT FOLLOWUP
    ----------------------------*/
    const getNextFollowUp = (history) => {
        const today = new Date();
        const upcoming = history
            .filter(h => new Date(h.followUpDate) >= today)
            .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));
        return upcoming[0] || history[0];
    };

    /* ---------------------------
       STATUS CONFIGURATION
    ----------------------------*/
    const getStatusConfig = (status) => {
        const config = {
            pending: {
                color: "bg-amber-50 text-amber-700 border-amber-200",
                icon: <Clock size={14} className="mr-1" />,
                label: "Pending",
                bg: "bg-amber-50",
                text: "text-amber-700",
                border: "border-amber-200",
                dot: "bg-amber-500"
            },
            completed: {
                color: "bg-emerald-50 text-emerald-700 border-emerald-200",
                icon: <CheckCircle size={14} className="mr-1" />,
                label: "Completed",
                bg: "bg-emerald-50",
                text: "text-emerald-700",
                border: "border-emerald-200",
                dot: "bg-emerald-500"
            },
            missed: {
                color: "bg-rose-50 text-rose-700 border-rose-200",
                icon: <XCircle size={14} className="mr-1" />,
                label: "Missed",
                bg: "bg-rose-50",
                text: "text-rose-700",
                border: "border-rose-200",
                dot: "bg-rose-500"
            }
        };
        return config[status] || config.pending;
    };

    /* ---------------------------
       TYPE ICONS
    ----------------------------*/
    const getTypeIcon = (type) => {
        const icons = {
            call: <PhoneCall size={16} className="text-blue-500" />,
            meeting: <UserCircle size={16} className="text-purple-500" />,
            whatsapp: <MessageCircle size={16} className="text-green-500" />,
            email: <Mail size={16} className="text-orange-500" />
        };
        return icons[type] || <Clock size={16} className="text-gray-500" />;
    };

    /* ---------------------------
       FILTER FOLLOWUPS
    ----------------------------*/
    const filteredFollowups = groupedFollowups.filter(item => {
        const matchesSearch =
            item.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.lead?.phone?.includes(searchTerm) ||
            item.lead?.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            filterStatus === "all" ||
            item.history.some(h => h.status === filterStatus);

        const matchesType =
            filterType === "all" ||
            item.history.some(h => h.type === filterType);

        return matchesSearch && matchesStatus && matchesType;
    });

    /* ---------------------------
       STATISTICS
    ----------------------------*/
    const totalFollowUps = followups.length;
    const pendingCount = followups.filter(f => f.status === "pending").length;
    const completedCount = followups.filter(f => f.status === "completed").length;
    const missedCount = followups.filter(f => f.status === "missed").length;
    const overdueCount = followups.filter(f =>
        f.status === "pending" && new Date(f.followUpDate) < new Date()
    ).length;

    /* ---------------------------
       LOADING STATE
    ----------------------------*/
    if (isLoading) {
        return (
           <Loading data={'Follow ups'} />
        );
    }

    /* ---------------------------
       MAIN RENDER
    ----------------------------*/
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* HEADER SECTION */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Follow-ups</h1>
                            <p className="text-gray-600 mt-1">Manage and track all your lead follow-ups</p>
                        </div>

                        {/* VIEW TOGGLE */}
                        <div className="flex items-center bg-white rounded-lg shadow-sm p-1">
                            <button
                                onClick={() => setViewMode("table")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "table"
                                        ? "bg-indigo-600 text-white shadow-md"
                                        : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                Table
                            </button>
                            <button
                                onClick={() => setViewMode("card")}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === "card"
                                        ? "bg-indigo-600 text-white shadow-md"
                                        : "text-gray-600 hover:text-gray-900"
                                    }`}
                            >
                                Cards
                            </button>
                        </div>
                    </div>

                    {/* STATISTICS CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                        <StatCard
                            title="Total Follow-ups"
                            value={totalFollowUps}
                            icon={<CalendarClock size={20} />}
                            color="bg-blue-500"
                        />
                        <StatCard
                            title="Pending"
                            value={pendingCount}
                            icon={<Clock size={20} />}
                            color="bg-amber-500"
                        />
                        <StatCard
                            title="Completed"
                            value={completedCount}
                            icon={<CheckCircle size={20} />}
                            color="bg-emerald-500"
                        />
                        <StatCard
                            title="Missed"
                            value={missedCount}
                            icon={<XCircle size={20} />}
                            color="bg-rose-500"
                        />
                        <StatCard
                            title="Overdue"
                            value={overdueCount}
                            icon={<AlertCircle size={20} />}
                            color="bg-red-500"
                        />
                    </div>

                    {/* FILTERS SECTION */}
                    <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* SEARCH */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name, phone or email..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* STATUS FILTER */}
                            <div className="relative min-w-[150px]">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="missed">Missed</option>
                                </select>
                            </div>

                            {/* TYPE FILTER */}
                            <div className="relative min-w-[150px]">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                >
                                    <option value="all">All Types</option>
                                    <option value="call">Call</option>
                                    <option value="meeting">Meeting</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="email">Email</option>
                                </select>
                            </div>

                            {/* REFRESH BUTTON */}
                            <button className="p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                                <RefreshCw size={20} className="text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* CONTENT SECTION */}
                {filteredFollowups.length === 0 ? (
                    <EmptyState />
                ) : (
                    viewMode === "table" ? (
                        <TableView
                            filteredFollowups={filteredFollowups}
                            expandedLead={expandedLead}
                            setExpandedLead={setExpandedLead}
                            getNextFollowUp={getNextFollowUp}
                            getStatusConfig={getStatusConfig}
                            getTypeIcon={getTypeIcon}
                        />
                    ) : (
                        <CardView
                            filteredFollowups={filteredFollowups}
                            expandedLead={expandedLead}
                            setExpandedLead={setExpandedLead}
                            getNextFollowUp={getNextFollowUp}
                            getStatusConfig={getStatusConfig}
                            getTypeIcon={getTypeIcon}
                        />
                    )
                )}
            </div>
        </div>
    );
}

/* ======================
   STAT CARD COMPONENT
====================== */
const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-600 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`w-10 h-10 ${color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                <div className={`${color.replace('bg-', 'text-')}`}>{icon}</div>
            </div>
        </div>
    </div>
);

/* ======================
   TABLE VIEW COMPONENT
====================== */
const TableView = ({
    filteredFollowups,
    expandedLead,
    setExpandedLead,
    getNextFollowUp,
    getStatusConfig,
    getTypeIcon
}) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lead</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Next Follow-up</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {filteredFollowups.map(item => {
                        const next = getNextFollowUp(item.history);
                        const statusConfig = getStatusConfig(next.status);
                        const isExpanded = expandedLead === item.lead._id;

                        return (
                            <React.Fragment key={item.lead._id}>
                                <tr className={`hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-indigo-50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                                <span className="text-indigo-600 font-semibold text-sm">
                                                    {item.lead.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{item.lead.name}</div>
                                                <div className="text-sm text-gray-500">{item.lead.company || 'No company'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{item.lead.phone}</div>
                                        <div className="text-sm text-gray-500">{item.lead.email || 'No email'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <Calendar size={16} className="text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-900">
                                                {new Date(next.followUpDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            {getTypeIcon(next.type)}
                                            <span className="ml-2 text-sm text-gray-600 capitalize">{next.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                            {statusConfig.icon}
                                            {statusConfig.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`tel:${item.lead.phone}`}
                                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="Call"
                                            >
                                                <Phone size={18} />
                                            </a>
                                            <a
                                                href={`https://wa.me/${item.lead.phone}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="WhatsApp"
                                            >
                                                <MessageCircle size={18} />
                                            </a>
                                            <button
                                                onClick={() => setExpandedLead(isExpanded ? null : item.lead._id)}
                                                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                title={isExpanded ? "Show less" : "Show history"}
                                            >
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                            </button>
                                            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {/* HISTORY EXPANDED VIEW */}
                                {isExpanded && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 bg-gray-50">
                                            <div className="space-y-3">
                                                <h4 className="font-medium text-gray-900 flex items-center">
                                                    <Clock size={16} className="mr-2 text-gray-500" />
                                                    Follow-up History
                                                </h4>
                                                <div className="grid gap-3">
                                                    {item.history
                                                        .sort((a, b) => new Date(b.followUpDate) - new Date(a.followUpDate))
                                                        .map(h => (
                                                            <HistoryItem
                                                                key={h._id}
                                                                history={h}
                                                                getStatusConfig={getStatusConfig}
                                                                getTypeIcon={getTypeIcon}
                                                            />
                                                        ))}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
);

/* ======================
   CARD VIEW COMPONENT
====================== */
const CardView = ({
    filteredFollowups,
    expandedLead,
    setExpandedLead,
    getNextFollowUp,
    getStatusConfig,
    getTypeIcon
}) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFollowups.map(item => {
            const next = getNextFollowUp(item.history);
            const statusConfig = getStatusConfig(next.status);
            const isExpanded = expandedLead === item.lead._id;

            return (
                <div key={item.lead._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    {/* Card Header */}
                    <div className="p-6 border-b">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-white font-bold text-lg">
                                        {item.lead.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{item.lead.name}</h3>
                                    <p className="text-sm text-gray-500">{item.lead.company || 'No company'}</p>
                                </div>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                {statusConfig.icon}
                                {statusConfig.label}
                            </span>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center text-gray-600">
                                <Phone size={14} className="mr-2" />
                                {item.lead.phone}
                            </div>
                            {item.lead.email && (
                                <div className="flex items-center text-gray-600">
                                    <Mail size={14} className="mr-2" />
                                    {item.lead.email}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4">
                        {/* Next Follow-up */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-500 mb-2">NEXT FOLLOW-UP</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    {getTypeIcon(next.type)}
                                    <span className="ml-2 text-sm font-medium text-gray-900 capitalize">{next.type}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar size={14} className="mr-1" />
                                    {new Date(next.followUpDate).toLocaleDateString()}
                                </div>
                            </div>
                            {next.note && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{next.note}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <a
                                    href={`tel:${item.lead.phone}`}
                                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Call"
                                >
                                    <Phone size={18} />
                                </a>
                                <a
                                    href={`https://wa.me/${item.lead.phone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="WhatsApp"
                                >
                                    <MessageCircle size={18} />
                                </a>
                            </div>
                            <button
                                onClick={() => setExpandedLead(isExpanded ? null : item.lead._id)}
                                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
                            >
                                {isExpanded ? 'Show less' : 'View history'}
                                {isExpanded ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
                            </button>
                        </div>

                        {/* History Section */}
                        {isExpanded && (
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-xs font-medium text-gray-500 mb-3">FOLLOW-UP HISTORY</p>
                                <div className="space-y-3">
                                    {item.history
                                        .sort((a, b) => new Date(b.followUpDate) - new Date(a.followUpDate))
                                        .map(h => (
                                            <HistoryItem
                                                key={h._id}
                                                history={h}
                                                getStatusConfig={getStatusConfig}
                                                getTypeIcon={getTypeIcon}
                                                compact
                                            />
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        })}
    </div>
);

/* ======================
   HISTORY ITEM COMPONENT
====================== */
const HistoryItem = ({ history, getStatusConfig, getTypeIcon, compact = false }) => {
    const statusConfig = getStatusConfig(history.status);

    if (compact) {
        return (
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                    {getTypeIcon(history.type)}
                    <span className="ml-2 text-gray-600">
                        {new Date(history.followUpDate).toLocaleDateString()}
                    </span>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                    {statusConfig.label}
                </span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                    {getTypeIcon(history.type)}
                    <span className="ml-2 font-medium text-gray-900 capitalize">{history.type}</span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                </span>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar size={14} className="mr-1" />
                {new Date(history.followUpDate).toLocaleString()}
            </div>
            {history.note && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 mt-2">{history.note}</p>
            )}
        </div>
    );
};

/* ======================
   EMPTY STATE COMPONENT
====================== */
const EmptyState = () => (
    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarClock size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No follow-ups found</h3>
        <p className="text-gray-600 mb-6">No follow-ups match your current filters. Try adjusting your search or filters.</p>
        <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <RefreshCw size={18} className="mr-2" />
            Reset Filters
        </button>
    </div>
);

export default FollowUps;