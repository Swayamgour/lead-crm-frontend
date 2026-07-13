import { useEffect, useState } from "react";
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
    useDeleteLeadMutation,
    useGetLeadsPaginatedQuery
} from "../../redux/api";
import toast from "react-hot-toast";
import { leadStatus } from "../../components/data";
import Loading from "../../components/Loading";
import DateQuickFilter, { DATE_PRESETS } from "../../components/DateQuickFilter";

import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ConfirmModal from "../../components/ConfirmModal";
import ExcelButton from "../../components/ExcelButton";



function LeadView() {
    const DATE_PRESETS_LABEL = Object.fromEntries(DATE_PRESETS.map(p => [p.value, p.label]));

    const { data: leadsData, isLoading, refetch: refetchLeads } = useGetLeadsQuery();
    const { data: Executive } = useGetUsersQuery();
    const { data: profile } = useGetProfileQuery();

    // console.log()
    const [updateLead] = useUpdateLeadMutation();
    const [deleteLead] = useDeleteLeadMutation();

    // const { data: PaginatedLeads , isFetching } = useGetLeadsPaginatedQuery()


    // console.log(data)

    const pdfRef = useRef();


    // New remark mutations
    const [addRemark] = useAddRemarkMutation();
    const [editRemark] = useEditRemarkMutation();
    const [deleteRemark] = useDeleteRemarkMutation();



    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState({ preset: "all", startDate: "", endDate: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLead, setSelectedLead] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [confirmAssignId, setConfirmAssignId] = useState(null);
    const [selectedExecutive, setSelectedExecutive] = useState("");
    const [activeSideTab, setActiveSideTab] = useState("all"); // 'all', 'won', 'active', 'lost', 'pending'


    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

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
    const [openId, setOpenId] = useState(null);

    // import { useRef, useEffect } from "react";

    const dropdownRef = useRef(null);



    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenId(null);
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);





    const { data: PaginatedLeads, isFetching } = useGetLeadsPaginatedQuery({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter || undefined,
        search: searchTerm || undefined,
        startDate: dateFilter.startDate || undefined,
        endDate: dateFilter.endDate || undefined
    });

    const leads = PaginatedLeads?.data || [];
    const executives = Executive || [];

    // Fetch remarks for selected lead
    const { data: remarksData, refetch: refetchRemarks, isLoading: remarksLoading } = useGetLeadRemarksQuery(viewLead?._id, {
        skip: !viewLead?._id
    });

    // Calculate statistics

    // console.log(leads)
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


    const filteredLeads = leads;

    const handleStatusChange = async (id, newStatus) => {
        const toastId = toast.loading("Updating status..."); // 🔥 id store karo

        try {
            const res = await updateLead({ id, status: newStatus });

            if (res?.data?.success) {
                toast.success("Status updated successfully", { id: toastId }); // ✅ replace loading
                refetchLeads();
            } else {
                toast.error("Failed to update status", { id: toastId }); // ✅ replace loading
            }
        } catch (error) {
            toast.error("Error updating status", { id: toastId }); // ✅ replace loading
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
        console.log('if')
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

    // console.log(modalSaving)

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
            const pdf = new jsPDF("p", "mm", "a4");

            let y = 10;

            // Title
            pdf.setFontSize(16);
            pdf.text("Remarks Report", 10, y);

            y += 10;

            const remarks = remarksData?.remarks || [];

            remarks.forEach((item, index) => {
                // 🟢 Format Date
                const date = new Date(item.createdAt).toLocaleString();

                // 🟢 Main text
                const remarkText = `${index + 1}. ${item.text}`;

                // 🟢 Split long text
                const splitText = pdf.splitTextToSize(remarkText, 180);

                pdf.setFontSize(11);
                pdf.text(splitText, 10, y);

                y += splitText.length * 6;

                // 🟢 Created by + date
                pdf.setFontSize(9);
                pdf.setTextColor(100);

                pdf.text(
                    `By: ${item.createdByName || "Unknown"} | ${date}`,
                    10,
                    y
                );

                // Reset color
                pdf.setTextColor(0);

                y += 10;

                // 🔥 Page break
                if (y > 270) {
                    pdf.addPage();
                    y = 10;
                }
            });

            pdf.save("remarks.pdf");

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
                return 'bg-gray-200 text-gray-700 border-gray-200';
        }
    };

    const getStatusBadgeStyle = (status) => {
        if (status === 'closed-won') {
            return 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md';
        }
        return getStatusColor(status);
    };

    const formatLeads = (data) =>
        data?.map((item, i) => ({
            "S.No": i + 1,
            "Name": item.name,
            "Phone": item.phone,
            "Email": item.email || "-",
            "Source": item.source || "-",
            "Status": item.status || "-",
            "Priority": item.priority || "-",
            "Assigned To": item.assignedTo?.name || "-",
            "Pipeline Stage": item.pipelineStage || "-",

            "Follow Up Date": item.followUpDate
                ? new Date(item.followUpDate).toLocaleDateString()
                : "-",

            "Total Remarks": item.remarksCount || 0,
            "Pending Follow Ups": item.pendingFollowUpsCount || 0,

            "Created At": item.createdAt
                ? new Date(item.createdAt).toLocaleString()
                : "-"
        }));

    if (isLoading) {
        return <Loading data={'Lead'} />;
    }

    return (
        <div className="min-h-screen bg-transparent">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header Section with Stats Cards */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] border border-gray-100 px-6 py-5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#2653ef] to-[#f5a524]" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                                <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#2653ef] to-[#1d40c9] flex items-center justify-center shadow-[0_6px_16px_rgba(38,83,239,0.3)]">
                                    <Users className="text-white" size={22} />
                                </span>
                                Lead Management
                            </h1>
                            <p className="text-gray-500 mt-1 text-sm ml-14">
                                Track and manage your sales pipeline effectively
                            </p>
                        </div>


                        <div className="flex gap-2">
                            <ExcelButton
                                data={leads}
                                fileName="Leads"
                                sheetName="Leads"
                                formatData={formatLeads}
                            >
                                Download Leads
                            </ExcelButton>

                            {profile?.role === 'admin' && (
                                <button
                                    onClick={() => navigate("/addLeads")}
                                    className="flex items-center gap-2 bg-gradient-to-r from-[#2653ef] to-[#1d40c9] text-white px-6 py-2.5 rounded-xl hover:shadow-[0_8px_20px_rgba(38,83,239,0.35)] hover:-translate-y-0.5 transition-all duration-200 text-sm font-semibold"
                                >
                                    <Plus size={18} />
                                    Add New Lead
                                </button>
                            )}
                        </div>

                        {/* Add Lead Button */}

                    </div>

                    {/* 4 Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Won Leads Card */}
                        <div
                            // onClick={() => setActiveSideTab('won')}
                            className={`cursor-pointer bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] p-5 border-2 transition-all hover:shadow-md ${activeSideTab === 'won'
                                ? 'border-emerald-500 bg-emerald-50/30 shadow-md'
                                : 'border-gray-100 hover:border-emerald-200'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                                    <Award size={24} className="text-emerald-600" />
                                </div>
                                <span className="text-3xl font-bold text-emerald-600">{wonLeads.length}</span>
                            </div>
                            <h3 className="text-gray-700 font-semibold text-lg">Won Leads</h3>
                            <p className="text-gray-400 text-xs mt-1">Successfully closed deals</p>
                        </div>

                        {/* Active Leads Card */}
                        <div
                            // onClick={() => setActiveSideTab('active')}
                            className={`cursor-pointer bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] p-5 border-2 transition-all hover:shadow-md ${activeSideTab === 'active'
                                ? 'border-blue-500 bg-blue-50/30 shadow-md'
                                : 'border-gray-100 hover:border-blue-200'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                                    <TrendingUp size={24} className="text-blue-600" />
                                </div>
                                <span className="text-3xl font-bold text-blue-600">{activeLeads.length}</span>
                            </div>
                            <h3 className="text-gray-700 font-semibold text-lg">Active Leads</h3>
                            <p className="text-gray-400 text-xs mt-1">In progress opportunities</p>
                        </div>

                        {/* Lost Leads Card */}
                        <div
                            // onClick={() => setActiveSideTab('lost')}
                            className={`cursor-pointer bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] p-5 border-2 transition-all hover:shadow-md ${activeSideTab === 'lost'
                                ? 'border-red-500 bg-red-50/30 shadow-md'
                                : 'border-gray-100 hover:border-red-200'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                                    <X size={24} className="text-red-600" />
                                </div>
                                <span className="text-3xl font-bold text-red-600">{lostLeads.length}</span>
                            </div>
                            <h3 className="text-gray-700 font-semibold text-lg">Lost Leads</h3>
                            <p className="text-gray-400 text-xs mt-1">Closed without success</p>
                        </div>

                        {/* Pending Leads Card */}
                        <div
                            // onClick={() => setActiveSideTab('pending')}
                            className={`cursor-pointer bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] p-5 border-2 transition-all hover:shadow-md ${activeSideTab === 'pending'
                                ? 'border-yellow-500 bg-yellow-50/30 shadow-md'
                                : 'border-gray-100 hover:border-yellow-200'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center">
                                    <Clock size={24} className="text-yellow-600" />
                                </div>
                                <span className="text-3xl font-bold text-yellow-600">{pendingLeads.length}</span>
                            </div>
                            <h3 className="text-gray-700 font-semibold text-lg">Pending Leads</h3>
                            <p className="text-gray-400 text-xs mt-1">Awaiting initial contact</p>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] p-4 border border-gray-100">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Search leads by name, phone, email or product..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2653ef] focus:border-transparent text-sm bg-gray-50"
                                />
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            </div>

                            {/* Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2.5 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600"
                            >
                                <Filter size={18} />
                                Filters
                                <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        {/* Advanced Filters */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-4 py-2 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2653ef] text-sm bg-gray-50"
                                    >
                                        <option value="">All Status</option>
                                        {leadStatus?.map((status) => (
                                            <option key={status.value} value={status.value}>
                                                {status.label || status.value}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="flex-1">
                                        <DateQuickFilter value={dateFilter} onChange={setDateFilter} compact />
                                    </div>
                                </div>

                                {/* Active Filters */}
                                {(statusFilter || dateFilter.preset !== "all") && (
                                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                                        <span className="text-xs text-gray-500">Active filters:</span>
                                        {statusFilter && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                                                Status: {statusFilter.replace('-', ' ')}
                                                <X size={12} className="cursor-pointer" onClick={() => setStatusFilter("")} />
                                            </span>
                                        )}
                                        {dateFilter.preset !== "all" && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                                                {dateFilter.preset === "custom"
                                                    ? `${dateFilter.startDate || '…'} to ${dateFilter.endDate || '…'}`
                                                    : DATE_PRESETS_LABEL[dateFilter.preset]}
                                                <X size={12} className="cursor-pointer" onClick={() => setDateFilter({ preset: "all", startDate: "", endDate: "" })} />
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
                            className="text-xs text-[#2653ef] hover:underline flex items-center gap-1"
                        >
                            <X size={12} />
                            Clear filter
                        </button>
                    )}
                </div>

                {/* Leads Table */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)]">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">#</th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Lead</th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Contact</th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Source</th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Assigned To</th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Next Follow Up</th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Remarks</th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLeads.map((lead, index) => (
                                    <tr key={lead._id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                                        <td className="px-4 py-3">
                                            <span className="text-gray-400 text-xs font-medium">
                                                {((currentPage - 1) * itemsPerPage + index + 1)}
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
                                            <div className="relative inline-block w-[108px]">

                                                {/* Status Chip */}
                                                <div
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-semibold cursor-pointer shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)]
                                                     ${getStatusColorStatus(lead.status)}`}
                                                >

                                                    {lead.status}


                                                    <ChevronDown size={14} className="opacity-70" />
                                                </div>

                                                {/* Hidden Select (overlay) */}
                                                <select
                                                    className="absolute inset-0 w-full h-full cursor-pointer 
                                                     appearance-none bg-transparent text-transparent pl-2 
                                                     focus:outline-none"
                                                    value={lead.status}
                                                    onChange={async (e) => {
                                                        const newStatus = e.target.value;
                                                        await handleStatusChange(lead._id, newStatus);
                                                    }}
                                                >
                                                    {leadStatus?.map((status) => (
                                                        <option
                                                            key={status.value}
                                                            value={status.value}
                                                            className="text-gray-800 bg-white text-[10px]"
                                                        >
                                                            {status.label || status.value}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <span className="text-xs text-gray-600">{lead.source || '—'}</span>
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
                                                {/* <Calendar size={12} className="text-gray-400" /> */}
                                                {formatDate(lead.followUpDate)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 ">
                                            <div onClick={() => { setViewLead(lead); setActiveTab('history') }} className="flex items-center gap-1 cursor-pointer">
                                                {/* <MessageCircle size={12} className="text-gray-400" /> */}
                                                <span className="text-xs text-gray-600">
                                                    {lead.remarksCount || 0} remarks
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    // onClick={() => setViewLead(lead)}
                                                    onClick={() => navigate(`/lead/${lead._id}`)}
                                                    className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {/* <button
                                                    onClick={() => navigate(`/editLead/${lead._id}`)}
                                                    className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition-all"
                                                    title="Edit Lead"
                                                >
                                                    <Edit2 size={16} />
                                                </button> */}
                                                {/* <button
                                                    onClick={() => setDeleteConfirmId(lead._id)}
                                                    className="w-8 h-8 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-all"
                                                    title="Delete Lead"
                                                >
                                                    <Trash2 size={16} />
                                                </button> */}
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
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2653ef] to-[#3b6cf6] text-white px-6 py-2.5 rounded-2xl hover:shadow-lg transition-all text-sm font-semibold"
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
                    <ConfirmModal
                        open={!!deleteConfirmId}
                        title="Delete Lead"
                        message="Are you sure you want to delete this lead? All associated remarks and history will be permanently removed."
                        onCancel={() => setDeleteConfirmId(null)}
                        onConfirm={() => handleDeleteLead(deleteConfirmId)}
                    />
                )}

                {/* Lead Detail Modal - Keep existing modal code */}


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
                                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
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
                                                <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-100 flex items-center justify-center mb-1">
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
                                                        {executives?.data?.find(e => e._id === selectedExecutive)?.name?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-medium text-green-700">
                                                    {executives?.data?.find(e => e._id === selectedExecutive)?.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
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
                                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleModalFieldSave('assignedTo', confirmAssignId);
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} />
                                        Confirm Transfer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-end mt-6">
                    {/* Info section */}


                    {/* Pagination buttons */}
                    <div className="flex items-center space-x-2">
                        {/* First Page Button */}
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={!PaginatedLeads?.pagination.hasPrevPage || isFetching}
                            className={`
                        relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-xl transition-all duration-200
                        ${!PaginatedLeads?.pagination.hasPrevPage || isFetching
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-200 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] hover:shadow'
                                }
                    `}
                            title="First Page"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Previous Button */}
                        <button
                            onClick={() => setCurrentPage(prev => prev - 1)}
                            disabled={!PaginatedLeads?.pagination.hasPrevPage || isFetching}
                            className={`
                        relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200
                        ${!PaginatedLeads?.pagination.hasPrevPage || isFetching
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-200 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] hover:shadow'
                                }
                    `}
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center space-x-1">
                            {(() => {
                                const currentPage = PaginatedLeads?.pagination.currentPage;
                                const totalPages = PaginatedLeads?.pagination.totalPages;
                                const maxVisible = 5;
                                let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                                let endPage = Math.min(totalPages, startPage + maxVisible - 1);

                                if (endPage - startPage + 1 < maxVisible) {
                                    startPage = Math.max(1, endPage - maxVisible + 1);
                                }

                                const pages = [];
                                for (let i = startPage; i <= endPage; i++) {
                                    pages.push(i);
                                }

                                return (
                                    <>
                                        {/* First page indicator if not in range */}
                                        {startPage > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setCurrentPage(1)}
                                                    disabled={isFetching}
                                                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all duration-200"
                                                >
                                                    1
                                                </button>
                                                {startPage > 2 && (
                                                    <span className="px-2 text-gray-500">...</span>
                                                )}
                                            </>
                                        )}

                                        {/* Page number buttons */}
                                        {pages.map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                disabled={isFetching}
                                                className={`
                                            relative px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200
                                            ${currentPage === page
                                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md transform scale-105'
                                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-200 hover:shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)]'
                                                    }
                                            ${isFetching ? 'cursor-wait opacity-50' : 'cursor-pointer'}
                                        `}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        {/* Last page indicator if not in range */}
                                        {endPage < totalPages && (
                                            <>
                                                {endPage < totalPages - 1 && (
                                                    <span className="px-2 text-gray-500">...</span>
                                                )}
                                                <button
                                                    onClick={() => setCurrentPage(totalPages)}
                                                    disabled={isFetching}
                                                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all duration-200"
                                                >
                                                    {totalPages}
                                                </button>
                                            </>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        {/* Next Button */}
                        <button
                            onClick={() => setCurrentPage(prev => prev + 1)}
                            disabled={!PaginatedLeads?.pagination.hasNextPage || isFetching}
                            className={`
                        relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200
                        ${!PaginatedLeads?.pagination.hasNextPage || isFetching
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-200 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] hover:shadow'
                                }
                    `}
                        >
                            Next
                            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Last Page Button */}
                        <button
                            onClick={() => setCurrentPage(PaginatedLeads?.pagination.totalPages)}
                            disabled={!PaginatedLeads?.pagination.hasNextPage || isFetching}
                            className={`
                        relative inline-flex items-center px-2 py-2 text-sm font-medium rounded-xl transition-all duration-200
                        ${!PaginatedLeads?.pagination.hasNextPage || isFetching
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-200 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] hover:shadow'
                                }
                    `}
                            title="Last Page"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>



        </div>
    );
}

export default LeadView;