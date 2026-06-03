import React, { useState } from "react";
import {
    Phone,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    Calendar,
    Clock,
    Filter,
    Search,
    CheckCircle,
    XCircle,
    AlertCircle,
    PhoneCall,
    Mail,
    CalendarClock,
    UserCircle,
    RefreshCw,
    Edit2,
    Save,
    X,
    Users,
    Plus,
    TrendingUp,
    Award,
    Target,
    ArrowRight,
    Eye,
    UserCheck,
    CalendarDays,
    FileText,
    History,
    MessageSquare,
    Star,
    Sparkles,
    Send
} from "lucide-react";
import { useGetFollowUpsQuery, useUpdateLeadMutation, useAddRemarkMutation, useGetUsersQuery, useGetLeadRemarksQuery } from "../../redux/api";
import Loading from "../../components/Loading";
import toast from "react-hot-toast";
import { leadStatus } from "../../components/data";

function FollowUps() {
    const { data, isLoading, refetch: refetchFollowups } = useGetFollowUpsQuery();
    const [updateLead] = useUpdateLeadMutation();
    const [addRemark] = useAddRemarkMutation();
    const { data: executives } = useGetUsersQuery();

    const followups = data || [];

    const [expandedLead, setExpandedLead] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState("table");

    // Modal states for editing
    const [editingLead, setEditingLead] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        status: '',
        followUpDate: '',
        assignedTo: ''
    });
    const [newRemark, setNewRemark] = useState('');
    const [showAddRemark, setShowAddRemark] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("edit"); // 'edit' or 'remarks'

    // Fetch remarks for selected lead
    const { data: remarksData, refetch: refetchRemarks } = useGetLeadRemarksQuery(editingLead?.lead?._id, {
        skip: !editingLead?.lead?._id
    });

    /* ---------------------------
       GROUP FOLLOWUPS BY LEAD
    ----------------------------*/
    const groupedFollowups = Object.values(
        followups.reduce((acc, item) => {
            const leadId = item?.leadId?._id;
            if (!acc[leadId]) {
                acc[leadId] = {
                    lead: item.leadId,
                    history: []
                };
            }
            acc[leadId].history.push(item);
            return acc;
        }, {})
    );

    /* ---------------------------
       GET NEXT FOLLOWUP
    ----------------------------*/
    const getNextFollowUp = (history) => {
        const today = new Date();
        const upcoming = history
            .filter(h => new Date(h.followUpDate) >= today)
            .sort((a, b) => new Date(a.followUpDate) - new Date(b.followUpDate));
        return upcoming[0] || history[0];
    };

    /* ---------------------------
       STATUS CONFIGURATION
    ----------------------------*/
    const getStatusConfig = (status) => {
        const config = {
            pending: {
                color: "bg-amber-50 text-amber-700 border-amber-200",
                icon: <Clock size={12} className="mr-1" />,
                label: "Pending",
                bg: "bg-amber-100",
                text: "text-amber-700",
                dot: "bg-amber-500"
            },
            completed: {
                color: "bg-emerald-50 text-emerald-700 border-emerald-200",
                icon: <CheckCircle size={12} className="mr-1" />,
                label: "Completed",
                bg: "bg-emerald-100",
                text: "text-emerald-700",
                dot: "bg-emerald-500"
            },
            missed: {
                color: "bg-rose-50 text-rose-700 border-rose-200",
                icon: <XCircle size={12} className="mr-1" />,
                label: "Missed",
                bg: "bg-rose-100",
                text: "text-rose-700",
                dot: "bg-rose-500"
            }
        };
        return config[status] || config.pending;
    };

    /* ---------------------------
       LEAD STATUS CONFIGURATION
    ----------------------------*/
    const getLeadStatusColor = (status) => {
        if (!status) return 'bg-gray-100 text-gray-800';

        const normalized = status.trim().toLowerCase();

        const colors = {
            'incoming': 'bg-blue-100 text-blue-800',
            'contacted': 'bg-yellow-100 text-yellow-800',
            'follow-up': 'bg-purple-100 text-purple-800',
            'qualified': 'bg-green-100 text-green-800',
            'proposal': 'bg-indigo-100 text-indigo-800',
            'negotiation': 'bg-orange-100 text-orange-800',

            // 🔥 YOUR API VALUES
            'won': 'bg-emerald-100 text-emerald-800',
            'lost': 'bg-red-100 text-red-800',
            'cold': 'bg-gray-200 text-gray-700',
            'no response': 'bg-gray-300 text-gray-800'
        };

        return colors[normalized] || 'bg-gray-100 text-gray-800';
    };

    /* ---------------------------
       TYPE ICONS
    ----------------------------*/
    const getTypeIcon = (type, size = 16) => {
        const icons = {
            call: <PhoneCall size={size} className="text-blue-500" />,
            meeting: <UserCircle size={size} className="text-purple-500" />,
            whatsapp: <MessageCircle size={size} className="text-green-500" />,
            email: <Mail size={size} className="text-orange-500" />
        };
        return icons[type] || <Clock size={size} className="text-gray-500" />;
    };

    /* ---------------------------
       HANDLE UPDATE LEAD
    ----------------------------*/
    const handleUpdateLead = async () => {
        if (!editingLead) return;

        setSaving(true);
        try {
            const updateData = {};
            if (editFormData.status !== editingLead.lead.status) {
                updateData.status = editFormData.status;
            }
            if (editFormData.followUpDate !== editingLead.lead.followUpDate) {
                updateData.followUpDate = editFormData.followUpDate;
            }
            if (editFormData.assignedTo !== (editingLead.lead.assignedTo?._id || editingLead.lead.assignedTo)) {
                updateData.assignedTo = editFormData.assignedTo;
            }

            if (Object.keys(updateData).length > 0) {
                const res = await updateLead({ id: editingLead.lead._id, ...updateData }).unwrap();
                if (res?.success) {
                    toast.success("Lead updated successfully");
                    refetchFollowups();
                    setShowEditModal(false);
                    setEditingLead(null);
                } else {
                    toast.error("Failed to update lead");
                }
            } else {
                setShowEditModal(false);
                toast.info("No changes made");
            }
        } catch (error) {
            toast.error("Error updating lead");
        } finally {
            setSaving(false);
        }
    };

    /* ---------------------------
       HANDLE ADD REMARK
    ----------------------------*/
    const handleAddRemark = async () => {
        if (!newRemark.trim() || !editingLead) {
            toast.error("Please enter a remark");
            return;
        }

        setSaving(true);
        try {
            const res = await addRemark({
                leadId: editingLead.lead._id,
                text: newRemark.trim()
            }).unwrap();

            if (res?.success) {
                toast.success("Remark added successfully");
                setNewRemark('');
                setShowAddRemark(false);
                refetchRemarks();
                refetchFollowups();
            } else {
                toast.error("Failed to add remark");
            }
        } catch (error) {
            toast.error("Error adding remark");
        } finally {
            setSaving(false);
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

    const openEditModal = (item) => {
        const next = getNextFollowUp(item.history);
        setEditingLead(item);
        setEditFormData({
            status: item.lead?.status || 'incoming',
            followUpDate: next?.followUpDate
                ? new Date(next.followUpDate).toISOString().split('T')[0]
                : '',
            assignedTo: item?.history?.[0]?.assignedTo?._id ||
                item?.history?.[0]?.assignedTo ||
                ''
        });
        setActiveTab("edit");
        setShowAddRemark(false);
        setNewRemark('');
        setShowEditModal(true);
    };

    /* ---------------------------
       FILTER FOLLOWUPS
    ----------------------------*/
    const filteredFollowups = groupedFollowups.filter(item => {
        const matchesSearch =
            item.lead?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.lead?.phone?.includes(searchTerm) ||
            item.lead?.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            filterStatus === "all" ||
            item.history.some(h => h.status === filterStatus);

        const matchesType =
            filterType === "all" ||
            item.history.some(h => h.type === filterType);

        return matchesSearch && matchesStatus && matchesType;
    });

    /* ---------------------------
       STATISTICS
    ----------------------------*/
    const totalFollowUps = followups.length;
    const pendingCount = followups.filter(f => f.status === "pending").length;
    const completedCount = followups.filter(f => f.status === "completed").length;
    const missedCount = followups.filter(f => f.status === "missed").length;
    const overdueCount = followups.filter(f =>
        f.status === "pending" && new Date(f.followUpDate) < new Date()
    ).length;

    /* ---------------------------
       LOADING STATE
    ----------------------------*/
    if (isLoading) {
        return <Loading data={'Follow ups'} />;
    }

    /* ---------------------------
       MAIN RENDER
    ----------------------------*/
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
            <div className="max-w-7xl mx-auto p-6">

                {/* HEADER SECTION */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <CalendarClock size={20} className="text-white" />
                                </div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    Follow-ups
                                </h1>
                            </div>
                            <p className="text-gray-500 mt-1 text-sm">
                                Track and manage all your lead follow-ups efficiently
                            </p>
                        </div>
                    </div>

                    {/* STATISTICS CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                        <StatCard title="Total Follow-ups" value={totalFollowUps} icon={<CalendarClock size={20} />} bgColor="bg-blue-50" textColor="text-blue-600" />
                        <StatCard title="Pending" value={pendingCount} icon={<Clock size={20} />} bgColor="bg-amber-50" textColor="text-amber-600" />
                        <StatCard title="Completed" value={completedCount} icon={<CheckCircle size={20} />} bgColor="bg-emerald-50" textColor="text-emerald-600" />
                        <StatCard title="Missed" value={missedCount} icon={<XCircle size={20} />} bgColor="bg-rose-50" textColor="text-rose-600" />
                        <StatCard title="Overdue" value={overdueCount} icon={<AlertCircle size={20} />} bgColor="bg-red-50" textColor="text-red-600" isUrgent={overdueCount > 0} />
                    </div>

                    {/* FILTERS SECTION */}
                    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 backdrop-blur-sm">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by name, phone or email..."
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 hover:bg-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="relative min-w-[160px]">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 appearance-none bg-gray-50 hover:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="missed">Missed</option>
                                </select>
                            </div>
                            <div className="relative min-w-[160px]">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 appearance-none bg-gray-50 hover:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                                >
                                    <option value="all">All Types</option>
                                    <option value="call">Call</option>
                                    <option value="meeting">Meeting</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="email">Email</option>
                                </select>
                            </div>
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setFilterStatus("all");
                                    setFilterType("all");
                                }}
                                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all text-gray-700 flex items-center gap-2 group"
                            >
                                <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-300" />
                                <span className="text-sm font-medium">Reset</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* CONTENT SECTION */}
                <TableView
                    filteredFollowups={filteredFollowups}
                    expandedLead={expandedLead}
                    setExpandedLead={setExpandedLead}
                    getNextFollowUp={getNextFollowUp}
                    getStatusConfig={getStatusConfig}
                    getLeadStatusColor={getLeadStatusColor}
                    getTypeIcon={getTypeIcon}
                    openEditModal={openEditModal}
                    saving={saving}
                />
            </div>

            {/* EDIT MODAL WITH REMARKS */}
            {showEditModal && editingLead && (
                <EditLeadModal
                    editingLead={editingLead}
                    editFormData={editFormData}
                    setEditFormData={setEditFormData}
                    handleUpdateLead={handleUpdateLead}
                    setShowEditModal={setShowEditModal}
                    saving={saving}
                    executives={executives}
                    getLeadStatusColor={getLeadStatusColor}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    remarksData={remarksData}
                    newRemark={newRemark}
                    setNewRemark={setNewRemark}
                    showAddRemark={showAddRemark}
                    setShowAddRemark={setShowAddRemark}
                    handleAddRemark={handleAddRemark}
                    formatDate={formatDate}
                    getTypeIcon={getTypeIcon}
                    getStatusConfig={getStatusConfig}
                />
            )}
        </div>
    );
}

/* ======================
   STAT CARD COMPONENT
====================== */
const StatCard = ({ title, value, icon, bgColor, textColor, isUrgent }) => (
    <div className={`bg-white rounded-2xl shadow-sm p-5 hover:shadow-lg transition-all duration-300 border border-gray-100 group ${isUrgent ? 'animate-pulse' : ''}`}>
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <div className={textColor}>{icon}</div>
            </div>
        </div>
        {isUrgent && (
            <div className="mt-3 pt-2 border-t border-red-100">
                <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={10} />
                    Requires immediate attention
                </p>
            </div>
        )}
    </div>
);

/* ======================
   TABLE VIEW COMPONENT
====================== */
const TableView = ({
    filteredFollowups,
    expandedLead,
    setExpandedLead,
    getNextFollowUp,
    getStatusConfig,
    getLeadStatusColor,
    getTypeIcon,
    openEditModal,
    saving,
}) => {
    const getReminderDays = (date) => {
        if (!date) return null;
        const today = new Date();
        const followDate = new Date(date);
        today.setHours(0, 0, 0, 0);
        followDate.setHours(0, 0, 0, 0);
        const diffTime = followDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { text: `${Math.abs(diffDays)}d overdue`, color: "bg-red-100 text-red-700", icon: <AlertCircle size={10} className="mr-1" /> };
        } else if (diffDays === 0) {
            return { text: "Due today", color: "bg-yellow-100 text-yellow-700", icon: <Clock size={10} className="mr-1" /> };
        } else {
            return { text: `${diffDays}d left`, color: "bg-green-100 text-green-700", icon: <Calendar size={10} className="mr-1" /> };
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lead</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lead Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Next Follow-up</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Days</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredFollowups.map((item, index) => {
                            const next = getNextFollowUp(item.history);
                            const statusConfig = getStatusConfig(next.status);
                            const isExpanded = expandedLead === item.lead._id;
                            const reminderDays = getReminderDays(next.followUpDate);

                            return (
                                <React.Fragment key={item.lead._id}>
                                    <tr className={`hover:bg-gray-50 transition-all duration-200 ${isExpanded ? 'bg-indigo-50/50' : ''}`}>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {index + 1}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-semibold text-gray-900">{item.lead.name}</div>
                                                <div className="text-xs text-gray-500">{item.lead.product || 'No product'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-800 font-medium">{item.lead.phone}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-[150px]">{item.lead.email || 'No email'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {console.log(item?.lead?.status)}
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getLeadStatusColor(item?.lead?.status)}`}>
                                                <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-60"></span>
                                                {item.lead.status?.replace('-', ' ') || 'New'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <UserCheck size={12} className="text-gray-400" />
                                                <span className="text-sm text-gray-700 font-medium">
                                                    {item?.history?.[0]?.assignedTo?.name || 'Unassigned'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <CalendarDays size={14} className="text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">
                                                    {new Date(next.followUpDate).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${statusConfig.color}`}>
                                                {statusConfig.icon}
                                                {statusConfig.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {reminderDays && (
                                                <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${reminderDays.color}`}>
                                                    {reminderDays.icon}
                                                    {reminderDays.text}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <ActionButton
                                                icon={<Edit2 size={14} />}
                                                onClick={() => openEditModal(item)}
                                                color="indigo"
                                                tooltip="Edit Lead & Add Remarks"
                                            />
                                        </td>
                                    </tr>
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/* ======================
   ACTION BUTTON COMPONENT
====================== */
const ActionButton = ({ icon, onClick, href, target, color, tooltip, size = "md" }) => {
    const baseClasses = `p-${size === "sm" ? "1.5" : "2"} rounded-lg transition-all duration-200 hover:scale-105`;
    const colorClasses = {
        green: "text-gray-500 hover:text-green-600 hover:bg-green-50",
        indigo: "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50",
        purple: "text-gray-500 hover:text-purple-600 hover:bg-purple-50",
        gray: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
    };

    const button = (
        <button
            onClick={onClick}
            className={`${baseClasses} ${colorClasses[color]} group relative`}
            title={tooltip}
        >
            {icon}
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {tooltip}
            </span>
        </button>
    );

    if (href) {
        return (
            <a href={href} target={target} className={`${baseClasses} ${colorClasses[color]} inline-flex`} title={tooltip}>
                {icon}
            </a>
        );
    }

    return button;
};

/* ======================
   EDIT LEAD MODAL WITH REMARKS
====================== */
const EditLeadModal = ({
    editingLead,
    editFormData,
    setEditFormData,
    handleUpdateLead,
    setShowEditModal,
    saving,
    executives,
    activeTab,
    setActiveTab,
    remarksData,
    newRemark,
    setNewRemark,
    showAddRemark,
    setShowAddRemark,
    handleAddRemark,
    formatDate,
    getTypeIcon,
    getStatusConfig
}) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                <Sparkles size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Manage Lead</h3>
                                <p className="text-sm text-white/80">{editingLead.lead.name}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowEditModal(false)} className="text-white/80 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                    <button
                        onClick={() => setActiveTab("edit")}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-all relative ${activeTab === "edit"
                            ? "text-indigo-600 bg-white border-b-2 border-indigo-600"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Edit2 size={16} />
                            Edit Lead Details
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab("remarks")}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-all relative ${activeTab === "remarks"
                            ? "text-indigo-600 bg-white border-b-2 border-indigo-600"
                            : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <MessageSquare size={16} />
                            Remarks & Notes ({remarksData?.remarks?.length || 0})
                        </div>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                    {/* Edit Tab Content */}
                    {activeTab === "edit" && (
                        <div className="p-6 space-y-5">
                            {/* Lead Status */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Star size={14} className="text-indigo-500" />
                                    Lead Status
                                </label>
                                <select
                                    value={editFormData.status}
                                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
                                >
                                    {leadStatus?.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {status.label || status.value}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Assigned To */}
                            {/* <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Users size={14} className="text-indigo-500" />
                                    Assign To Executive
                                </label>
                                <select
                                    value={editFormData.assignedTo}
                                    onChange={(e) => setEditFormData({ ...editFormData, assignedTo: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
                                >
                                    <option value="">Select Executive</option>
                                    {executives?.data?.map((exec) => (
                                        <option key={exec._id} value={exec._id}>{exec.name}</option>
                                    ))}
                                </select>
                            </div> */}

                            {/* Follow-up Date */}
                            <div className="group">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Calendar size={14} className="text-indigo-500" />
                                    Next Follow-up Date
                                </label>
                                <input
                                    type="date"
                                    value={editFormData.followUpDate}
                                    onChange={(e) => setEditFormData({ ...editFormData, followUpDate: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateLead}
                                    disabled={saving}
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Remarks Tab Content */}
                    {activeTab === "remarks" && (
                        <div className="p-6">
                            {/* Add Remark Button */}
                            {!showAddRemark && (
                                <button
                                    onClick={() => setShowAddRemark(true)}
                                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-indigo-300 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 text-sm font-semibold cursor-pointer hover:from-indigo-100 hover:to-purple-100 hover:border-indigo-400 transition-all mb-6 group"
                                >
                                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                                    Add New Remark
                                </button>
                            )}

                            {/* Add Remark Form */}
                            {showAddRemark && (
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 mb-6 border border-indigo-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare size={16} className="text-indigo-600" />
                                            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">New Remark</span>
                                        </div>
                                        <button
                                            onClick={() => setShowAddRemark(false)}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <textarea
                                        className="w-full p-3 border border-indigo-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white"
                                        placeholder="Write your remark..."
                                        value={newRemark}
                                        onChange={e => setNewRemark(e.target.value)}
                                        rows={3}
                                        autoFocus
                                    />
                                    <div className="flex justify-end gap-2 mt-3">
                                        <button
                                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                            onClick={() => {
                                                setShowAddRemark(false);
                                                setNewRemark('');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            onClick={handleAddRemark}
                                            disabled={saving || !newRemark.trim()}
                                        >
                                            {saving ? (
                                                <>
                                                    <span className="spinner inline-block w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={14} />
                                                    Save Remark
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Remarks List */}
                            <div className="space-y-3">
                                {remarksData?.remarks?.length > 0 ? (
                                    remarksData.remarks.map((remark, idx) => (
                                        <div
                                            key={remark._id}
                                            className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-300 animate-fadeIn"
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                                                    <MessageSquare size={14} className="text-indigo-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{remark.text}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <div className="flex items-center gap-1">
                                                            <UserCheck size={10} className="text-gray-400" />
                                                            <span className="text-xs text-gray-500">
                                                                By: <span className="font-medium text-indigo-600">{remark.createdByName}</span>
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-400">•</span>
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={10} className="text-gray-400" />
                                                            <span className="text-xs text-gray-500">
                                                                {formatDate(remark.createdAt)}
                                                            </span>
                                                        </div>
                                                        {remark.isEdited && (
                                                            <>
                                                                <span className="text-xs text-gray-400">•</span>
                                                                <span className="text-xs text-amber-600 flex items-center gap-1">
                                                                    <Edit2 size={10} />
                                                                    Edited
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <MessageSquare size={24} className="text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-500">No remarks yet</p>
                                        <p className="text-xs text-gray-400 mt-1">Click "Add New Remark" to add your first note</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowUps;