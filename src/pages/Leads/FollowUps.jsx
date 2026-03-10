import React, { useState } from "react";
import { Phone, MessageCircle, ChevronDown, ChevronUp, Calendar, User, Clock, Filter, Search, MoreVertical } from "lucide-react";
import { useGetFollowUpsQuery } from "../../redux/api";

function FollowUps() {
    const { data, isLoading } = useGetFollowUpsQuery();
    const followups = data || [];
    const [expandedLead, setExpandedLead] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    // Get next follow-up
    const getNextFollowUp = (history) => {
        const today = new Date();
        const upcoming = history
            .filter(h => new Date(h.followUpDate) >= today)
            .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));
        return upcoming[0] || history[0];
    };

    // Get status color
    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'completed': 'bg-green-100 text-green-700 border-green-200',
            'cancelled': 'bg-red-100 text-red-700 border-red-200',
            'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    // Get follow-up type icon
    const getTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'call': return <Phone size={14} className="text-blue-500" />;
            case 'meeting': return <User size={14} className="text-purple-500" />;
            default: return <Calendar size={14} className="text-gray-500" />;
        }
    };

    // Filter followups
    const filteredFollowups = followups.filter(item => {
        const matchesSearch = item.lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.lead.phone.includes(searchTerm);
        const matchesStatus = filterStatus === "all" ||
            item.history.some(h => h.status?.toLowerCase() === filterStatus.toLowerCase());
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading follow-ups...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Follow-ups</h1>
                            <p className="text-gray-600 mt-1">Manage and track all your follow-up activities</p>
                        </div>

                        {/* Stats Cards */}
                        <div className="flex gap-3">
                            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
                                <p className="text-sm text-gray-500">Total</p>
                                <p className="text-xl font-semibold text-gray-800">{followups.length}</p>
                            </div>
                            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
                                <p className="text-sm text-gray-500">Pending</p>
                                <p className="text-xl font-semibold text-yellow-600">
                                    {followups.filter(f => getNextFollowUp(f.history)?.status === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="in-progress">In Progress</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lead</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Next Follow-up</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredFollowups.map((item, index) => {
                                    const next = getNextFollowUp(item.history);
                                    const isExpanded = expandedLead === item.lead._id;

                                    return (
                                        <React.Fragment key={item.lead._id}>
                                            <tr className={`hover:bg-gray-50 transition-all duration-200 ${isExpanded ? 'bg-blue-50' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        {/* <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                                                            {item.lead.name.charAt(0).toUpperCase()}
                                                        </div> */}
                                                        <div className="ml-3">
                                                            <p className="text-sm font-medium text-gray-900">{item.lead.name}</p>
                                                            <p className="text-xs text-gray-500">ID: {item.lead._id.slice(-6)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600 font-mono">{item.lead.phone}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {next && (
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={16} className="text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {new Date(next.followUpDate).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <User size={16} className="text-gray-400" />
                                                        <span className="text-sm text-gray-600">
                                                            {next?.assignedTo?.name || 'Unassigned'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(next?.status)}`}>
                                                        {next?.status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <a
                                                            href={`tel:${item.lead.phone}`}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Call"
                                                        >
                                                            <Phone size={18} />
                                                        </a>
                                                        <a
                                                            href={`https://wa.me/91${item.lead.phone}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="WhatsApp"
                                                        >
                                                            <MessageCircle size={18} />
                                                        </a>
                                                        <button
                                                            onClick={() => setExpandedLead(isExpanded ? null : item.lead._id)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                                                        >
                                                            {isExpanded ? (
                                                                <>
                                                                    <ChevronUp size={18} />
                                                                    <span className="text-xs">Hide</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ChevronDown size={18} />
                                                                    <span className="text-xs">View</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* History Section */}
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-4 bg-gray-50">
                                                        <div className="space-y-3">
                                                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                                <Clock size={16} />
                                                                Follow-up History
                                                            </h3>
                                                            <div className="space-y-2">
                                                                {item.history.map((h, idx) => (
                                                                    <div
                                                                        key={h.id || idx}
                                                                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                                                    >
                                                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="flex items-center gap-2">
                                                                                    {getTypeIcon(h.type)}
                                                                                    <span className="text-sm font-medium text-gray-700">
                                                                                        {new Date(h.followUpDate).toLocaleDateString('en-US', {
                                                                                            weekday: 'short',
                                                                                            month: 'short',
                                                                                            day: 'numeric',
                                                                                            year: 'numeric'
                                                                                        })}
                                                                                    </span>
                                                                                </div>
                                                                                <span className="text-xs text-gray-400">•</span>
                                                                                <span className="text-xs text-gray-500 capitalize">
                                                                                    {h.type}
                                                                                </span>
                                                                            </div>

                                                                            <div className="flex items-center gap-4">
                                                                                <div className="flex items-center gap-2">
                                                                                    <User size={14} className="text-gray-400" />
                                                                                    <span className="text-sm text-gray-600">
                                                                                        {h.assignedTo?.name || 'Unassigned'}
                                                                                    </span>
                                                                                </div>
                                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(h.status)}`}>
                                                                                    {h.status}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
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

                    {/* Empty State */}
                    {filteredFollowups.length === 0 && (
                        <div className="text-center py-12">
                            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                                <Calendar size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No follow-ups found</h3>
                            <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-4 text-sm text-gray-500 text-center">
                    Showing {filteredFollowups.length} of {followups.length} follow-ups
                </div>
            </div>
        </div>
    );
}

export default FollowUps;