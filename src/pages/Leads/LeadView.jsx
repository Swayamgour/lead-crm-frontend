import React, { useState } from "react";
import {
    User,
    Phone,
    Mail,
    Tag,
    Users,
    Clock,
    MessageCircle,
    FileText,
    Edit,
    Plus,
    Filter,
    Calendar,
    ChevronDown,
    MoreVertical,
    Star,
    TrendingUp,
    DollarSign,
    Shield,
    X,
    MoreVerticalIcon,
    Circle,
    Flag
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetExecutivesQuery, useGetLeadsQuery, useUpdateLeadMutation } from "../../redux/api";
import toast from "react-hot-toast";
import { leadStatus } from "../../components/data";



function LeadView() {
    const { data } = useGetLeadsQuery();
    const [updateLead] = useUpdateLeadMutation();
    const { data: execData } = useGetExecutivesQuery();
    const executives = execData?.executives || [];
    const leads = data?.leads || [];

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
    const [remarkBold, setRemarkBold] = useState(false);
    const [remarkItalic, setRemarkItalic] = useState(false);
    const [remarkUnderline, setRemarkUnderline] = useState(false);
    const [modalSaving, setModalSaving] = useState(false);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [selectedExecutive, setSelectedExecutive] = useState("");

    const statusColors = {
        "new": "bg-blue-50 text-blue-700 border-blue-200",
        "contacted": "bg-purple-50 text-purple-700 border-purple-200",
        "qualified": "bg-green-50 text-green-700 border-green-200",
        "proposal": "bg-yellow-50 text-yellow-700 border-yellow-200",
        "negotiation": "bg-orange-50 text-orange-700 border-orange-200",
        "closed-won": "bg-emerald-50 text-emerald-700 border-emerald-200",
        "closed-lost": "bg-red-50 text-red-700 border-red-200"
    };

    const priorityColors = {
        high: "priority-high bg-red-50 text-red-700",
        medium: "priority-medium bg-yellow-50 text-yellow-700",
        low: "priority-low bg-green-50 text-green-700"
    };


    // {leadStatus}

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

    const getStatusBadge = (status) => {
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[status] || statusColors["new"]}`}>
                {status?.replace('-', ' ') || 'new'}
            </span>
        );
    };

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
            const res = await updateLead({
                id: viewLead._id,
                remark: newRemark
            });
            if (res?.data?.success) {
                setViewLead(prev => ({
                    ...prev,
                    remarks: prev.remarks
                        ? prev.remarks + '\n\n' + newRemark
                        : newRemark
                }));
                setNewRemark("");
                setShowAddRemark(false);
                setRemarkBold(false);
                setRemarkItalic(false);
                setRemarkUnderline(false);
                toast.success("Remark added successfully");
            } else {
                toast.error("Failed to add remark");
            }
        } catch (error) {
            toast.error("Error adding remark");
        } finally {
            setModalSaving(false);
        }
    };

    const handleReassign = async () => {
        if (!selectedExecutive || !selectedLead) {
            toast.error("Select executive first");
            return;
        }

        const res = await updateLead({
            id: selectedLead._id,
            assignedTo: selectedExecutive
        });

        if (res?.data?.success) {
            toast.success("Lead reassigned successfully");
            setShowReassignModal(false);
            setSelectedExecutive("");
            setSelectedLead(null);
        } else {
            toast.error("Failed to reassign");
        }
    };

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
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
                            <button
                                onClick={() => navigate("/addLeads")}
                                className="flex items-center gap-2 bg-[#4f46e5] text-white px-6 py-2 rounded-lg hover:bg-[#4338ca] transition-all shadow-md hover:shadow-lg text-sm font-semibold"
                            >
                                <Plus size={18} />
                                Add New Lead
                            </button>
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
                                        {leadStatus?.map((e) => {
                                            return (
                                                <option value={e?.value}>{e?.value}</option>

                                            )
                                        })}


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
                                    {/* <th className="text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider px-4 py-3">Priority</th> */}
                                    <th className="text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider px-4 py-3">Assigned To</th>
                                    <th className="text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider px-4 py-3">Follow Up</th>
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
                                                    {/* <div className="text-xs text-[#9ca3af]">{lead.product || 'No product'}</div> */}
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
                                                className={`status-select status-${lead.status} border border-[#e5e7eb] rounded-full px-3 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]`}
                                                value={lead.status}
                                                onChange={async (e) => {
                                                    const newStatus = e.target.value;
                                                    await handleStatusChange(lead._id, newStatus);
                                                }}
                                            >
                                                {leadStatus?.map((e) => {
                                                    return (
                                                        <option value={e?.value}>{e?.value}</option>

                                                    )
                                                })}
                                            </select>


                                        </td>
                                        {/* <td className="px-4 py-3">
                                            <span className={`priority-badge ${priorityColors[lead.priority || 'medium']} px-3 py-1 rounded-full text-xs font-medium inline-block`}>
                                                {lead.priority || 'medium'}
                                            </span>
                                        </td> */}
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
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setViewLead(lead)}
                                                    className="action-btn view w-8 h-8 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                                                    title="View Details"
                                                >
                                                    <FileText size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedLead(lead);
                                                        setShowReassignModal(true);
                                                    }}
                                                    className="action-btn w-8 h-8 rounded-md bg-gray-50 text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors"
                                                    title="Reassign"
                                                >
                                                    <Users size={16} />
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
                                <button
                                    onClick={() => navigate("/addLeads")}
                                    className="inline-flex items-center gap-2 bg-[#4f46e5] text-white px-6 py-2 rounded-lg hover:bg-[#4338ca] transition-colors text-sm font-semibold"
                                >
                                    <Plus size={18} />
                                    Add New Lead
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Lead Detail Modal */}
                {viewLead && (
                    <div className="modal-overlay fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-5" onClick={() => { setViewLead(null); setShowAddRemark(false); setNewRemark(''); }}>
                        <div className="modal-card bg-white rounded-xl w-full max-w-[520px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
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
                                <button className="modal-close w-8 h-8 border-none bg-gray-100 rounded-lg cursor-pointer text-gray-500 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors" onClick={() => { setViewLead(null); setShowAddRemark(false); setNewRemark(''); }}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Status Bar */}
                            <div className="modal-status-bar flex items-center gap-3 px-6 py-3.5 bg-gray-50 border-b border-[#f0f2f5]">
                                <span className="modal-status-label text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
                                <select
                                    className={`status-select status-${viewLead.status} border border-[#e5e7eb] rounded-full px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]`}
                                    value={viewLead.status}
                                    onChange={async e => {
                                        const newStatus = e.target.value;
                                        await handleStatusChange(viewLead._id, newStatus);
                                        setViewLead(prev => ({ ...prev, status: newStatus }));
                                    }}
                                >
                                    {leadStatus?.map((e) => {
                                        return (
                                            <option value={e?.value}>{e?.value}</option>

                                        )
                                    })}
                                </select>
                                {modalSaving && <span className="modal-saving-badge text-xs text-[#4f46e5] font-medium ml-2 animate-pulse">Saving…</span>}
                            </div>

                            {/* Scrollable Body */}
                            <div className="modal-body overflow-y-auto flex-1 pb-1">
                                {/* Detail Grid */}
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
                                    {/* <div className="modal-detail-item flex flex-col gap-1 p-4 border-b border-[#f9fafb]">
                                        <span className="modal-detail-label flex items-center gap-1 text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">
                                            <Flag size={12} />
                                            Priority
                                        </span>
                                        <span className={`modal-detail-value priority-badge ${priorityColors[viewLead.priority || 'medium']} px-3 py-1 rounded-full text-xs font-medium inline-block w-fit`}>
                                            {viewLead.priority || 'medium'}
                                        </span>
                                    </div> */}
                                </div>

                                {/* Assigned To */}
                                <div className="modal-edit-section p-6 border-b border-[#f0f2f5] flex flex-col gap-2.5">
                                    <span className="modal-detail-label flex items-center gap-1 text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">
                                        <Users size={12} />
                                        Assigned To
                                    </span>
                                    <div className="modal-edit-row flex items-center gap-3 flex-wrap">
                                        <div className="assignee-grid modal-assignee-grid flex flex-wrap gap-2">
                                            {executives.map(exec => (
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

                                {/* Follow Up Date */}
                                <div className="modal-edit-section p-6 border-b border-[#f0f2f5] flex flex-col gap-2.5">
                                    <span className="modal-detail-label flex items-center gap-1 text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">
                                        <Calendar size={12} />
                                        Follow Up Date
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
                                                onChange={e => {
                                                    if (e.target.value) handleModalFieldSave('followUpDate', e.target.value);
                                                }}
                                                className="flex-1 border-none outline-none text-sm text-[#1a1a2e] bg-transparent"
                                            />
                                        </div>
                                        {viewLead.followUpDate && (
                                            <span className="modal-date-display text-xs text-gray-500 italic">
                                                {formatDate(viewLead.followUpDate)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Existing Remarks */}
                                {viewLead.remarks && (
                                    <div className="modal-edit-section p-6 border-b border-[#f0f2f5] flex flex-col gap-2.5">
                                        <span className="modal-detail-label flex items-center gap-1 text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">
                                            <MessageCircle size={12} />
                                            Remarks / Notes
                                        </span>
                                        <p className="modal-remarks-text text-sm text-[#374151] leading-relaxed bg-gray-50 rounded-lg p-3 border border-[#f0f2f5] whitespace-pre-wrap">
                                            {viewLead.remarks}
                                        </p>
                                    </div>
                                )}

                                {/* Add Remark Section */}
                                <div className="modal-edit-section p-6 flex flex-col gap-2.5">
                                    {!showAddRemark ? (
                                        <button className="btn-add-remark inline-flex items-center gap-1.5 px-4 py-2 border-2 border-dashed border-[#c4b5fd] rounded-lg bg-[#f5f3ff] text-[#4f46e5] text-xs font-semibold cursor-pointer hover:bg-[#ede9fe] hover:border-[#a78bfa] transition-all w-fit" onClick={() => setShowAddRemark(true)}>
                                            <Plus size={14} />
                                            Add Remark
                                        </button>
                                    ) : (
                                        <div className="modal-remark-form flex flex-col gap-2.5">
                                            <span className="modal-detail-label flex items-center gap-1 text-[10px] font-semibold text-[#9ca3af] uppercase tracking-wider">
                                                <MessageCircle size={12} />
                                                New Remark
                                            </span>
                                            <div className="rich-text-editor border border-[#e5e7eb] rounded-lg overflow-hidden focus-within:border-[#4f46e5] focus-within:ring-3 focus-within:ring-[#4f46e5]/20 transition-all">
                                                <div className="rich-text-toolbar flex items-center gap-0.5 p-2 border-b border-[#f0f2f5] bg-gray-50">
                                                    <button
                                                        type="button"
                                                        className={`toolbar-btn w-7 h-7 rounded-md hover:bg-[#ede9fe] hover:text-[#4f46e5] transition-colors ${remarkBold ? 'bg-[#ede9fe] text-[#4f46e5]' : ''}`}
                                                        onClick={() => setRemarkBold(v => !v)}
                                                    >
                                                        <b className="text-sm">B</b>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`toolbar-btn w-7 h-7 rounded-md hover:bg-[#ede9fe] hover:text-[#4f46e5] transition-colors ${remarkItalic ? 'bg-[#ede9fe] text-[#4f46e5]' : ''}`}
                                                        onClick={() => setRemarkItalic(v => !v)}
                                                    >
                                                        <i className="text-sm">I</i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`toolbar-btn w-7 h-7 rounded-md hover:bg-[#ede9fe] hover:text-[#4f46e5] transition-colors ${remarkUnderline ? 'bg-[#ede9fe] text-[#4f46e5]' : ''}`}
                                                        onClick={() => setRemarkUnderline(v => !v)}
                                                    >
                                                        <u className="text-sm">U</u>
                                                    </button>
                                                    <div className="toolbar-divider w-px h-5 bg-[#e5e7eb] mx-1" />
                                                    <button
                                                        type="button"
                                                        className="toolbar-btn w-7 h-7 rounded-md hover:bg-[#ede9fe] hover:text-[#4f46e5] transition-colors"
                                                        onClick={() => setNewRemark(v => v + '\n• ')}
                                                    >
                                                        <div className="flex flex-col gap-0.5">
                                                            <div className="w-3 h-0.5 bg-current"></div>
                                                            <div className="w-3 h-0.5 bg-current"></div>
                                                            <div className="w-3 h-0.5 bg-current"></div>
                                                        </div>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="toolbar-btn w-7 h-7 rounded-md hover:bg-[#ede9fe] hover:text-[#4f46e5] transition-colors"
                                                        onClick={() => setNewRemark('')}
                                                    >
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polyline points="1 4 1 10 7 10" />
                                                            <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <textarea
                                                    className="rich-text-area w-full min-h-[120px] p-4 border-none outline-none text-sm font-normal text-[#1a1a2e] resize-y"
                                                    placeholder="Write your remark or note..."
                                                    value={newRemark}
                                                    onChange={e => setNewRemark(e.target.value)}
                                                    style={{
                                                        fontWeight: remarkBold ? 'bold' : 'normal',
                                                        fontStyle: remarkItalic ? 'italic' : 'normal',
                                                        textDecoration: remarkUnderline ? 'underline' : 'none',
                                                    }}
                                                    rows={4}
                                                />
                                            </div>
                                            <div className="modal-remark-actions flex justify-end gap-2.5 mt-1">
                                                <button className="btn-reset px-4 py-2 border border-[#e5e7eb] rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors" onClick={() => { setShowAddRemark(false); setNewRemark(''); }}>
                                                    Cancel
                                                </button>
                                                <button className="btn-primary px-4 py-2 bg-[#4f46e5] text-white rounded-lg text-sm font-semibold hover:bg-[#4338ca] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2" onClick={handleAddRemark} disabled={modalSaving}>
                                                    {modalSaving ? (
                                                        <>
                                                            <span className="spinner inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                            Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText size={14} />
                                                            Save Remark
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="modal-footer p-6 border-t border-[#f0f2f5] flex justify-end">
                                <button className="btn-reset px-5 py-2 border border-[#e5e7eb] rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors" onClick={() => { setViewLead(null); setShowAddRemark(false); setNewRemark(''); }}>
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