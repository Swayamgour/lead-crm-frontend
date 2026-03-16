import { useState } from "react";
import {
    User,
    Phone,
    Mail,
    Tag,
    Users,
    Clock,
    MessageCircle,
    FileText,
    Plus,
    Filter,
    Calendar,
    ChevronDown,
    X,
    Edit2,
    Trash2,
    History,
    Check,
    AlertCircle

} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    useGetLeadsQuery,
    useUpdateLeadMutation,
    useGetUsersQuery,
    useGetProfileQuery,
    useAddRemarkMutation,
    useEditRemarkMutation,
    useDeleteRemarkMutation,
    useGetLeadRemarksQuery
} from "../../redux/api";
import toast from "react-hot-toast";
import { leadStatus } from "../../components/data";

function LeadView() {
    const { data: leadsData } = useGetLeadsQuery();
    const { data: Executive } = useGetUsersQuery();
    const { data: profile } = useGetProfileQuery();
    const [updateLead] = useUpdateLeadMutation();

    // New remark mutations
    const [addRemark] = useAddRemarkMutation();
    const [editRemark] = useEditRemarkMutation();
    const [deleteRemark] = useDeleteRemarkMutation();

    const leads = leadsData || [];
    const executives = Executive || [];

    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLead, setSelectedLead] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Modal states
    const [viewLead, setViewLead] = useState(null);
    const [showAddRemark, setShowAddRemark] = useState(false);
    const [newRemark, setNewRemark] = useState("");
    const [editingRemark, setEditingRemark] = useState(null);
    const [editRemarkText, setEditRemarkText] = useState("");
    const [modalSaving, setModalSaving] = useState(false);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [selectedExecutive, setSelectedExecutive] = useState("");
    const [activeTab, setActiveTab] = useState("remarks"); // 'remarks' or 'history'
    const [selectedRemarkForHistory, setSelectedRemarkForHistory] = useState(null);

    // Fetch remarks for selected lead
    const { data: remarksData, refetch: refetchRemarks } = useGetLeadRemarksQuery(viewLead?._id, {
        skip: !viewLead?._id
    });

    const filteredLeads = leads.filter((lead) => {
        const leadDate = new Date(lead.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        const statusMatch = statusFilter ? lead.status === statusFilter : true;
        const dateMatch = (!start || leadDate >= start) && (!end || leadDate <= end);
        const searchMatch = searchTerm ?
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone.includes(searchTerm) ||
            lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.product?.toLowerCase().includes(searchTerm.toLowerCase())
            : true;

        return statusMatch && dateMatch && searchMatch;
    });

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await updateLead({ id, status: newStatus });
            if (res?.data?.success) {
                toast.success("Status updated successfully");
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    const handleModalFieldSave = async (field, value) => {
        if (!viewLead) return;
        setModalSaving(true);
        try {
            const res = await updateLead({ id: viewLead._id, [field]: value });
            if (res?.data?.success) {
                setViewLead(prev => ({ ...prev, [field]: value }));
                toast.success(`${field} updated successfully`);
            } else {
                toast.error(`Failed to update ${field}`);
            }
        } catch (error) {
            toast.error(`Error updating ${field}`);
        } finally {
            setModalSaving(false);
        }
    };

    const handleAddRemark = async () => {
        if (!newRemark.trim() || !viewLead) return;
        setModalSaving(true);

        try {
            console.log("Adding remark for lead:", viewLead._id); // Debug log
            console.log("Remark text:", newRemark.trim()); // Debug log

            const response = await addRemark({
                leadId: viewLead._id,
                text: newRemark.trim()
            });

            console.log("Add remark response:", response); // Debug log

            // Check if the response has data and success
            if (response?.data?.success) {
                setNewRemark("");
                setShowAddRemark(false);
                // Refetch remarks to update the list
                refetchRemarks();
                toast.success("Remark added successfully");
            } else {
                // Handle error response
                const errorMessage = response?.error?.data?.message || "Failed to add remark";
                toast.error(errorMessage);
                console.error("Add remark error details:", response?.error);
            }
        } catch (error) {
            console.error("Exception in handleAddRemark:", error);
            toast.error(error?.data?.message || "Error adding remark");
        } finally {
            setModalSaving(false);
        }
    };

    const handleEditRemark = async () => {
        if (!editRemarkText.trim() || !viewLead || !editingRemark) return;
        setModalSaving(true);
        try {
            const res = await editRemark({
                leadId: viewLead._id,
                remarkId: editingRemark._id,
                text: editRemarkText.trim()
            }).unwrap();

            if (res?.success) {
                setEditingRemark(null);
                setEditRemarkText("");
                refetchRemarks(); // Refresh remarks
                toast.success("Remark updated successfully");
            } else {
                toast.error("Failed to update remark");
            }
        } catch (error) {
            toast.error("Error updating remark");
        } finally {
            setModalSaving(false);
        }
    };

    const handleDeleteRemark = async (remarkId) => {
        if (!viewLead || !window.confirm("Are you sure you want to delete this remark?")) return;

        try {
            const res = await deleteRemark({
                leadId: viewLead._id,
                remarkId
            }).unwrap();

            if (res?.success) {
                refetchRemarks(); // Refresh remarks
                toast.success("Remark deleted successfully");
            } else {
                toast.error("Failed to delete remark");
            }
        } catch (error) {
            toast.error("Error deleting remark");
        }
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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

    return (
        <div className="min-h-screen bg-[#f7f8fa]">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-[#1a1a2e] flex items-center gap-2">
                                <Users className="text-[#4f46e5]" size={28} />
                                Lead Management
                            </h1>
                            <p className="text-[#7a8394] mt-1 text-sm">
                                Track and manage your sales pipeline effectively
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="flex gap-4">
                            <div className="bg-white rounded-xl shadow-sm px-4 py-3 border border-[#e8ecf0]">
                                <p className="text-xs text-[#7a8394]">Total Leads</p>
                                <p className="text-2xl font-bold text-[#1a1a2e]">{leads.length}</p>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm px-4 py-3 border border-[#e8ecf0]">
                                <p className="text-xs text-[#7a8394]">Active</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {leads.filter(l => l.status !== 'closed-lost' && l.status !== 'closed-won').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters Bar */}
                    <div className="mt-6 bg-white rounded-xl shadow-sm p-4 border border-[#e8ecf0]">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Search leads by name, phone, email or product..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent text-sm"
                                />
                                <User className="absolute left-3 top-2.5 text-[#9ca3af]" size={18} />
                            </div>

                            {/* Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 border border-[#e5e7eb] rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                                <Filter size={18} className="text-[#5a6578]" />
                                Filters
                                <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Add Lead Button */}
                            {profile?.role === 'admin' && <button
                                onClick={() => navigate("/addLeads")}
                                className="flex items-center gap-2 bg-[#4f46e5] text-white px-6 py-2 rounded-lg hover:bg-[#4338ca] transition-all shadow-md hover:shadow-lg text-sm font-semibold"
                            >
                                <Plus size={18} />
                                Add New Lead
                            </button>}
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-[#f0f2f5]">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 text-[#9ca3af]" size={18} />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-sm"
                                            placeholder="Start Date"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 text-[#9ca3af]" size={18} />
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-sm"
                                            placeholder="End Date"
                                        />
                                    </div>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-4 py-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-sm"
                                    >
                                        <option value="">All Status</option>
                                        {leadStatus?.map((status) => (
                                            <option key={status.value} value={status.value}>
                                                {status.label || status.value}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Active Filters */}
                                {(statusFilter || startDate || endDate) && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-xs text-[#7a8394]">Active filters:</span>
                                        {statusFilter && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                                                Status: {statusFilter.replace('-', ' ')}
                                                <X size={12} className="cursor-pointer" onClick={() => setStatusFilter("")} />
                                            </span>
                                        )}
                                        {startDate && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                                                From: {startDate}
                                                <X size={12} className="cursor-pointer" onClick={() => setStartDate("")} />
                                            </span>
                                        )}
                                        {endDate && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                                                To: {endDate}
                                                <X size={12} className="cursor-pointer" onClick={() => setEndDate("")} />
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Leads Table */}
                <div className="bg-white rounded-xl border border-[#e8ecf0] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full data-table">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider px-4 py-3">#</th>
                                    <th className="text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider px-4 py-3">Lead</th>
                                    <th className="text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider px-4 py-3">Contact</th>
                                    <th className="text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider px-4 py-3">Status</th>
                                    <th className="text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider px-4 py-3">Assigned To</th>
                                    <th className="text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider px-4 py-3">Follow Up</th>
                                    <th className="text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider px-4 py-3">Remarks</th>
                                    <th className="text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map((lead, index) => (
                                    <tr key={lead._id} className="hover:bg-gray-50 transition-colors border-b border-[#f9fafb] last:border-0">
                                        <td className="px-4 py-3">
                                            <span className="row-num text-[#9ca3af] text-xs font-medium">
                                                {(index + 1).toString().padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#4f46e5] flex items-center justify-center text-white font-bold text-sm">
                                                    {lead.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-[#1a1a2e] text-sm">{lead.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-xs text-[#374151]">
                                                    <Phone size={12} className="text-[#9ca3af]" />
                                                    {lead.phone}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-[#374151]">
                                                    <Mail size={12} className="text-[#9ca3af]" />
                                                    <span className="truncate max-w-[150px]">{lead.email || '—'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                className={`status-select ${getStatusColor(lead.status)} border border-[#e5e7eb] rounded-full px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]`}
                                                value={lead.status}
                                                onChange={async (e) => {
                                                    const newStatus = e.target.value;
                                                    await handleStatusChange(lead._id, newStatus);
                                                }}
                                            >
                                                {leadStatus?.map((status) => (
                                                    <option key={status.value} value={status.value}>
                                                        {status.label || status.value}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {lead.assignedTo ? (
                                                    <>
                                                        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#8b5cf6] to-[#4f46e5] flex items-center justify-center text-white text-xs font-bold">
                                                            {lead.assignedTo.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-xs font-medium text-[#1a1a2e]">{lead.assignedTo.name}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-[#9ca3af]">Unassigned</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 text-xs text-[#374151]">
                                                <Calendar size={12} className="text-[#9ca3af]" />
                                                {formatDate(lead.followUpDate)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <MessageCircle size={12} className="text-[#9ca3af]" />
                                                <span className="text-xs text-[#374151]">
                                                    {lead.remarksCount || 0} remarks
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setViewLead(lead)}
                                                    className="action-btn view w-8 h-8 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                                                    title="View Details"
                                                >
                                                    <FileText size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {filteredLeads.length === 0 && (
                        <div className="empty-state text-center py-12">
                            <div className="max-w-md mx-auto">
                                <Users size={48} className="text-[#9ca3af] mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-[#1a1a2e] mb-2">No leads found</h3>
                                <p className="text-sm text-[#9ca3af] mb-6">Try adjusting your filters or add a new lead</p>
                                {profile?.role === 'admin' && <button
                                    onClick={() => navigate("/addLeads")}
                                    className="inline-flex items-center gap-2 bg-[#4f46e5] text-white px-6 py-2 rounded-lg hover:bg-[#4338ca] transition-colors text-sm font-semibold"
                                >
                                    <Plus size={18} />
                                    Add New Lead
                                </button>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Lead Detail Modal with Enhanced Remarks */}
                {viewLead && (
                    <div className="modal-overlay fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-5" onClick={() => {
                        setViewLead(null);
                        setShowAddRemark(false);
                        setNewRemark('');
                        setEditingRemark(null);
                        setActiveTab('remarks');
                    }}>
                        <div className="modal-card bg-white rounded-xl w-full max-w-[600px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                            {/* Header */}
                            <div className="modal-header flex items-center justify-between p-6 pb-4 border-b border-[#f0f2f5]">
                                <div className="modal-title-group flex items-center gap-3.5">
                                    <div className="modal-lead-avatar w-11 h-11 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#4f46e5] text-white text-lg font-bold flex items-center justify-center">
                                        {viewLead.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="modal-lead-name text-base font-bold text-[#1a1a2e] mb-0.5">{viewLead.name}</h3>
                                        <p className="modal-lead-sub text-xs text-[#9ca3af]">{viewLead.email || 'No email provided'}</p>
                                    </div>
                                </div>
                                <button className="modal-close w-8 h-8 border-none bg-gray-100 rounded-lg cursor-pointer text-gray-500 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors" onClick={() => {
                                    setViewLead(null);
                                    setShowAddRemark(false);
                                    setNewRemark('');
                                    setEditingRemark(null);
                                }}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Status Bar */}
                            <div className="modal-status-bar flex items-center gap-3 px-6 py-3.5 bg-gray-50 border-b border-[#f0f2f5]">
                                <span className="modal-status-label text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
                                <select
                                    className={`status-select ${getStatusColor(viewLead.status)} border border-[#e5e7eb] rounded-full px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]`}
                                    value={viewLead.status}
                                    onChange={async e => {
                                        const newStatus = e.target.value;
                                        await handleStatusChange(viewLead._id, newStatus);
                                        setViewLead(prev => ({ ...prev, status: newStatus }));
                                    }}
                                >
                                    {leadStatus?.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label || status.value}
                                        </option>
                                    ))}
                                </select>
                                {modalSaving && <span className="modal-saving-badge text-xs text-[#4f46e5] font-medium ml-2 animate-pulse">Saving…</span>}
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-[#f0f2f5] px-6">
                                <button
                                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'remarks'
                                        ? 'border-[#4f46e5] text-[#4f46e5]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => setActiveTab('remarks')}
                                >
                                    <div className="flex items-center gap-2">
                                        <MessageCircle size={16} />
                                        Remarks ({remarksData?.remarks?.length || 0})
                                    </div>
                                </button>
                                <button
                                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history'
                                        ? 'border-[#4f46e5] text-[#4f46e5]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                    onClick={() => setActiveTab('history')}
                                >
                                    <div className="flex items-center gap-2">
                                        <History size={16} />
                                        History
                                    </div>
                                </button>
                            </div>

                            {/* Scrollable Body */}
                            <div className="modal-body overflow-y-auto flex-1 pb-1">
                                {/* Basic Info Grid - Always Visible */}
                                <div className="modal-detail-grid grid grid-cols-2 gap-0 py-2">
                                    <div className="modal-detail-item flex flex-col gap-1 p-4 border-b border-[#f9fafb] border-r border-[#f9fafb]">
                                        <span className="modal-detail-label flex items-center gap-1 text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">
                                            <Phone size={12} />
                                            Phone
                                        </span>
                                        <span className="modal-detail-value text-sm font-medium text-[#1a1a2e]">{viewLead.phone}</span>
                                    </div>
                                    <div className="modal-detail-item flex flex-col gap-1 p-4 border-b border-[#f9fafb]">
                                        <span className="modal-detail-label flex items-center gap-1 text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">
                                            <Tag size={12} />
                                            Source
                                        </span>
                                        <span className="modal-detail-value text-sm font-medium text-[#1a1a2e] capitalize">{viewLead.source || '—'}</span>
                                    </div>
                                    <div className="modal-detail-item flex flex-col gap-1 p-4 border-b border-[#f9fafb] border-r border-[#f9fafb]">
                                        <span className="modal-detail-label flex items-center gap-1 text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">
                                            <Clock size={12} />
                                            Added On
                                        </span>
                                        <span className="modal-detail-value text-sm font-medium text-[#1a1a2e]">{formatDate(viewLead.createdAt)}</span>
                                    </div>
                                    <div className="modal-detail-item flex flex-col gap-1 p-4 border-b border-[#f9fafb]">
                                        <span className="modal-detail-label flex items-center gap-1 text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">
                                            <Calendar size={12} />
                                            Follow Up
                                        </span>
                                        <span className="modal-detail-value text-sm font-medium text-[#1a1a2e]">{formatDate(viewLead.followUpDate)}</span>
                                    </div>
                                </div>

                                {/* Assigned To Section */}
                                <div className="modal-edit-section p-6 border-b border-[#f0f2f5] flex flex-col gap-2.5">
                                    <span className="modal-detail-label flex items-center gap-1 text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">
                                        <Users size={12} />
                                        Assigned To
                                    </span>
                                    <div className="modal-edit-row flex items-center gap-3 flex-wrap">
                                        <div className="assignee-grid modal-assignee-grid flex flex-wrap gap-2">
                                            {executives?.map(exec => (
                                                <button
                                                    key={exec._id}
                                                    type="button"
                                                    className={`assignee-card flex flex-col items-start p-3 border ${String(viewLead.assignedTo?._id || viewLead.assignedTo || '') === String(exec._id)
                                                        ? 'border-[#4f46e5] bg-[#ede9fe]'
                                                        : 'border-[#e5e7eb] bg-white hover:border-[#4f46e5] hover:bg-[#f5f3ff]'} 
                                                        rounded-lg transition-all min-w-[150px]`}
                                                    onClick={() => handleModalFieldSave('assignedTo', exec._id)}
                                                >
                                                    <span className="assignee-name text-xs font-bold text-[#1a1a2e] tracking-wide">{exec.name.toUpperCase()}</span>
                                                    <span className="assignee-phone text-[11px] text-[#7a8394] mt-0.5">{exec.phone}</span>
                                                </button>
                                            ))}
                                            {executives.length === 0 && <p className="hint-text text-xs text-[#9ca3af] italic">No executives available.</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Follow Up Date Edit */}
                                <div className="modal-edit-section p-6 border-b border-[#f0f2f5] flex flex-col gap-2.5">
                                    <span className="modal-detail-label flex items-center gap-1 text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">
                                        <Calendar size={12} />
                                        Update Follow Up Date
                                    </span>
                                    <div className="modal-edit-row flex items-center gap-3 flex-wrap">
                                        <div className="input-wrapper modal-date-input flex items-center gap-2.5 border border-[#e5e7eb] rounded-lg px-3.5 bg-white h-10 max-w-[220px] focus-within:border-[#4f46e5] focus-within:ring-3 focus-within:ring-[#4f46e5]/20 transition-all">
                                            <Calendar size={15} className="text-[#9ca3af]" />
                                            <input
                                                type="date"
                                                defaultValue={viewLead.followUpDate ? new Date(viewLead.followUpDate).toISOString().split('T')[0] : ''}
                                                onBlur={e => {
                                                    if (e.target.value) handleModalFieldSave('followUpDate', e.target.value);
                                                }}
                                                className="flex-1 border-none outline-none text-sm text-[#1a1a2e] bg-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Tab Content */}
                                {activeTab === 'remarks' ? (
                                    /* Remarks Tab */
                                    <div className="remarks-tab p-6">
                                        {/* Add Remark Button */}
                                        {!showAddRemark && !editingRemark && (
                                            <button
                                                className="btn-add-remark w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#c4b5fd] rounded-lg bg-[#f5f3ff] text-[#4f46e5] text-sm font-semibold cursor-pointer hover:bg-[#ede9fe] hover:border-[#a78bfa] transition-all mb-4"
                                                onClick={() => setShowAddRemark(true)}
                                            >
                                                <Plus size={18} />
                                                Add New Remark
                                            </button>
                                        )}

                                        {/* Add Remark Form */}
                                        {showAddRemark && (
                                            <div className="modal-remark-form bg-gray-50 rounded-lg p-4 mb-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-semibold text-[#4f46e5] uppercase tracking-wider">New Remark</span>
                                                    <button
                                                        onClick={() => setShowAddRemark(false)}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                                <textarea
                                                    className="w-full p-3 border border-[#e5e7eb] rounded-lg text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent resize-none"
                                                    placeholder="Write your remark..."
                                                    value={newRemark}
                                                    onChange={e => setNewRemark(e.target.value)}
                                                    rows={3}
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button
                                                        className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                                                        onClick={() => {
                                                            setShowAddRemark(false);
                                                            setNewRemark('');
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        className="px-3 py-1.5 text-xs bg-[#4f46e5] text-white rounded-md hover:bg-[#4338ca] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                        onClick={handleAddRemark}
                                                        disabled={modalSaving || !newRemark.trim()}
                                                    >
                                                        {modalSaving ? (
                                                            <>
                                                                <span className="spinner inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                                Saving...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Check size={14} />
                                                                Save Remark
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Edit Remark Form */}
                                        {editingRemark && (
                                            <div className="modal-remark-form bg-yellow-50 rounded-lg p-4 mb-4 border border-yellow-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-semibold text-yellow-600 uppercase tracking-wider">Edit Remark</span>
                                                    <button
                                                        onClick={() => setEditingRemark(null)}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                                <textarea
                                                    className="w-full p-3 border border-yellow-300 rounded-lg text-sm text-[#1a1a2e] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                                                    value={editRemarkText}
                                                    onChange={e => setEditRemarkText(e.target.value)}
                                                    rows={3}
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button
                                                        className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                                                        onClick={() => setEditingRemark(null)}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        className="px-3 py-1.5 text-xs bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                        onClick={handleEditRemark}
                                                        disabled={modalSaving || !editRemarkText.trim()}
                                                    >
                                                        {modalSaving ? (
                                                            <>
                                                                <span className="spinner inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                                Updating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Check size={14} />
                                                                Update Remark
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Remarks List */}
                                        <div className="remarks-list space-y-3">
                                            {remarksData?.remarks?.length > 0 ? (
                                                remarksData.remarks.map((remark) => (
                                                    <div key={remark._id} className="remark-item bg-white border border-[#f0f2f5] rounded-lg p-4 hover:shadow-sm transition-shadow">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="remark-content flex-1">
                                                                <p className="text-sm text-[#1a1a2e] whitespace-pre-wrap">{remark.text}</p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                    <span className="text-xs text-[#7a8394]">
                                                                        By: <span className="font-medium text-[#4f46e5]">{remark.createdByName}</span>
                                                                    </span>
                                                                    <span className="text-xs text-[#7a8394]">•</span>
                                                                    <span className="text-xs text-[#7a8394]">
                                                                        {formatDate(remark.createdAt)}
                                                                    </span>
                                                                    {remark.isEdited && (
                                                                        <>
                                                                            <span className="text-xs text-[#7a8394]">•</span>
                                                                            <span className="text-xs text-yellow-600 flex items-center gap-1">
                                                                                <Edit2 size={10} />
                                                                                Edited
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="remark-actions flex items-center gap-1">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingRemark(remark);
                                                                        setEditRemarkText(remark.text);
                                                                        setShowAddRemark(false);
                                                                    }}
                                                                    className="p-1.5 text-gray-400 hover:text-[#4f46e5] hover:bg-[#ede9fe] rounded-md transition-colors"
                                                                    title="Edit remark"
                                                                >
                                                                    <Edit2 size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteRemark(remark._id)}
                                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                                                    title="Delete remark"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => setSelectedRemarkForHistory(remark)}
                                                                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                                                                    title="View history"
                                                                >
                                                                    <History size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="empty-remarks text-center py-8">
                                                    <MessageCircle size={32} className="text-[#9ca3af] mx-auto mb-2" />
                                                    <p className="text-sm text-[#7a8394]">No remarks yet</p>
                                                    <p className="text-xs text-[#9ca3af] mt-1">Click "Add New Remark" to add your first note</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* History Tab */
                                    <div className="history-tab p-6">
                                        {selectedRemarkForHistory ? (
                                            /* Single Remark History View */
                                            <div>
                                                <button
                                                    onClick={() => setSelectedRemarkForHistory(null)}
                                                    className="flex items-center gap-1 text-xs text-[#4f46e5] mb-4 hover:underline"
                                                >
                                                    ← Back to all history
                                                </button>
                                                <div className="history-timeline space-y-3">
                                                    <div className="timeline-item bg-gray-50 rounded-lg p-3">
                                                        <div className="flex items-start gap-2">
                                                            <div className="timeline-bullet w-2 h-2 rounded-full bg-[#4f46e5] mt-1.5"></div>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-medium text-[#1a1a2e]">Current Version</p>
                                                                <p className="text-sm text-[#374151] mt-1">{selectedRemarkForHistory.text}</p>
                                                                <p className="text-xs text-[#7a8394] mt-1">
                                                                    Last updated: {formatDate(selectedRemarkForHistory.updatedAt || selectedRemarkForHistory.createdAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* You can add more history items here from your API */}
                                                </div>
                                            </div>
                                        ) : (
                                            /* All History View */
                                            <div className="history-timeline space-y-4">
                                                <h4 className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">Recent Activity</h4>

                                                {/* Status Changes */}
                                                {viewLead.history?.status?.length > 0 && (
                                                    <div className="history-group">
                                                        <h5 className="text-xs font-medium text-[#4f46e5] mb-2">Status Changes</h5>
                                                        {viewLead.history.status.map((item, idx) => (
                                                            <div key={idx} className="timeline-item flex items-start gap-2 mb-2">
                                                                <div className="timeline-bullet w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                                                                <div className="flex-1">
                                                                    <p className="text-xs text-[#374151]">
                                                                        Changed from <span className="font-medium">{item.oldValue}</span> to{' '}
                                                                        <span className="font-medium">{item.newValue}</span>
                                                                    </p>
                                                                    <p className="text-xs text-[#7a8394]">
                                                                        By {item.changedByName} • {formatDate(item.createdAt)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Assignment Changes */}
                                                {viewLead.history?.assignment?.length > 0 && (
                                                    <div className="history-group">
                                                        <h5 className="text-xs font-medium text-[#4f46e5] mb-2">Assignment Changes</h5>
                                                        {viewLead.history.assignment.map((item, idx) => (
                                                            <div key={idx} className="timeline-item flex items-start gap-2 mb-2">
                                                                <div className="timeline-bullet w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                                                                <div className="flex-1">
                                                                    <p className="text-xs text-[#374151]">
                                                                        Assigned to new executive
                                                                    </p>
                                                                    <p className="text-xs text-[#7a8394]">
                                                                        By {item.changedByName} • {formatDate(item.createdAt)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* No History */}
                                                {(!viewLead.history?.status?.length && !viewLead.history?.assignment?.length) && (
                                                    <div className="empty-history text-center py-8">
                                                        <History size={32} className="text-[#9ca3af] mx-auto mb-2" />
                                                        <p className="text-sm text-[#7a8394]">No history available</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="modal-footer p-6 border-t border-[#f0f2f5] flex justify-end">
                                <button className="btn-reset px-5 py-2 border border-[#e5e7eb] rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors" onClick={() => {
                                    setViewLead(null);
                                    setShowAddRemark(false);
                                    setNewRemark('');
                                    setEditingRemark(null);
                                    setActiveTab('remarks');
                                }}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reassign Modal */}
                {showReassignModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white w-[500px] rounded-xl shadow-xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Reassign Lead - {selectedLead?.name}</h2>
                                <button onClick={() => setShowReassignModal(false)} className="p-1 hover:bg-gray-100 rounded">
                                    <X size={18} />
                                </button>
                            </div>

                            <select
                                value={selectedExecutive}
                                onChange={(e) => setSelectedExecutive(e.target.value)}
                                className="w-full border border-[#e5e7eb] p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                            >
                                <option value="">Select Executive</option>
                                {executives.map((exec) => (
                                    <option key={exec._id} value={exec._id}>
                                        {exec.name} ({exec.phone})
                                    </option>
                                ))}
                            </select>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    onClick={() => setShowReassignModal(false)}
                                    className="px-4 py-2 border border-[#e5e7eb] rounded-lg text-sm hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReassign}
                                    className="px-4 py-2 bg-[#4f46e5] text-white rounded-lg text-sm hover:bg-[#4338ca] transition-colors"
                                >
                                    Reassign
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LeadView;