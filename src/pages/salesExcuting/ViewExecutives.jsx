import React, { useState } from "react";
import {
    Phone,
    Mail,
    Eye,
    Edit3,
    Trash2,
    Plus,
    Search,
    Filter,
    Download,
    Upload,
    RefreshCw,
    ChevronDown,
    X,
    Users,
    Star,
    TrendingUp,
    Award,
    Calendar,
    Clock,
    MoreVertical,
    UserPlus,
    MessageCircle,
    BarChart3,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Grid,
    List,
    DownloadCloud,
    Settings,
    Target,
    DollarSign,
    Activity,
    PieChart,
    TrendingDown,
    Crown,
    Medal,
    Sparkles,
    Zap,
    AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDeleteUserMutation, useGetUsersQuery, useUpdateUserMutation } from "../../redux/api";

function ViewExecutives() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedExecutives, setSelectedExecutives] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [selectedExecutive, setSelectedExecutive] = useState(null);
    const [showPerformanceModal, setShowPerformanceModal] = useState(false);

    const itemsPerPage = 8;

    const { data: usersData, isLoading, refetch } = useGetUsersQuery();
    const [updateExecutive] = useUpdateUserMutation();
    const [deleteUser] = useDeleteUserMutation();

    // Process executives data with performance metrics
    const executives = usersData?.map(exec => ({
        ...exec,
        totalLeads: exec.totalLeads || 0,
        wonLeads: exec.wonLeads || 0,
        accuracy: exec.accuracy || 0,
        pendingLeads: (exec.totalLeads || 0) - (exec.wonLeads || 0)
    })) || [];

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    };

    const getRandomColor = (name) => {
        const colors = [
            'from-blue-500 to-blue-600',
            'from-purple-500 to-purple-600',
            'from-green-500 to-green-600',
            'from-orange-500 to-orange-600',
            'from-pink-500 to-pink-600',
            'from-indigo-500 to-indigo-600',
            'from-red-500 to-red-600',
            'from-teal-500 to-teal-600'
        ];
        const index = (name?.length || 0) % colors.length;
        return colors[index];
    };

    const getPerformanceColor = (accuracy) => {
        if (accuracy >= 80) return 'text-green-600 bg-green-100';
        if (accuracy >= 50) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getPerformanceBadge = (accuracy) => {
        if (accuracy >= 80) return { icon: Crown, text: 'Top Performer', color: 'text-yellow-600' };
        if (accuracy >= 50) return { icon: TrendingUp, text: 'Rising Star', color: 'text-blue-600' };
        return { icon: Target, text: 'Needs Focus', color: 'text-orange-600' };
    };

    // Filter executives
    const filteredExecutives = executives?.filter(exec => {
        const matchesSearch = exec.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exec.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exec.phone?.includes(searchTerm);
        const matchesStatus = filterStatus === "all" ||
            (filterStatus === "active" ? exec.isActive === true : exec.isActive === false);
        return matchesSearch && matchesStatus;
    });

    // Sort executives
    const sortedExecutives = [...filteredExecutives].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case 'name':
                comparison = a.name?.localeCompare(b.name || '');
                break;
            case 'leads':
                comparison = (a.totalLeads || 0) - (b.totalLeads || 0);
                break;
            case 'accuracy':
                comparison = (a.accuracy || 0) - (b.accuracy || 0);
                break;
            case 'won':
                comparison = (a.wonLeads || 0) - (b.wonLeads || 0);
                break;
            default:
                comparison = 0;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Pagination
    const totalPages = Math.ceil(sortedExecutives.length / itemsPerPage);
    const paginatedExecutives = sortedExecutives.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Calculate stats
    const stats = {
        total: executives.length,
        active: executives.filter(e => e.isActive === true).length,
        totalLeads: executives.reduce((sum, e) => sum + (e.totalLeads || 0), 0),
        totalWon: executives.reduce((sum, e) => sum + (e.wonLeads || 0), 0),
        avgAccuracy: executives.length ?
            Math.round(executives.reduce((sum, e) => sum + (e.accuracy || 0), 0) / executives.length) : 0,
        topPerformer: executives.length ?
            executives.reduce((max, e) => (e.accuracy || 0) > (max.accuracy || 0) ? e : max, executives[0]) : null,
        conversionRate: executives.reduce((sum, e) => sum + (e.totalLeads || 0), 0) ?
            Math.round((executives.reduce((sum, e) => sum + (e.wonLeads || 0), 0) /
                executives.reduce((sum, e) => sum + (e.totalLeads || 0), 0)) * 100) : 0
    };

    const toggleSelectExecutive = (id) => {
        setSelectedExecutives(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleStatusToggle = async (exec) => {
        try {
            await updateExecutive({
                id: exec._id,
                isActive: !exec.isActive
            });
            refetch();
        } catch (error) {
            console.error("Error toggling status:", error);
        }
    };

    const viewPerformance = (exec) => {
        setSelectedExecutive(exec);
        setShowPerformanceModal(true);
    };

    const StatCard = ({ title, value, icon: Icon, color, trend, subtext }) => (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                    {trend && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            <TrendingUp size={12} />
                            {trend}
                        </p>
                    )}
                    {subtext && (
                        <p className="text-xs text-gray-500 mt-2">{subtext}</p>
                    )}
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="text-white" size={24} />
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading executives...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                                <Users size={32} />
                                Sales Executives
                                {stats.topPerformer && (
                                    <span className="text-sm bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full flex items-center gap-1">
                                        <Crown size={14} />
                                        Top: {stats.topPerformer.name}
                                    </span>
                                )}
                            </h1>
                            <p className="mt-2 text-blue-100">
                                Manage and monitor your sales team performance
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => refetch()}
                                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-all"
                            >
                                <RefreshCw size={18} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                            <button
                                onClick={() => navigate("/addExecutive")}
                                className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <Plus size={18} />
                                <span className="font-medium">Add Executive</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
                {/* Stats Cards with Real Data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-6 mb-8">
                    <StatCard
                        title="Total Executives"
                        value={stats.total}
                        icon={Users}
                        color="from-blue-500 to-blue-600"
                        trend={`${stats.active} active now`}
                    />
                    <StatCard
                        title="Total Leads"
                        value={stats.totalLeads}
                        icon={Target}
                        color="from-purple-500 to-purple-600"
                        subtext={`${stats.totalWon} converted`}
                    />
                    <StatCard
                        title="Conversion Rate"
                        value={`${stats.conversionRate}%`}
                        icon={TrendingUp}
                        color="from-green-500 to-green-600"
                        trend={`Avg. accuracy ${stats.avgAccuracy}%`}
                    />
                    <StatCard
                        title="Team Performance"
                        value={`${stats.avgAccuracy}%`}
                        icon={Award}
                        color="from-orange-500 to-orange-600"
                        subtext={`${executives.filter(e => e.accuracy >= 80).length} top performers`}
                    />
                </div>

                {/* Performance Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Top Performer Card */}
                    {stats.topPerformer && (
                        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-200 shadow-lg">
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 bg-gradient-to-br ${getRandomColor(stats.topPerformer.name)} rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                                    {getInitials(stats.topPerformer.name)}
                                </div>
                                <div>
                                    <p className="text-xs text-yellow-600 mb-1 flex items-center gap-1">
                                        <Crown size={14} />
                                        Top Performer
                                    </p>
                                    <h3 className="font-bold text-gray-800">{stats.topPerformer.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {stats.topPerformer.wonLeads}/{stats.topPerformer.totalLeads} leads • {stats.topPerformer.accuracy}% accuracy
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Accuracy Distribution */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Performance Distribution</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-green-600">High (80%+)</span>
                                    <span className="font-medium">{executives.filter(e => e.accuracy >= 80).length}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full"
                                        style={{ width: `${(executives.filter(e => e.accuracy >= 80).length / stats.total) * 100}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-yellow-600">Medium (50-79%)</span>
                                    <span className="font-medium">{executives.filter(e => e.accuracy >= 50 && e.accuracy < 80).length}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-500 rounded-full"
                                        style={{ width: `${(executives.filter(e => e.accuracy >= 50 && e.accuracy < 80).length / stats.total) * 100}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-red-600">Low (below 50%)</span>
                                    <span className="font-medium">{executives.filter(e => e.accuracy < 50).length}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 rounded-full"
                                        style={{ width: `${(executives.filter(e => e.accuracy < 50).length / stats.total) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Insights</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Total Won Leads</span>
                                <span className="font-bold text-green-600">{stats.totalWon}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Pending Leads</span>
                                <span className="font-bold text-yellow-600">{stats.totalLeads - stats.totalWon}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Avg Accuracy</span>
                                <span className="font-bold text-blue-600">{stats.avgAccuracy}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Inactive</span>
                                <span className="font-bold text-gray-600">{stats.total - stats.active}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, email or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                            >
                                <option value="name">Sort by: Name</option>
                                <option value="leads">Sort by: Total Leads</option>
                                <option value="won">Sort by: Won Leads</option>
                                <option value="accuracy">Sort by: Accuracy</option>
                            </select>

                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
                            >
                                {sortOrder === 'asc' ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                                <span className="hidden sm:inline">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                            </button>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-3 border rounded-xl transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                    }`}
                            >
                                <Filter size={18} />
                                <span className="hidden sm:inline">Filters</span>
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>Min Accuracy: Any</option>
                                    <option>Min Accuracy: 80%+</option>
                                    <option>Min Accuracy: 50%+</option>
                                    <option>Min Accuracy: Below 50%</option>
                                </select>
                                <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>Min Leads: Any</option>
                                    <option>Min Leads: 5+</option>
                                    <option>Min Leads: 10+</option>
                                    <option>Min Leads: 20+</option>
                                </select>
                                <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>Team: All Teams</option>
                                    <option>Team A</option>
                                    <option>Team B</option>
                                    <option>Team C</option>
                                </select>
                                <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>Location: All</option>
                                    <option>North</option>
                                    <option>South</option>
                                    <option>East</option>
                                    <option>West</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bulk Actions */}
                {selectedExecutives.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200 animate-slideDown">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle size={18} className="text-blue-600" />
                                </div>
                                <span className="text-blue-700 font-medium">
                                    {selectedExecutives.length} executive(s) selected
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                                    Bulk Action
                                </button>
                                <button
                                    onClick={() => setSelectedExecutives([])}
                                    className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content - Table with Performance Data */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    {/* <th className="px-6 py-4 text-left">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            checked={selectedExecutives.length === paginatedExecutives.length && paginatedExecutives.length > 0}
                                            onChange={() => {
                                                if (selectedExecutives.length === paginatedExecutives.length) {
                                                    setSelectedExecutives([]);
                                                } else {
                                                    setSelectedExecutives(paginatedExecutives.map(e => e._id));
                                                }
                                            }}
                                        />
                                    </th> */}
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Executive
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Performance
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedExecutives.map((exec, index) => {
                                    const PerformanceIcon = getPerformanceBadge(exec.accuracy).icon;
                                    return (
                                        <tr
                                            key={exec._id || index}
                                            className="hover:bg-gray-50 transition-colors group"
                                        >
                                            {/* <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    checked={selectedExecutives.includes(exec._id)}
                                                    onChange={() => toggleSelectExecutive(exec._id)}
                                                />
                                            </td> */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 bg-gradient-to-br ${getRandomColor(exec.name)} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md transform group-hover:scale-110 transition-transform`}>
                                                        {getInitials(exec.name)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{exec.name}</p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                            <Calendar size={12} />
                                                            Joined {new Date(exec.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone size={14} className="text-gray-400" />
                                                        <span>{exec.phone}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail size={14} className="text-gray-400" />
                                                        <span className="truncate max-w-[200px]">{exec.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-3">
                                                    {/* Performance Badge */}
                                                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(exec.accuracy)}`}>
                                                        <PerformanceIcon size={12} />
                                                        {getPerformanceBadge(exec.accuracy).text}
                                                    </div>

                                                    {/* Stats */}
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-center">
                                                            <p className="text-xs text-gray-500">Total</p>
                                                            <p className="font-bold text-gray-800">{exec.totalLeads}</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs text-gray-500">Won</p>
                                                            <p className="font-bold text-green-600">{exec.wonLeads}</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs text-gray-500">Accuracy</p>
                                                            <p className={`font-bold ${exec.accuracy >= 80 ? 'text-green-600' : exec.accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                                {exec.accuracy}%
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${exec.accuracy >= 80 ? 'bg-green-500' :
                                                                    exec.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${exec.accuracy}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-start gap-3">
                                                    <button
                                                        onClick={() => handleStatusToggle(exec)}
                                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                                                                ${exec.isActive ? "bg-green-500" : "bg-gray-300"}`}
                                                    >
                                                        <span
                                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow
                                                                    ${exec.isActive ? "translate-x-6" : "translate-x-1"}`}
                                                        />
                                                    </button>
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${exec.isActive
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-700"
                                                        }`}>
                                                        {exec.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => viewPerformance(exec)}
                                                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                                                        title="View Performance"
                                                    >
                                                        <Eye size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/editExecutive/${exec._id}`)}
                                                        className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
                                                        title="Edit"
                                                    >
                                                        <Edit3 size={18} className="text-green-600 group-hover:scale-110 transition-transform" />
                                                    </button>
                                                    <button
                                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                                                        title="Delete"
                                                        onClick={() => {
                                                            if (window.confirm('Are you sure you want to delete this executive?')) {
                                                                deleteUser(exec?._id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 size={18} className="text-red-600 group-hover:scale-110 transition-transform" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedExecutives.length)} of {sortedExecutives.length} results
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-10 h-10 rounded-lg transition-colors ${currentPage === i + 1
                                            ? "bg-blue-600 text-white"
                                            : "hover:bg-gray-100"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Performance Modal */}
                {showPerformanceModal && selectedExecutive && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPerformanceModal(false)}>
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-16 h-16 bg-gradient-to-br ${getRandomColor(selectedExecutive.name)} rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                                            {getInitials(selectedExecutive.name)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{selectedExecutive.name}</h3>
                                            <p className="text-blue-100 text-sm">{selectedExecutive.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowPerformanceModal(false)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <X size={20} className="text-white" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Performance Metrics */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                                        <p className="text-xs text-blue-600 mb-1">Total Leads</p>
                                        <p className="text-2xl font-bold text-gray-800">{selectedExecutive.totalLeads}</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-xl text-center">
                                        <p className="text-xs text-green-600 mb-1">Won Leads</p>
                                        <p className="text-2xl font-bold text-gray-800">{selectedExecutive.wonLeads}</p>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-xl text-center">
                                        <p className="text-xs text-purple-600 mb-1">Accuracy</p>
                                        <p className="text-2xl font-bold text-gray-800">{selectedExecutive.accuracy}%</p>
                                    </div>
                                </div>

                                {/* Progress Chart */}
                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <h4 className="font-semibold text-gray-800 mb-4">Performance Overview</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Conversion Rate</span>
                                                <span className="font-medium">
                                                    {selectedExecutive.totalLeads ?
                                                        Math.round((selectedExecutive.wonLeads / selectedExecutive.totalLeads) * 100) : 0}%
                                                </span>
                                            </div>
                                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                                                    style={{ width: `${selectedExecutive.totalLeads ? (selectedExecutive.wonLeads / selectedExecutive.totalLeads) * 100 : 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-600">Pending Leads</span>
                                                <span className="font-medium">{selectedExecutive.pendingLeads}</span>
                                            </div>
                                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full"
                                                    style={{ width: `${selectedExecutive.totalLeads ? (selectedExecutive.pendingLeads / selectedExecutive.totalLeads) * 100 : 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Insights */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-800">Performance Insights</h4>
                                    {selectedExecutive.accuracy >= 80 ? (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <Crown size={20} className="text-yellow-600 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium text-green-800">Top Performer!</p>
                                                    <p className="text-sm text-green-700 mt-1">
                                                        Excellent performance with {selectedExecutive.accuracy}% accuracy.
                                                        Keep up the great work!
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : selectedExecutive.accuracy >= 50 ? (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <TrendingUp size={20} className="text-blue-600 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium text-blue-800">Good Progress</p>
                                                    <p className="text-sm text-blue-700 mt-1">
                                                        You're on the right track. Focus on converting more leads to reach top performer status.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <Target size={20} className="text-orange-600 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium text-orange-800">Needs Improvement</p>
                                                    <p className="text-sm text-orange-700 mt-1">
                                                        Consider additional training and support to improve conversion rates.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 bg-gray-50">
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowPerformanceModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                                    >
                                        Close
                                    </button>
                                    {/* <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                                        View Detailed Report
                                    </button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {sortedExecutives.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users size={40} className="text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No executives found</h3>
                        <p className="text-gray-500 mb-6">Try adjusting your search or add a new executive</p>
                        <button
                            onClick={() => navigate("/addExecutive")}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <Plus size={18} />
                            Add Executive
                        </button>
                    </div>
                )}
            </div>

            {/* Add custom animations */}
            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out;
                }
            `}</style>
        </div>
    );
}

export default ViewExecutives;