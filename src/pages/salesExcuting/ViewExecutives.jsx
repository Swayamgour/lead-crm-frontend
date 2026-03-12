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
    Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDeleteUserMutation, useGetCustomersQuery, useGetLeadReportQuery, useGetSalesReportQuery, useGetUsersQuery, useUpdateUserMutation } from "../../redux/api";

function ViewExecutives() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedExecutives, setSelectedExecutives] = useState([]);
    // const [viewMode, setViewMode] = useState("table");
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const itemsPerPage = 8;

    const { data } = useGetUsersQuery()
    const [updateExecutive] = useUpdateUserMutation()
    const [deleteUser] = useDeleteUserMutation()

    const { data: customer } = useGetCustomersQuery()

    const { data: sales } = useGetSalesReportQuery()
    const { data: lead } = useGetLeadReportQuery()




    const executives = data || []

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getRandomColor = (name) => {
        const colors = [
            'bg-gradient-to-br from-blue-500 to-blue-600',
            'bg-gradient-to-br from-purple-500 to-purple-600',
            'bg-gradient-to-br from-green-500 to-green-600',
            'bg-gradient-to-br from-orange-500 to-orange-600',
            'bg-gradient-to-br from-pink-500 to-pink-600',
            'bg-gradient-to-br from-indigo-500 to-indigo-600'
        ];
        const index = name?.length % colors.length;
        return colors[index];
    };

    const filteredExecutives = executives?.filter(exec => {
        const matchesSearch = exec.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exec.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exec.phone?.includes(searchTerm);
        const matchesStatus = filterStatus === "all" ||
            (filterStatus === "active" ? exec.isActive === true : exec.isActive === false);
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredExecutives.length / itemsPerPage);
    const paginatedExecutives = filteredExecutives.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const stats = {
        total: executives.length,
        active: executives.filter(e => e.isActive === true).length,
        totalLeads: executives.reduce((sum, e) => sum + (e.leadsAssigned || 0), 0),
        totalWon: executives.reduce((sum, e) => sum + (e.leadsWon || 0), 0),
        conversionRate: executives.length ?
            Math.round((executives.reduce((sum, e) => sum + (e.leadsWon || 0), 0) /
                executives.reduce((sum, e) => sum + (e.leadsAssigned || 0), 1)) * 100) : 0
    };

    const toggleSelectExecutive = (id) => {
        setSelectedExecutives(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleStatusToggle = async (exec) => {
        await updateExecutive({
            id: exec._id,
            isActive: !exec.isActive
        });
    };

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-800">{value}</p>
                    {trend && (
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            <TrendingUp size={12} />
                            {trend} from last month
                        </p>
                    )}
                </div>
                <div className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="text-white" size={24} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r  ">
                <div className="max-w-7xl mx-auto px-4 py-8 md:px-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                                <Users size={32} />
                                Sales Executives
                            </h1>
                            <p className="mt-2">
                                Manage and monitor your sales team performance
                            </p>
                        </div>

                        <div className="flex items-center gap-3">

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
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 -mt-6 mb-8">
                    <StatCard
                        title="Total Executives"
                        value={stats.total}
                        icon={Users}
                        color="bg-gradient-to-br from-blue-500 to-blue-600"
                        trend="+12%"
                    />
                    <StatCard
                        title="Active Now"
                        value={stats.active}
                        icon={CheckCircle}
                        color="bg-gradient-to-br from-green-500 to-green-600"
                        trend="+8%"
                    />
                    <StatCard
                        title="Total Leads"
                        value={stats.totalLeads}
                        icon={BarChart3}
                        color="bg-gradient-to-br from-purple-500 to-purple-600"
                        trend="+23%"
                    />
                    <StatCard
                        title="Conversion Rate"
                        value={`${stats.conversionRate}%`}
                        icon={Award}
                        color="bg-gradient-to-br from-orange-500 to-orange-600"
                        trend="+5%"
                    />
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

                        <div className="flex gap-3">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <Filter size={20} />
                                Filters
                                <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>

                            <button className="p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                                <RefreshCw size={20} className="text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option>Sort by: Name</option>
                                    <option>Sort by: Performance</option>
                                    <option>Sort by: Joining Date</option>
                                    <option>Sort by: Leads</option>
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

                {/* Main Content - Table/Grid View */}

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
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedExecutives.map((exec, index) => (
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
                                                {/* <div className={`w-12 h-12 ${getRandomColor(exec.name)} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md transform group-hover:scale-110 transition-transform`}>
                                                        {getInitials(exec.name)}
                                                    </div> */}
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
                                                {/* <button
                                                        onClick={() => navigate(`/executive/${exec._id}`)}
                                                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
                                                    </button> */}
                                                {/* <button
                                                    onClick={() => navigate(`/editExecutive/${exec._id}`)}
                                                    className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
                                                    title="Edit"
                                                >
                                                    <Edit3 size={18} className="text-green-600 group-hover:scale-110 transition-transform" />
                                                </button> */}
                                                <button
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                                                    title="Delete"
                                                    onClick={() => deleteUser(exec?._id)}
                                                >
                                                    <Trash2 size={18} className="text-red-600 group-hover:scale-110 transition-transform" />
                                                </button>
                                                {/* <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                        <MoreVertical size={18} className="text-gray-500" />
                                                    </button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredExecutives.length)} of {filteredExecutives.length} results
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


                {/* Empty State */}
                {filteredExecutives.length === 0 && (
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