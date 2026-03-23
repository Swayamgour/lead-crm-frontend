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
    AlertCircle,
    ArrowRight,
    Edit,
    Eye,
    TrendingUp,
    Award,
    Target,
    BarChart3,
    RefreshCw
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
    useGetLeadRemarksQuery,
    useDeleteLeadMutation
} from "../../redux/api";
import toast from "react-hot-toast";
import { leadStatus } from "../../components/data";
import Loading from "../../components/Loading";

import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";



function LeadView() {
    const { data: leadsData, isLoading, refetch: refetchLeads } = useGetLeadsQuery();
    const { data: Executive } = useGetUsersQuery();
    const { data: profile } = useGetProfileQuery();
    const [updateLead] = useUpdateLeadMutation();
    const [deleteLead] = useDeleteLeadMutation();

    const pdfRef = useRef();

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
    const [confirmAssignId, setConfirmAssignId] = useState(null);
    const [selectedExecutive, setSelectedExecutive] = useState("");
    const [activeSideTab, setActiveSideTab] = useState("all"); // 'all', 'won', 'active', 'lost', 'pending'

    // Modal states
    const [viewLead, setViewLead] = useState(null);
    const [showAddRemark, setShowAddRemark] = useState(false);
    const [newRemark, setNewRemark] = useState("");
    const [editingRemark, setEditingRemark] = useState(null);
    const [editRemarkText, setEditRemarkText] = useState("");
    const [modalSaving, setModalSaving] = useState(false);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [activeTab, setActiveTab] = useState("remarks");
    const [selectedRemarkForHistory, setSelectedRemarkForHistory] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // Fetch remarks for selected lead
    const { data: remarksData, refetch: refetchRemarks } = useGetLeadRemarksQuery(viewLead?._id, {
        skip: !viewLead?._id
    });

    // Calculate statistics

    console.log(leads)
    const wonLeads = leads.filter(
        lead => lead.status?.toLowerCase() === 'won'
    );

    const lostLeads = leads.filter(
        lead => lead.status?.toLowerCase() === 'lost'
    );

    const pendingLeads = leads.filter(
        lead =>
            ['incoming', 'interested'].includes(
                lead.status?.toLowerCase()
            )
    );

    const activeLeads = leads.filter(
        lead =>
            ['ongoing', 'cold', 'no response'].includes(
                lead.status?.toLowerCase()
            )
    );

    // Filter leads based on side tab
    const getFilteredLeadsByTab = () => {
        let filtered = leads;

        switch (activeSideTab) {
            case 'Won':
                filtered = wonLeads;
                break;
            case 'active':
                filtered = activeLeads;
                break;
            case 'lost':
                filtered = lostLeads;
                break;
            case 'pending':
                filtered = pendingLeads;
                break;
            default:
                filtered = leads;
        }

        return filtered.filter((lead) => {
            const leadDate = new Date(lead.createdAt);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            const statusMatch = statusFilter
                ? lead.status?.toLowerCase() === statusFilter.toLowerCase()
                : true;

            const dateMatch =
                (!start || leadDate >= start) &&
                (!end || leadDate <= end);

            const searchMatch = searchTerm
                ? lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                lead.phone?.includes(searchTerm) ||
                lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
                : true;

            return statusMatch && dateMatch && searchMatch;
        });
    };

    const filteredLeads = getFilteredLeadsByTab();

    const handleStatusChange = async (id, newStatus) => {
        try {
            const res = await updateLead({ id, status: newStatus });
            if (res?.data?.success) {
                toast.success("Status updated successfully");
                refetchLeads();
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    const handleDeleteLead = async (id) => {
        try {
            const res = await deleteLead(id).unwrap();
            if (res?.success) {
                toast.success("Lead deleted successfully");
                refetchLeads();
                setDeleteConfirmId(null);
            } else {
                toast.error("Failed to delete lead");
            }
        } catch (error) {
            toast.error("Error deleting lead");
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
                refetchLeads();
            } else {
                toast.error(`Failed to update ${field}`);
            }
        } catch (error) {
            toast.error(`Error updating ${field}`);
        } finally {
            setModalSaving(false);
            setConfirmAssignId(null);
        }
    };

    const handleAddRemark = async () => {
        if (!newRemark.trim() || !viewLead) return;
        setModalSaving(true);

        try {
            const response = await addRemark({
                leadId: viewLead._id,
                text: newRemark.trim()
            });

            if (response?.data?.success) {
                setNewRemark("");
                setShowAddRemark(false);
                refetchRemarks();
                toast.success("Remark added successfully");
            } else {
                const errorMessage = response?.error?.data?.message || "Failed to add remark";
                toast.error(errorMessage);
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
                refetchRemarks();
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
                refetchRemarks();
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

    const handleDownloadPDF = async () => {
        try {
            const element = pdfRef.current;

            if (!element) {
                alert("Element not found");
                return;
            }

            // 🔥 Clone the element
            const clone = element.cloneNode(true);

            // 👇 Apply black & white styles
            clone.querySelectorAll("*").forEach((el) => {
                el.style.color = "#000";
                el.style.backgroundColor = "#fff";
                el.style.borderColor = "#000";
                el.style.boxShadow = "none";
            });

            clone.style.padding = "20px";

            // 👇 Hidden attach to DOM
            clone.style.position = "fixed";
            clone.style.top = "-9999px";
            document.body.appendChild(clone);

            // 👇 Generate canvas
            const canvas = await html2canvas(clone, {
                scale: 2
            });

            document.body.removeChild(clone);

            const imgData = canvas.toDataURL("image/png");

            const pdf = new jsPDF("p", "mm", "a4");

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

            pdf.save(`${viewLead?.name || "lead"}_remarks.pdf`);

        } catch (error) {
            console.error("PDF Error:", error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'incoming': 'bg-blue-100 text-blue-800',
            'contacted': 'bg-yellow-100 text-yellow-800',
            'follow-up': 'bg-purple-100 text-purple-800',
            'qualified': 'bg-green-100 text-green-800',
            'proposal': 'bg-indigo-100 text-indigo-800',
            'negotiation': 'bg-orange-100 text-orange-800',
            'closed-won': 'bg-emerald-100 text-emerald-800 border-emerald-500',
            'closed-lost': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusColorStatus = (status) => {
        const s = status?.toLowerCase();

        switch (s) {
            case 'won':
                return 'bg-green-500 text-white border-green-600';

            case 'lost':
                return 'bg-red-500 text-white border-red-600';

            case 'incoming':
                return 'bg-blue-500 text-white border-blue-600';

            case 'interested':
                return 'bg-indigo-500 text-white border-indigo-600';

            case 'ongoing':
                return 'bg-yellow-500 text-white border-yellow-600';

            case 'cold':
                return 'bg-gray-400 text-white border-gray-500';

            case 'no response':
                return 'bg-orange-500 text-white border-orange-600';

            default:
                return 'bg-gray-200 text-gray-700 border-gray-300';
        }
    };

    const getStatusBadgeStyle = (status) => {
        if (status === 'closed-won') {
            return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md';
        }
        return getStatusColor(status);
    };

    if (isLoading) {
        return <Loading data={'Lead'} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header Section with Stats Cards */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
                                <Users className="text-[#4f46e5]" size={32} />
                                Lead Management
                            </h1>
                            <p className="text-gray-500 mt-1 text-sm">
                                Track and manage your sales pipeline effectively
                            </p>
                        </div>

                        {/* Add Lead Button */}
                        {profile?.role === 'admin' && (
                            <button
                                onClick={() => navigate("/addLeads")}
                                className="flex items-center gap-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all text-sm font-semibold"
                            >
                                <Plus size={18} />
                                Add New Lead
                            </button>
                        )}
                    </div>

                    {/* 4 Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Won Leads Card */}
                        <div
                            onClick={() => setActiveSideTab('won')}
                            className={`cursor-pointer bg-white rounded-2xl shadow-sm p-5 border-2 transition-all hover:shadow-md ${activeSideTab === 'won'
                                ? 'border-emerald-500 bg-emerald-50/30 shadow-md'
                                : 'border-gray-100 hover:border-emerald-200'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <Award size={24} className="text-emerald-600" />
                                </div>
                                <span className="text-3xl font-bold text-emerald-600">{wonLeads.length}</span>
                            </div>
                            <h3 className="text-gray-700 font-semibold text-lg">Won Leads</h3>
                            <p className="text-gray-400 text-xs mt-1">Successfully closed deals</p>
                        </div>

                        {/* Active Leads Card */}
                        <div
                            onClick={() => setActiveSideTab('active')}
                            className={`cursor-pointer bg-white rounded-2xl shadow-sm p-5 border-2 transition-all hover:shadow-md ${activeSideTab === 'active'
                                ? 'border-blue-500 bg-blue-50/30 shadow-md'
                                : 'border-gray-100 hover:border-blue-200'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                    <TrendingUp size={24} className="text-blue-600" />
                                </div>
                                <span className="text-3xl font-bold text-blue-600">{activeLeads.length}</span>
                            </div>
                            <h3 className="text-gray-700 font-semibold text-lg">Active Leads</h3>
                            <p className="text-gray-400 text-xs mt-1">In progress opportunities</p>
                        </div>

                        {/* Lost Leads Card */}
                        <div
                            onClick={() => setActiveSideTab('lost')}
                            className={`cursor-pointer bg-white rounded-2xl shadow-sm p-5 border-2 transition-all hover:shadow-md ${activeSideTab === 'lost'
                                ? 'border-red-500 bg-red-50/30 shadow-md'
                                : 'border-gray-100 hover:border-red-200'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                                    <X size={24} className="text-red-600" />
                                </div>
                                <span className="text-3xl font-bold text-red-600">{lostLeads.length}</span>
                            </div>
                            <h3 className="text-gray-700 font-semibold text-lg">Lost Leads</h3>
                            <p className="text-gray-400 text-xs mt-1">Closed without success</p>
                        </div>

                        {/* Pending Leads Card */}
                        <div
                            onClick={() => setActiveSideTab('pending')}
                            className={`cursor-pointer bg-white rounded-2xl shadow-sm p-5 border-2 transition-all hover:shadow-md ${activeSideTab === 'pending'
                                ? 'border-yellow-500 bg-yellow-50/30 shadow-md'
                                : 'border-gray-100 hover:border-yellow-200'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                                    <Clock size={24} className="text-yellow-600" />
                                </div>
                                <span className="text-3xl font-bold text-yellow-600">{pendingLeads.length}</span>
                            </div>
                            <h3 className="text-gray-700 font-semibold text-lg">Pending Leads</h3>
                            <p className="text-gray-400 text-xs mt-1">Awaiting initial contact</p>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Search leads by name, phone, email or product..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:border-transparent text-sm bg-gray-50"
                                />
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            </div>

                            {/* Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600"
                            >
                                <Filter size={18} />
                                Filters
                                <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-sm"
                                            placeholder="Start Date"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-sm"
                                            placeholder="End Date"
                                        />
                                    </div>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-sm"
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
                                        <span className="text-xs text-gray-500">Active filters:</span>
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

                {/* Active Side Tab Indicator */}
                <div className="mb-4 flex items-center gap-2">
                    <div className="text-sm text-gray-500">
                        Showing:
                        <span className="font-semibold text-gray-700 ml-1">
                            {activeSideTab === 'all' && 'All Leads'}
                            {activeSideTab === 'won' && 'Won Leads'}
                            {activeSideTab === 'active' && 'Active Leads'}
                            {activeSideTab === 'lost' && 'Lost Leads'}
                            {activeSideTab === 'pending' && 'Pending Leads'}
                        </span>
                    </div>
                    {activeSideTab !== 'all' && (
                        <button
                            onClick={() => setActiveSideTab('all')}
                            className="text-xs text-[#4f46e5] hover:underline flex items-center gap-1"
                        >
                            <X size={12} />
                            Clear filter
                        </button>
                    )}
                </div>

                {/* Leads Table */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">#</th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Lead</th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Contact</th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Assigned To</th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Follow Up</th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Remarks</th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map((lead, index) => (
                                    <tr key={lead._id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                                        <td className="px-4 py-3">
                                            <span className="text-gray-400 text-xs font-medium">
                                                {(index + 1).toString().padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className={`font-semibold text-sm ${lead.status === 'closed-won' ? 'text-emerald-700' : 'text-gray-900'}`}>
                                                    {lead.name}
                                                </div>
                                                {lead.product && (
                                                    <div className="text-xs text-gray-400 mt-0.5">{lead.product}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                    <Phone size={12} className="text-gray-400" />
                                                    {lead.phone}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                                    <Mail size={12} className="text-gray-400" />
                                                    <span className="truncate max-w-[150px]">{lead.email || '—'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            {/* <div className="relative inline-block"> */}
                                            <div className="relative inline-block w-[120px]">

                                                {/* Status Chip */}
                                                <div
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold cursor-pointer shadow-sm
                                                     ${getStatusColorStatus(lead.status)}`}
                                                >
                                                    {/* Dot */}
                                                    {/* <span className="w-2 h-4 rounded-full bg-white/80"></span> */}

                                                    {/* Text */}
                                                    {lead.status}

                                                    {/* Arrow */}
                                                    <ChevronDown size={14} className="opacity-70" />
                                                </div>

                                                {/* Hidden Select (overlay) */}
                                                <select
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
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
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {lead.assignedTo ? (
                                                    <span className="text-xs font-medium text-gray-700">{lead.assignedTo.name}</span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Unassigned</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                <Calendar size={12} className="text-gray-400" />
                                                {formatDate(lead.followUpDate)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                <MessageCircle size={12} className="text-gray-400" />
                                                <span className="text-xs text-gray-600">
                                                    {lead.remarksCount || 0} remarks
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setViewLead(lead)}
                                                    className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/editLead/${lead._id}`)}
                                                    className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition-all"
                                                    title="Edit Lead"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmId(lead._id)}
                                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-all"
                                                    title="Delete Lead"
                                                >
                                                    <Trash2 size={16} />
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
                        <div className="text-center py-12">
                            <div className="max-w-md mx-auto">
                                <Users size={48} className="text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
                                <p className="text-sm text-gray-500 mb-6">Try adjusting your filters or add a new lead</p>
                                {profile?.role === 'admin' && (
                                    <button
                                        onClick={() => navigate("/addLeads")}
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white px-6 py-2.5 rounded-xl hover:shadow-lg transition-all text-sm font-semibold"
                                    >
                                        <Plus size={18} />
                                        Add New Lead
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirmId && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
                            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                        <AlertCircle className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Delete Lead</h3>
                                        <p className="text-sm text-white/90">This action cannot be undone</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to delete this lead? All associated remarks and history will be permanently removed.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDeleteLead(deleteConfirmId)}
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lead Detail Modal - Keep existing modal code */}
                {viewLead && (
                    // ... (keep existing modal code)
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
                                    className={`status-select ${viewLead.status === 'closed-won'
                                        ? 'bg-emerald-500 text-white border-emerald-600'
                                        : getStatusColorStatus(viewLead.status)} border border-[#e5e7eb] rounded-full px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#4f46e5]`}
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
                                {activeTab === 'remarks' &&
                                    <>
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
                                                            onClick={() => {
                                                                setSelectedExecutive(exec._id);
                                                                setConfirmAssignId(exec._id);
                                                            }}
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
                                    </>
                                }

                                {/* Tab Content */}

                                {activeTab === 'history' && (
                                    /* Remarks Tab */
                                    <div ref={pdfRef} className="remarks-tab p-6">
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
                                        <div className="flex justify-end mb-4">
                                            <button
                                                onClick={handleDownloadPDF}
                                                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-red-600 transition-all"
                                            >
                                                📄 Download PDF
                                            </button>
                                        </div>
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

                {/* Reassign Confirmation Modal */}
                {confirmAssignId && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideUp">
                            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                        <AlertCircle className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Confirm Reassignment</h3>
                                        <p className="text-sm text-white/90">Please review the changes</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                                                {viewLead?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Lead</p>
                                                <p className="text-base font-bold text-gray-900">{viewLead?.name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{viewLead?.phone}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between px-2">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 mb-1">Current</p>
                                            <div className="flex flex-col items-center">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center mb-1">
                                                    {viewLead?.assignedTo ? (
                                                        <span className="text-lg font-bold text-gray-600">
                                                            {viewLead.assignedTo.name?.charAt(0).toUpperCase()}
                                                        </span>
                                                    ) : (
                                                        <Users size={20} className="text-gray-400" />
                                                    )}
                                                </div>
                                                <span className="text-xs font-medium text-gray-700">
                                                    {viewLead?.assignedTo?.name || 'Unassigned'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-1 flex justify-center">
                                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                                                <ArrowRight className="w-6 h-6 text-amber-600" />
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <p className="text-xs text-gray-500 mb-1">New</p>
                                            <div className="flex flex-col items-center">
                                                <div className="w-12 h-12 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center mb-1">
                                                    <span className="text-lg font-bold text-green-600">
                                                        {executives.find(e => e._id === selectedExecutive)?.name?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-medium text-green-700">
                                                    {executives.find(e => e._id === selectedExecutive)?.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                                        <div className="flex gap-2">
                                            <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-800">
                                                This action will transfer the lead to the new executive.
                                                All remarks and history will remain intact.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setConfirmAssignId(null)}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleModalFieldSave('assignedTo', confirmAssignId);
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} />
                                        Confirm Transfer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Add animations */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out forwards;
                }

                .animate-slideUp {
                    animation: slideUp 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

export default LeadView;