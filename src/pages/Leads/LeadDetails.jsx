import { useState } from "react";
import {
    User,
    Phone,
    Mail,
    Tag,
    Users,
    Clock,
    MessageCircle,
    Calendar,
    X,
    Edit2,
    Trash2,
    History,
    Check,
    AlertCircle,
    ArrowRight,
    Building2,
    DollarSign,
    MapPin,
    Globe,
    Linkedin,
    Twitter,
    FileText,
    RefreshCw,
    Send,
    MoreVertical,
    ChevronLeft,
    Star,
    TrendingUp,
    Activity,
    Briefcase,
    Award
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
    useGetLeadQuery,
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
import Loading from "../../components/Loading";

function LeadDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: leadData, isLoading: leadLoading, refetch: refetchLead } = useGetLeadQuery(id);
    const { data: Executive } = useGetUsersQuery();
    const { data: profile } = useGetProfileQuery();
    const [updateLead] = useUpdateLeadMutation();

    // Remarks
    const [addRemark] = useAddRemarkMutation();
    const [editRemark] = useEditRemarkMutation();
    const [deleteRemark] = useDeleteRemarkMutation();
    const { data: remarksData, refetch: refetchRemarks } = useGetLeadRemarksQuery(id);

    const lead = leadData?.lead;
    const executives = Executive || [];

    // States
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [newRemark, setNewRemark] = useState("");
    const [editingRemark, setEditingRemark] = useState(null);
    const [editRemarkText, setEditRemarkText] = useState("");
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [selectedExecutive, setSelectedExecutive] = useState("");
    const [modalSaving, setModalSaving] = useState(false);
    const [activeHistoryTab, setActiveHistoryTab] = useState("remarks"); // 'remarks' or 'activity'

    if (leadLoading) {
        return <Loading data={"Lead Details"} />;
    }

    if (!lead) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Lead Not Found</h2>
                    <p className="text-gray-500 mb-4">The lead you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate("/leads")}
                        className="px-4 py-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white rounded-lg hover:shadow-lg transition-all"
                    >
                        Back to Leads
                    </button>
                </div>
            </div>
        );
    }

    const handleFieldUpdate = async (field, value) => {
        setModalSaving(true);
        try {
            const res = await updateLead({ id: lead._id, [field]: value });
            if (res?.data?.success) {
                refetchLead();
                toast.success(`${field} updated successfully`);
                setIsEditing(false);
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
        if (!newRemark.trim()) return;
        setModalSaving(true);
        try {
            const response = await addRemark({
                leadId: lead._id,
                text: newRemark.trim()
            });
            if (response?.data?.success) {
                setNewRemark("");
                refetchRemarks();
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

    const handleEditRemark = async () => {
        if (!editRemarkText.trim()) return;
        setModalSaving(true);
        try {
            const res = await editRemark({
                leadId: lead._id,
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
        if (!window.confirm("Are you sure you want to delete this remark?")) return;
        try {
            const res = await deleteRemark({
                leadId: lead._id,
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
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateOnly = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            'incoming': 'bg-blue-100 text-blue-800 border-blue-200',
            'contacted': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'follow-up': 'bg-purple-100 text-purple-800 border-purple-200',
            'qualified': 'bg-green-100 text-green-800 border-green-200',
            'proposal': 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'negotiation': 'bg-orange-100 text-orange-800 border-orange-200',
            'closed-won': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'closed-lost': 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'closed-won': return <Award size={16} />;
            case 'closed-lost': return <AlertCircle size={16} />;
            case 'qualified': return <TrendingUp size={16} />;
            default: return <Activity size={16} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header with Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate("/leads")}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 group"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back to Leads</span>
                    </button>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#6366f1] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {lead.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{lead.name}</h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                                        {getStatusIcon(lead.status)}
                                        {lead.status?.replace('-', ' ').toUpperCase()}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Lead ID: #{lead._id?.slice(-6)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                            >
                                <Edit2 size={18} />
                                Edit
                            </button>
                            <button
                                onClick={() => setShowReassignModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white rounded-xl hover:shadow-lg transition-all"
                            >
                                <RefreshCw size={18} />
                                Reassign
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content - Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Lead Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <User size={20} className="text-[#4f46e5]" />
                                    Basic Information
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                defaultValue={lead.name}
                                                onBlur={(e) => handleFieldUpdate('name', e.target.value)}
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                                            />
                                        ) : (
                                            <p className="mt-1 text-gray-900 font-medium">{lead.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                            <Phone size={12} />
                                            Phone Number
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                defaultValue={lead.phone}
                                                onBlur={(e) => handleFieldUpdate('phone', e.target.value)}
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                                            />
                                        ) : (
                                            <p className="mt-1 text-gray-900">{lead.phone}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                            <Mail size={12} />
                                            Email Address
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                defaultValue={lead.email}
                                                onBlur={(e) => handleFieldUpdate('email', e.target.value)}
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                                            />
                                        ) : (
                                            <p className="mt-1 text-gray-900">{lead.email || '—'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                            <Tag size={12} />
                                            Source
                                        </label>
                                        {isEditing ? (
                                            <select
                                                defaultValue={lead.source}
                                                onChange={(e) => handleFieldUpdate('source', e.target.value)}
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                                            >
                                                <option value="website">Website</option>
                                                <option value="referral">Referral</option>
                                                <option value="social_media">Social Media</option>
                                                <option value="cold_call">Cold Call</option>
                                                <option value="email">Email</option>
                                            </select>
                                        ) : (
                                            <p className="mt-1 text-gray-900 capitalize">{lead.source || '—'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Briefcase size={20} className="text-[#4f46e5]" />
                                    Additional Information
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product/Service</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                defaultValue={lead.product}
                                                onBlur={(e) => handleFieldUpdate('product', e.target.value)}
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                                            />
                                        ) : (
                                            <p className="mt-1 text-gray-900">{lead.product || '—'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                            <DollarSign size={12} />
                                            Budget
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                defaultValue={lead.budget}
                                                onBlur={(e) => handleFieldUpdate('budget', e.target.value)}
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                                            />
                                        ) : (
                                            <p className="mt-1 text-gray-900">{lead.budget ? `₹${lead.budget}` : '—'}</p>
                                        )}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</label>
                                        {isEditing ? (
                                            <textarea
                                                defaultValue={lead.address}
                                                onBlur={(e) => handleFieldUpdate('address', e.target.value)}
                                                rows="2"
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                                            />
                                        ) : (
                                            <p className="mt-1 text-gray-900">{lead.address || '—'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status & Follow-up Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Activity size={20} className="text-[#4f46e5]" />
                                    Status & Timeline
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                            <TrendingUp size={12} />
                                            Current Status
                                        </label>
                                        <select
                                            className={`mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] ${getStatusColor(lead.status)}`}
                                            value={lead.status}
                                            onChange={(e) => handleFieldUpdate('status', e.target.value)}
                                        >
                                            {leadStatus?.map((status) => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label || status.value}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                            <Calendar size={12} />
                                            Follow-up Date
                                        </label>
                                        <input
                                            type="date"
                                            defaultValue={lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : ''}
                                            onBlur={(e) => handleFieldUpdate('followUpDate', e.target.value)}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Created At</label>
                                        <p className="mt-1 text-gray-900">{formatDate(lead.createdAt)}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Updated</label>
                                        <p className="mt-1 text-gray-900">{formatDate(lead.updatedAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Assigned To Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Users size={20} className="text-[#4f46e5]" />
                                    Assignment
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                                            {lead.assignedTo?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{lead.assignedTo?.name || 'Unassigned'}</p>
                                            <p className="text-xs text-gray-500">{lead.assignedTo?.email || 'No executive assigned'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowReassignModal(true)}
                                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        Reassign
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - History & Remarks */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Tabs for History */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
                            <div className="border-b border-gray-100">
                                <div className="flex">
                                    <button
                                        onClick={() => setActiveHistoryTab("remarks")}
                                        className={`flex-1 px-4 py-3 text-sm font-medium transition-all relative ${activeHistoryTab === "remarks"
                                                ? "text-[#4f46e5]"
                                                : "text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <MessageCircle size={16} />
                                            Remarks
                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                                {remarksData?.remarks?.length || 0}
                                            </span>
                                        </div>
                                        {activeHistoryTab === "remarks" && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#4f46e5] to-[#6366f1]"></div>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setActiveHistoryTab("activity")}
                                        className={`flex-1 px-4 py-3 text-sm font-medium transition-all relative ${activeHistoryTab === "activity"
                                                ? "text-[#4f46e5]"
                                                : "text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <History size={16} />
                                            Activity
                                        </div>
                                        {activeHistoryTab === "activity" && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#4f46e5] to-[#6366f1]"></div>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 max-h-[calc(100vh-200px)] overflow-y-auto">
                                {activeHistoryTab === "remarks" ? (
                                    <div className="space-y-4">
                                        {/* Add Remark Input */}
                                        <div className="flex gap-2">
                                            <textarea
                                                placeholder="Write a remark..."
                                                value={newRemark}
                                                onChange={(e) => setNewRemark(e.target.value)}
                                                rows="2"
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] resize-none text-sm"
                                            />
                                            <button
                                                onClick={handleAddRemark}
                                                disabled={!newRemark.trim() || modalSaving}
                                                className="self-end px-3 py-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>

                                        {/* Remarks List */}
                                        <div className="space-y-3 mt-4">
                                            {remarksData?.remarks?.length > 0 ? (
                                                remarksData.remarks.map((remark) => (
                                                    <div key={remark._id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                                        {editingRemark?._id === remark._id ? (
                                                            <div>
                                                                <textarea
                                                                    value={editRemarkText}
                                                                    onChange={(e) => setEditRemarkText(e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] text-sm"
                                                                    rows="2"
                                                                />
                                                                <div className="flex gap-2 mt-2">
                                                                    <button
                                                                        onClick={handleEditRemark}
                                                                        className="px-3 py-1 text-xs bg-[#4f46e5] text-white rounded-lg"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingRemark(null)}
                                                                        className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-lg"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <p className="text-sm text-gray-800">{remark.text}</p>
                                                                <div className="flex items-center justify-between mt-2">
                                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                        <span className="font-medium text-[#4f46e5]">{remark.createdByName}</span>
                                                                        <span>•</span>
                                                                        <span>{formatDate(remark.createdAt)}</span>
                                                                        {remark.isEdited && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <span className="text-yellow-600">Edited</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingRemark(remark);
                                                                                setEditRemarkText(remark.text);
                                                                            }}
                                                                            className="p-1 text-gray-400 hover:text-[#4f46e5] transition-colors"
                                                                        >
                                                                            <Edit2 size={12} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteRemark(remark._id)}
                                                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8">
                                                    <MessageCircle size={32} className="text-gray-300 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500">No remarks yet</p>
                                                    <p className="text-xs text-gray-400 mt-1">Add your first remark above</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Activity Timeline */}
                                        <div className="relative">
                                            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>

                                            {/* Status Changes */}
                                            {lead.history?.status?.map((item, idx) => (
                                                <div key={`status-${idx}`} className="relative pl-10 pb-4">
                                                    <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                                                    <div className="bg-blue-50 rounded-lg p-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <TrendingUp size={14} className="text-blue-600" />
                                                            <span className="text-xs font-semibold text-blue-700">Status Changed</span>
                                                        </div>
                                                        <p className="text-sm text-gray-700">
                                                            Changed from <span className="font-medium">{item.oldValue}</span> to{' '}
                                                            <span className="font-medium">{item.newValue}</span>
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            By {item.changedByName} • {formatDate(item.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Assignment Changes */}
                                            {lead.history?.assignment?.map((item, idx) => (
                                                <div key={`assign-${idx}`} className="relative pl-10 pb-4">
                                                    <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                                                    <div className="bg-green-50 rounded-lg p-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Users size={14} className="text-green-600" />
                                                            <span className="text-xs font-semibold text-green-700">Reassigned</span>
                                                        </div>
                                                        <p className="text-sm text-gray-700">
                                                            Lead assigned to new executive
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            By {item.changedByName} • {formatDate(item.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Creation Event */}
                                            <div className="relative pl-10">
                                                <div className="absolute left-2 top-1 w-4 h-4 rounded-full bg-purple-500 border-2 border-white"></div>
                                                <div className="bg-purple-50 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User size={14} className="text-purple-600" />
                                                        <span className="text-xs font-semibold text-purple-700">Lead Created</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">Lead was added to the system</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatDate(lead.createdAt)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* No Activity */}
                                            {(!lead.history?.status?.length && !lead.history?.assignment?.length) && (
                                                <div className="text-center py-8">
                                                    <History size={32} className="text-gray-300 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500">No activity recorded yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reassign Modal */}
            {showReassignModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#4f46e5] to-[#6366f1] px-6 py-4">
                            <h3 className="text-lg font-semibold text-white">Reassign Lead</h3>
                            <p className="text-sm text-white/90">Select a new executive for this lead</p>
                        </div>
                        <div className="p-6">
                            <select
                                value={selectedExecutive}
                                onChange={(e) => setSelectedExecutive(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4f46e5] mb-4"
                            >
                                <option value="">Select Executive</option>
                                {executives.map((exec) => (
                                    <option key={exec._id} value={exec._id}>
                                        {exec.name} ({exec.email})
                                    </option>
                                ))}
                            </select>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowReassignModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedExecutive) {
                                            handleFieldUpdate('assignedTo', selectedExecutive);
                                            setShowReassignModal(false);
                                        }
                                    }}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white rounded-lg hover:shadow-lg"
                                >
                                    Reassign
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LeadDetails;