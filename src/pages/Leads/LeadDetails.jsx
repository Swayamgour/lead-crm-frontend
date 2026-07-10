// LeadDetails.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    User,
    Phone,
    Mail,
    Tag,
    Users,
    Clock,
    MessageCircle,
    Plus,
    Calendar,
    ChevronDown,
    X,
    Edit2,
    Trash2,
    Check,
    AlertCircle,
    ArrowLeft,
    Download,
    MoreVertical,
    Building,
    MapPin,
    Package,
    IndianRupee,
    BarChart3,
    PhoneCall,
    MailOpen,
    UserX,
    Clock as ClockIcon,
    CheckCircle,
    AlertTriangle,
    Info,
    Send
} from "lucide-react";
import {
    useGetLeadByIdQuery,
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
import jsPDF from "jspdf";
import ConfirmModal from "../../components/ConfirmModal";

function LeadDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const pdfRef = useRef();

    // Queries
    const { data: leadData, isLoading: leadLoading, refetch: refetchLead } = useGetLeadByIdQuery(id);
    const { data: executives } = useGetUsersQuery();
    const { data: profile } = useGetProfileQuery();
    const { data: remarksData, refetch: refetchRemarks, isLoading: remarksLoading } = useGetLeadRemarksQuery(id, {
        skip: !id
    });

    // Mutations
    const [updateLead] = useUpdateLeadMutation();
    const [addRemark] = useAddRemarkMutation();
    const [editRemark] = useEditRemarkMutation();
    const [deleteRemark] = useDeleteRemarkMutation();

    // States
    const [activeTab, setActiveTab] = useState("details");
    const [showAddRemark, setShowAddRemark] = useState(false);
    const [newRemark, setNewRemark] = useState("");
    const [editingRemark, setEditingRemark] = useState(null);
    const [editRemarkText, setEditRemarkText] = useState("");
    const [modalSaving, setModalSaving] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [selectedExecutive, setSelectedExecutive] = useState("");
    const [isEditingFollowUp, setIsEditingFollowUp] = useState(false);
    const [followUpDate, setFollowUpDate] = useState("");

    const lead = leadData;
    const executivesList = executives?.data || [];

    // Set follow up date when lead loads
    useEffect(() => {
        if (lead) {
            setFollowUpDate(
                lead.followUpDate
                    ? new Date(lead.followUpDate).toISOString().split("T")[0]
                    : ""
            );
            setSelectedExecutive(lead.assignedTo?._id || lead.assignedTo || "");
        }
    }, [lead]);

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

    const formatDateShort = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'won': return 'bg-emerald-500 text-white';
            case 'lost': return 'bg-red-500 text-white';
            case 'incoming': return 'bg-blue-500 text-white';
            case 'interested': return 'bg-indigo-500 text-white';
            case 'ongoing': return 'bg-yellow-500 text-white';
            case 'cold': return 'bg-gray-400 text-white';
            case 'no response': return 'bg-orange-500 text-white';
            default: return 'bg-gray-200 text-gray-700';
        }
    };

    const getStatusIcon = (status) => {
        const s = status?.toLowerCase();
        switch (s) {
            case 'won': return <CheckCircle size={16} />;
            case 'lost': return <UserX size={16} />;
            case 'incoming': return <PhoneCall size={16} />;
            case 'interested': return <MailOpen size={16} />;
            case 'ongoing': return <ClockIcon size={16} />;
            default: return <Info size={16} />;
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const res = await updateLead({ id, status: newStatus });
            if (res?.data?.success) {
                toast.success("Status updated successfully");
                refetchLead();
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleUpdateFollowUp = async () => {
        if (!followUpDate) {
            toast.error("Please select a date");
            return;
        }
        setModalSaving(true);
        try {
            const res = await updateLead({ id, followUpDate });
            if (res?.data?.success) {
                toast.success("Follow up date updated successfully");
                refetchLead();
                setIsEditingFollowUp(false);
            } else {
                toast.error("Failed to update follow up date");
            }
        } catch (error) {
            toast.error("Error updating follow up date");
        } finally {
            setModalSaving(false);
        }
    };

    const handleReassign = async () => {
        if (!selectedExecutive) {
            toast.error("Please select an executive");
            return;
        }
        setModalSaving(true);
        try {
            const res = await updateLead({ id, assignedTo: selectedExecutive });
            if (res?.data?.success) {
                toast.success("Lead reassigned successfully");
                refetchLead();
                setShowReassignModal(false);
            }
        } catch (error) {
            toast.error("Failed to reassign lead");
        } finally {
            setModalSaving(false);
        }
    };

    const handleAddRemark = async () => {
        if (!newRemark.trim()) return;
        setModalSaving(true);
        try {
            const response = await addRemark({ leadId: id, text: newRemark.trim() });
            if (response?.data?.success) {
                setNewRemark("");
                setShowAddRemark(false);
                refetchRemarks();
                toast.success("Remark added successfully");
            }
        } catch (error) {
            toast.error("Error adding remark");
        } finally {
            setModalSaving(false);
        }
    };

    const handleEditRemark = async () => {
        if (!editRemarkText.trim() || !editingRemark) return;
        setModalSaving(true);
        try {
            const res = await editRemark({
                leadId: id,
                remarkId: editingRemark._id,
                text: editRemarkText.trim()
            }).unwrap();
            if (res?.success) {
                setEditingRemark(null);
                setEditRemarkText("");
                refetchRemarks();
                toast.success("Remark updated successfully");
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
            const res = await deleteRemark({ leadId: id, remarkId }).unwrap();
            if (res?.success) {
                refetchRemarks();
                toast.success("Remark deleted successfully");
            }
        } catch (error) {
            toast.error("Error deleting remark");
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const pdf = new jsPDF("p", "mm", "a4");
            let y = 10;

            pdf.setFontSize(18);
            pdf.text("Lead Report - " + (lead?.name || "Lead"), 10, y);
            y += 10;

            pdf.setFontSize(10);
            pdf.text("Phone: " + (lead?.phone || "N/A"), 10, y);
            y += 7;
            pdf.text("Email: " + (lead?.email || "N/A"), 10, y);
            y += 7;
            pdf.text("Status: " + (lead?.status || "N/A"), 10, y);
            y += 7;
            pdf.text("Source: " + (lead?.source || "N/A"), 10, y);
            y += 7;
            pdf.text("Follow Up: " + formatDateShort(lead?.followUpDate), 10, y);
            y += 10;

            pdf.setFontSize(14);
            pdf.text("Remarks", 10, y);
            y += 8;

            const remarks = remarksData?.remarks || [];
            remarks.forEach((item, index) => {
                const date = new Date(item.createdAt).toLocaleString();
                const text = `${index + 1}. ${item.text}`;
                const splitText = pdf.splitTextToSize(text, 180);
                pdf.setFontSize(10);
                pdf.text(splitText, 10, y);
                y += splitText.length * 5;
                pdf.setFontSize(8);
                pdf.setTextColor(100);
                pdf.text(`By: ${item.createdByName || "Unknown"} | ${date}`, 10, y);
                pdf.setTextColor(0);
                y += 8;
                if (y > 270) {
                    pdf.addPage();
                    y = 10;
                }
            });

            pdf.save("lead_remarks.pdf");
        } catch (error) {
            console.error("PDF Error:", error);
        }
    };

    // WhatsApp Message
    const sendWhatsApp = () => {
        const message = `Hi ${lead.name},%0A%0AThis is regarding your inquiry about ${lead.product || 'our products'}.%0A%0AWe would like to follow up on your requirement. Please let us know a convenient time to connect.%0A%0AThanks!`;
        const phone = lead.phone?.replace(/[^0-9]/g, '');
        if (phone) {
            window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
        } else {
            toast.error("No phone number available");
        }
    };

    if (leadLoading) {
        return <Loading data="Lead Details" />;
    }

    if (!lead) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">Lead not found</h2>
                    <p className="text-gray-400 mt-2">The lead you're looking for doesn't exist</p>
                    <button
                        onClick={() => navigate("/leads")}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <ArrowLeft size={18} />
                        Back to Leads
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate("/leads")}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
                            >
                                <ArrowLeft size={20} className="text-gray-500 group-hover:text-blue-600" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${getStatusColor(lead.status)}`}>
                                    {lead.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-900">{lead.name}</h1>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>{lead.phone}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span>{lead.email || "No email"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Status Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${getStatusColor(lead.status)} hover:shadow-lg`}
                                >
                                    {getStatusIcon(lead.status)}
                                    {lead.status}
                                    <ChevronDown size={16} className={`transition-transform ${showActionsMenu ? 'rotate-180' : ''}`} />
                                </button>
                                {showActionsMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 overflow-hidden">
                                        {leadStatus?.map((status) => (
                                            <button
                                                key={status.value}
                                                onClick={() => {
                                                    handleStatusChange(status.value);
                                                    setShowActionsMenu(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${lead.status === status.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                                            >
                                                {getStatusIcon(status.value)}
                                                {status.label || status.value}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* WhatsApp Button */}
                            <button
                                onClick={sendWhatsApp}
                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-all duration-200 hover:shadow-lg"
                            >
                                <Send size={16} />
                                WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Lead Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabs */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex border-b border-gray-100">
                                <button
                                    onClick={() => setActiveTab("details")}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === "details"
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    <User size={18} />
                                    Details
                                </button>
                                <button
                                    onClick={() => setActiveTab("remarks")}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === "remarks"
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    <MessageCircle size={18} />
                                    Remarks
                                    <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                        {remarksData?.remarks?.length || 0}
                                    </span>
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {activeTab === "details" && (
                                    <>
                                        {/* Info Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                                <Phone size={18} className="text-blue-500 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Phone</p>
                                                    <p className="text-sm font-semibold text-gray-900">{lead.phone || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                                <Mail size={18} className="text-blue-500 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Email</p>
                                                    <p className="text-sm font-semibold text-gray-900">{lead.email || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                                <Tag size={18} className="text-blue-500 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Source</p>
                                                    <p className="text-sm font-semibold text-gray-900 capitalize">{lead.source || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                                <Package size={18} className="text-blue-500 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Product</p>
                                                    <p className="text-sm font-semibold text-gray-900">{lead.product || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                                <IndianRupee size={18} className="text-blue-500 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Price / Budget</p>
                                                    <p className="text-sm font-semibold text-gray-900">{lead.price || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                                <Building size={18} className="text-blue-500 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Company</p>
                                                    <p className="text-sm font-semibold text-gray-900">{lead.company || "N/A"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                                <MapPin size={18} className="text-blue-500 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Location</p>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {lead.city || lead.state ? `${lead.city || ""} ${lead.state ? `, ${lead.state}` : ""}` : "N/A"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                                <Users size={18} className="text-blue-500 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Assigned To</p>
                                                    <p className="text-sm font-semibold text-gray-900">{lead.assignedTo?.name || "Unassigned"}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                                <Clock size={18} className="text-blue-500 mt-0.5" />
                                                <div>
                                                    <p className="text-xs text-gray-500 font-medium">Created At</p>
                                                    <p className="text-sm font-semibold text-gray-900">{formatDate(lead.createdAt)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        {lead.message && (
                                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-2">Customer Requirement</p>
                                                <p className="text-sm text-gray-800">{lead.message}</p>
                                            </div>
                                        )}


                                        <div className="flex justify-between items-center p-3 mt-4">

                                            {/* Follow Up Date Section */}
                                            <div className=" border-t border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium">Follow Up Date</p>
                                                        {isEditingFollowUp ? (
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <input
                                                                    type="date"
                                                                    value={followUpDate}
                                                                    onChange={(e) => setFollowUpDate(e.target.value)}
                                                                    className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
                                                                />
                                                                <button
                                                                    onClick={handleUpdateFollowUp}
                                                                    disabled={modalSaving}
                                                                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-1"
                                                                >
                                                                    {modalSaving ? (
                                                                        <>
                                                                            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                                            Saving...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Check size={14} />
                                                                            Save
                                                                        </>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setIsEditingFollowUp(false);
                                                                        setFollowUpDate(
                                                                            lead.followUpDate
                                                                                ? new Date(lead.followUpDate).toISOString().split("T")[0]
                                                                                : ""
                                                                        );
                                                                    }}
                                                                    className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 transition-all"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-sm font-semibold text-gray-900">
                                                                    {formatDateShort(lead.followUpDate)}
                                                                </span>
                                                                <button
                                                                    onClick={() => setIsEditingFollowUp(true)}
                                                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                                                >
                                                                    <Edit2 size={12} />
                                                                    Update
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Reassign Section */}
                                            {profile?.role === "admin" && (
                                                <div className=" border-t border-gray-100">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs text-gray-500 font-medium">Assigned To</p>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-sm font-semibold text-gray-900">
                                                                    {lead.assignedTo?.name || "Unassigned"}
                                                                </span>
                                                                <button
                                                                    onClick={() => setShowReassignModal(true)}
                                                                    className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                                                                >
                                                                    <Users size={12} />
                                                                    Reassign
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {activeTab === "remarks" && (
                                    <div ref={pdfRef}>
                                        {/* Add Remark Button */}
                                        {!showAddRemark && !editingRemark && (
                                            <button
                                                onClick={() => setShowAddRemark(true)}
                                                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 hover:border-blue-400 transition-all mb-4"
                                            >
                                                <Plus size={18} />
                                                Add New Remark
                                            </button>
                                        )}

                                        {/* Add Remark Form */}
                                        {showAddRemark && (
                                            <div className="bg-blue-50/50 rounded-xl p-4 mb-4 border border-blue-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">New Remark</span>
                                                    <button
                                                        onClick={() => {
                                                            setShowAddRemark(false);
                                                            setNewRemark("");
                                                        }}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                                <textarea
                                                    className="w-full p-3 border border-blue-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
                                                    placeholder="Write your remark..."
                                                    value={newRemark}
                                                    onChange={e => setNewRemark(e.target.value)}
                                                    rows={3}
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button
                                                        onClick={() => {
                                                            setShowAddRemark(false);
                                                            setNewRemark("");
                                                        }}
                                                        className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleAddRemark}
                                                        disabled={modalSaving || !newRemark.trim()}
                                                        className="px-4 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        {modalSaving ? (
                                                            <>
                                                                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
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
                                            <div className="bg-yellow-50 rounded-xl p-4 mb-4 border border-yellow-200">
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
                                                    className="w-full p-3 border border-yellow-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none bg-white"
                                                    value={editRemarkText}
                                                    onChange={e => setEditRemarkText(e.target.value)}
                                                    rows={3}
                                                    autoFocus
                                                />
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button
                                                        onClick={() => setEditingRemark(null)}
                                                        className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleEditRemark}
                                                        disabled={modalSaving || !editRemarkText.trim()}
                                                        className="px-4 py-2 text-xs bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                                                    >
                                                        {modalSaving ? (
                                                            <>
                                                                <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
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
                                        <div className="space-y-3">
                                            {remarksLoading ? (
                                                <div className="text-center py-8 text-sm text-gray-500">
                                                    <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                                                    Loading remarks...
                                                </div>
                                            ) : remarksData?.remarks?.length > 0 ? (
                                                remarksData.remarks.map((remark) => (
                                                    <div
                                                        key={remark._id}
                                                        className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow"
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1">
                                                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{remark.text}</p>
                                                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                                    <span>By: <span className="font-medium text-blue-600">{remark.createdByName}</span></span>
                                                                    <span>•</span>
                                                                    <span>{formatDate(remark.createdAt)}</span>
                                                                    {remark.isEdited && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span className="text-yellow-600 flex items-center gap-1">
                                                                                <Edit2 size={10} />
                                                                                Edited
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                                {profile?.role === "admin" && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingRemark(remark);
                                                                            setEditRemarkText(remark.text);
                                                                            setShowAddRemark(false);
                                                                        }}
                                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit2 size={14} />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDeleteRemark(remark._id)}
                                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-12">
                                                    <MessageCircle size={48} className="text-gray-300 mx-auto mb-3" />
                                                    <p className="text-sm text-gray-500">No remarks yet</p>
                                                    <p className="text-xs text-gray-400 mt-1">Click "Add New Remark" to add your first note</p>
                                                </div>
                                            )}
                                        </div>

                                        {remarksData?.remarks?.length > 0 && (
                                            <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={handleDownloadPDF}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-semibold hover:bg-red-600 transition-all"
                                                >
                                                    <Download size={14} />
                                                    Download PDF
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Stats & Quick Actions */}
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <BarChart3 size={18} className="text-blue-500" />
                                Lead Statistics
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm text-gray-600">Total Remarks</span>
                                    <span className="text-lg font-bold text-blue-600">{remarksData?.remarks?.length || 0}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm text-gray-600">Created</span>
                                    <span className="text-sm font-medium text-gray-800">{formatDateShort(lead.createdAt)}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm text-gray-600">Follow Up</span>
                                    <span className="text-sm font-medium text-gray-800">{formatDateShort(lead.followUpDate)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                {/* <Target size={18} className="text-blue-500" /> */}
                                Quick Actions
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setActiveTab("remarks")}
                                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all duration-200 text-sm text-gray-700 hover:text-blue-600"
                                >
                                    <MessageCircle size={18} className="text-blue-500" />
                                    View All Remarks
                                </button>
                                <button
                                    onClick={sendWhatsApp}
                                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-green-50 rounded-xl transition-all duration-200 text-sm text-gray-700 hover:text-green-600"
                                >
                                    <Send size={18} className="text-green-500" />
                                    Send WhatsApp Message
                                </button>
                                {profile?.role === "admin" && (
                                    <button
                                        onClick={() => setShowReassignModal(true)}
                                        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-purple-50 rounded-xl transition-all duration-200 text-sm text-gray-700 hover:text-purple-600"
                                    >
                                        <Users size={18} className="text-purple-500" />
                                        Reassign Executive
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reassign Modal */}
            {showReassignModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                    <Users className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Reassign Lead</h3>
                                    <p className="text-sm text-white/90">Assign to a different executive</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Select Executive
                                </label>
                                <select
                                    value={selectedExecutive}
                                    onChange={(e) => setSelectedExecutive(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                                >
                                    <option value="">Select Executive</option>
                                    {executivesList.map(exec => (
                                        <option key={exec._id} value={exec._id}>
                                            {exec.name} {exec.phone ? `(${exec.phone})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                                <div className="flex gap-2">
                                    <AlertTriangle size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-purple-800">
                                        This will transfer the lead to the selected executive. All remarks and history will remain intact.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowReassignModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReassign}
                                    disabled={modalSaving}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl text-sm font-semibold hover:from-purple-600 hover:to-indigo-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {modalSaving ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Reassigning...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            Confirm Reassign
                                        </>
                                    )}
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