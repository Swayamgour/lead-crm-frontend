import React, { useState, useMemo } from "react";
import {
    Users,
    Search,
    TrendingUp,
    RefreshCw,
    Filter,
    ChevronDown,
    ChevronUp,
    Phone,
    Mail,
    Calendar,
    DollarSign,
    Tag,
    Star,
    Award,
    Target,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
    ArrowRight,
    Zap
} from "lucide-react";
import { useGetLeadsQuery } from "../../redux/api";
import Loading from "../../components/Loading";
import { format } from "date-fns";
import DateQuickFilter, { isWithinRange } from "../../components/DateQuickFilter";

// Pipeline stages with colors
const PIPELINE_STAGES = [
    { id: "Open", label: "Open", color: "from-blue-500 to-blue-600", icon: <Star size={16} />, bgColor: "bg-blue-50" },
    { id: "In Progress", label: "In Progress", color: "from-purple-500 to-purple-600", icon: <TrendingUp size={16} />, bgColor: "bg-purple-50" },
    { id: "Follow Up", label: "Follow Up", color: "from-orange-500 to-orange-600", icon: <Clock size={16} />, bgColor: "bg-orange-50" },
    { id: "Won", label: "Won", color: "from-emerald-500 to-emerald-600", icon: <Award size={16} />, bgColor: "bg-emerald-50" },
    { id: "Lost", label: "Lost", color: "from-red-500 to-red-600", icon: <XCircle size={16} />, bgColor: "bg-red-50" }
];

function LeadPipeline() {
    const { data: leadsData, isLoading, error, refetch } = useGetLeadsQuery();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [expandedLead, setExpandedLead] = useState(null);
    const [dateFilter, setDateFilter] = useState({ preset: "all", startDate: "", endDate: "" });


    // Map backend → UI stages
    const pipelineData = useMemo(() => {
        if (!leadsData) return {};

        const grouped = {
            Open: [],
            "In Progress": [],
            "Follow Up": [],
            Won: [],
            Lost: []
        };

        leadsData.forEach((lead) => {
            const status = lead.status?.toLowerCase();

            if (status === "won") {
                grouped["Won"].push(lead);

            } else if (status === "lost") {
                grouped["Lost"].push(lead);

            } else if (["cold", "no response"].includes(status)) {
                grouped["Follow Up"].push(lead);

            } else if (["interested", "ongoing"].includes(status)) {
                grouped["In Progress"].push(lead);

            } else if (status === "incoming") {
                grouped["Open"].push(lead);

            } else {
                grouped["Open"].push(lead); // fallback
            }
        });

        return grouped;
    }, [leadsData]);

    // Filter logic
    const filteredPipeline = useMemo(() => {
        const filtered = {};

        Object.entries(pipelineData).forEach(([stage, leads]) => {
            filtered[stage] = leads.filter((lead) => {
                const matchesSearch =
                    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    lead.phone?.includes(searchTerm) ||
                    lead.email?.toLowerCase().includes(searchTerm.toLowerCase());

                const matchesStatus =
                    filterStatus === "all" || lead.status === filterStatus;

                const matchesDate =
                    dateFilter.preset === "all" ||
                    isWithinRange(lead.createdAt, dateFilter.startDate, dateFilter.endDate);

                return matchesSearch && matchesStatus && matchesDate;
            });
        });

        return filtered;
    }, [pipelineData, searchTerm, filterStatus, dateFilter]);

    const totalLeads = leadsData?.length || 0;
    const wonLeads = pipelineData.Won?.length || 0;
    const lostLeads = pipelineData.Lost?.length || 0;
    const openLeads = pipelineData.Open?.length || 0;
    const inProgressLeads = pipelineData["In Progress"]?.length || 0;

    const formatCurrency = (value) => {
        if (!value) return null;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const getStatusColor = (status) => {
        const colors = {
            'incoming': 'bg-blue-100 text-blue-800',
            'contacted': 'bg-yellow-100 text-yellow-800',
            'follow-up': 'bg-purple-100 text-purple-800',
            'qualified': 'bg-green-100 text-green-800',
            'proposal': 'bg-indigo-100 text-indigo-800',
            'negotiation': 'bg-orange-100 text-orange-800',
            'closed-won': 'bg-emerald-100 text-emerald-800',
            'closed-lost': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (isLoading) {
        return <Loading data={'Lead Pipeline'} />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="text-center bg-white rounded-2xl p-8 shadow-lg">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h3>
                    <p className="text-gray-500 mb-4">Failed to load pipeline data</p>
                    <button
                        onClick={refetch}
                        className="px-6 py-2 bg-gradient-to-r from-[#2653ef] to-[#1d40c9] text-white rounded-2xl hover:shadow-lg transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <TrendingUp size={20} className="text-white" />
                                </div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Lead Pipeline
                                </h1>
                            </div>
                            <p className="text-gray-500 mt-1 text-sm">
                                Track and manage your sales pipeline visually
                            </p>
                        </div>

                        <button
                            onClick={refetch}
                            className="p-2.5 bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] border border-gray-100 hover:shadow-md transition-all group"
                        >
                            <RefreshCw size={18} className="text-gray-600 group-hover:rotate-180 transition-transform duration-300" />
                        </button>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                        <StatCard
                            title="Total Leads"
                            value={totalLeads}
                            icon={<Users size={20} />}
                            bgColor="bg-blue-50"
                            textColor="text-blue-600"
                            gradient="from-blue-500 to-blue-600"
                        />
                        <StatCard
                            title="Open"
                            value={openLeads}
                            icon={<Star size={20} />}
                            bgColor="bg-blue-50"
                            textColor="text-blue-600"
                            gradient="from-blue-500 to-blue-600"
                        />
                        <StatCard
                            title="In Progress"
                            value={inProgressLeads}
                            icon={<TrendingUp size={20} />}
                            bgColor="bg-purple-50"
                            textColor="text-purple-600"
                            gradient="from-purple-500 to-purple-600"
                        />
                        <StatCard
                            title="Won"
                            value={wonLeads}
                            icon={<Award size={20} />}
                            bgColor="bg-emerald-50"
                            textColor="text-emerald-600"
                            gradient="from-emerald-500 to-emerald-600"
                        />
                        <StatCard
                            title="Lost"
                            value={lostLeads}
                            icon={<XCircle size={20} />}
                            bgColor="bg-red-50"
                            textColor="text-red-600"
                            gradient="from-red-500 to-red-600"
                        />
                    </div>

                    {/* Filters Section */}
                    <div className="mt-6 bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] border border-gray-100 p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search leads by name, phone or email..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-[#2653ef] focus:border-[#2653ef] transition-all bg-gray-50 hover:bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="relative min-w-[180px]">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-100 appearance-none bg-gray-50 hover:bg-white focus:ring-2 focus:ring-[#2653ef] focus:border-[#2653ef] transition-all cursor-pointer"
                                >
                                    <option value="all">All Status</option>
                                    <option value="incoming">Incoming</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="follow-up">Follow Up</option>
                                    <option value="qualified">Qualified</option>
                                    <option value="proposal">Proposal</option>
                                    <option value="negotiation">Negotiation</option>
                                    <option value="closed-won">Won</option>
                                    <option value="closed-lost">Lost</option>
                                </select>
                            </div>

                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <label className="text-xs font-medium text-gray-500 mb-2 block">Date Added</label>
                            <DateQuickFilter value={dateFilter} onChange={setDateFilter} compact />
                        </div>
                    </div>
                </div>

                {/* Pipeline Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                    {PIPELINE_STAGES.map((stage) => {
                        const leads = filteredPipeline[stage.id] || [];
                        // const isExpanded = expandedLead === stage.id;

                        return (
                            <div key={stage.id} className="flex flex-col">
                                {/* Stage Header */}
                                <div className={`bg-gradient-to-r ${stage.color} rounded-2xl px-2 py-2 mb-3 shadow-lg`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="text-white">{stage.icon}</div>
                                            <h3 className="font-bold text-white text-xs">{stage.label}</h3>
                                        </div>
                                        {/* <div className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full"> */}
                                            <span className="text-white font-bold text-[10px]">{leads.length}</span>
                                        {/* </div> */}
                                    </div>
                                </div>

                                {/* Leads List */}
                                <div className="flex-1 space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto pr-1">
                                    {leads.length === 0 ? (
                                        <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)]">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <Target size={20} className="text-gray-400" />
                                            </div>
                                            <p className="text-xs text-gray-400">No leads in {stage.label}</p>
                                        </div>
                                    ) : (
                                        leads.map((lead, index) => (
                                            <LeadCard
                                                key={lead._id}
                                                lead={lead}
                                                index={index}
                                                getStatusColor={getStatusColor}
                                                formatCurrency={formatCurrency}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/* ======================
   STAT CARD COMPONENT
====================== */
const StatCard = ({ title, value, icon, bgColor, textColor, gradient }) => (
    <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] p-5 hover:shadow-lg transition-all duration-300 border border-gray-100 group">
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`w-12 h-12 ${bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <div className={textColor}>{icon}</div>
            </div>
        </div>
    </div>
);

/* ======================
   LEAD CARD COMPONENT
====================== */
const LeadCard = ({ lead, index, getStatusColor, formatCurrency }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] hover:shadow-md transition-all duration-300 animate-fadeIn"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="p-3">
                {/* Lead Name & Expand Button */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">
                            {lead.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <Phone size={10} className="text-gray-400" />
                            {lead.phone}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </div>

                {/* Lead Details */}
                <div className="space-y-1.5 text-xs">
                    {lead.source && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                            <Tag size={10} className="text-gray-400" />
                            <span>{lead.source}</span>
                        </div>
                    )}

                    {lead.expectedValue && (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                            <DollarSign size={10} />
                            <span>{formatCurrency(lead.expectedValue)}</span>
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5 mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-xl text-[10px] font-medium ${getStatusColor(lead.status)}`}>
                            {lead.status?.replace('-', ' ') || 'New'}
                        </span>
                    </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                    <div className="mt-3 pt-2 border-t border-gray-100 animate-slideDown">
                        {lead.email && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-1.5">
                                <Mail size={10} className="text-gray-400" />
                                <span className="truncate">{lead.email}</span>
                            </div>
                        )}
                        {lead.followUpDate && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                <Calendar size={10} className="text-gray-400" />
                                <span>Follow up: {format(new Date(lead.followUpDate), 'dd MMM yyyy')}</span>
                            </div>
                        )}
                        {lead.product && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 mt-1.5">
                                <Tag size={10} className="text-gray-400" />
                                <span>{lead.product}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeadPipeline;