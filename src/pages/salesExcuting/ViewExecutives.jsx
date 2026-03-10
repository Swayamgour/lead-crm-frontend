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
    BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetExecutiveByIdQuery, useGetExecutivesQuery, useUpdateExecutiveMutation } from "../../redux/api";

function ViewExecutives() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedExecutives, setSelectedExecutives] = useState([]);
    const [viewMode, setViewMode] = useState("table"); // table or grid

    const { data } = useGetExecutivesQuery()
    const { data: Executive } = useGetExecutiveByIdQuery('69aacb0eb201e62a9eb6cf3d')


    const [updateExecutive] = useUpdateExecutiveMutation()


    const executives = data?.executives || []

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const filteredExecutives = executives.filter(exec => {
        const matchesSearch = exec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exec.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exec.phone.includes(searchTerm);
        const matchesStatus = filterStatus === "all" || exec.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: executives.length,
        active: executives.filter(e => e.status === "active").length,
        totalLeads: executives.reduce((sum, e) => sum + e.leadsAssigned, 0),
        totalWon: executives.reduce((sum, e) => sum + e.leadsWon, 0)
    };

    const toggleSelectExecutive = (id) => {
        setSelectedExecutives(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };


    const handleStatusToggle = async (exec) => {

        // const newStatus = exec.status === "active" ? "inactive" : "active";

        // await updateExecutive({
        //     id: exec._id,
        //     status: newStatus
        // });

        const res = await updateExecutive({
            id: exec._id,
            status: exec.status === "active" ? "inactive" : "active"
        });

    };


    // useNavigate

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                                <Users className="text-blue-600" size={28} />
                                Sales Executives
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Manage and monitor your sales team performance
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* View Toggle */}


                            {/* Action Buttons */}

                            <button
                                onClick={() => navigate("/addExecutive")}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                            >
                                <Plus size={18} />
                                <span className="hidden sm:inline">Add Executive</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Executives</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                                </div>
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Users className="text-blue-600" size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Active</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                </div>
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="text-green-600" size={20} />
                                </div>
                            </div>
                        </div>

                        {/* <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Leads</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.totalLeads}</p>
                                </div>
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <BarChart3 className="text-purple-600" size={20} />
                                </div>
                            </div>
                        </div> */}

                        {/* <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Conversion Rate</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {Math.round((stats.totalWon / stats.totalLeads) * 100)}%
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Award className="text-orange-600" size={20} />
                                </div>
                            </div>
                        </div> */}
                    </div>

                    {/* Search and Filters */}
                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, email or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Filter size={18} />
                            More Filters
                            <ChevronDown size={16} />
                        </button>
                    </div>

                    {/* Bulk Actions */}
                    {selectedExecutives.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                            <span className="text-sm text-blue-700">
                                {selectedExecutives.length} executive(s) selected
                            </span>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                                    Bulk Action
                                </button>
                                <button className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm hover:bg-gray-100">
                                    Clear
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table View */}

                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-full">

                    <div className="overflow-x-auto w-full">
                        <table className="min-w-[850px] w-full">

                            {/* Header */}
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <tr>

                                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Executive
                                    </th>

                                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Contact
                                    </th>

                                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                    </th>

                                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Assign Lead
                                    </th>

                                    <th className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            {/* Body */}
                            <tbody className="divide-y divide-gray-200">

                                {filteredExecutives.map((exec) => (

                                    <tr
                                        onClick={() => navigate(`/AssignLeadView/${exec?._id}`)}
                                        key={exec.id} className="hover:bg-gray-50 transition-colors">

                                        {/* Executive */}
                                        <td className="px-4 md:px-6 py-4">
                                            <div className="flex items-center gap-3">

                                                {/* <div className={`w-9 h-9 md:w-10 md:h-10 ${exec.color} rounded-xl flex items-center justify-center text-white font-bold shadow-md`}>
                                                    {getInitials(exec.name)}
                                                </div> */}

                                                <div>
                                                    <p className="font-semibold text-gray-800 text-sm md:text-base">
                                                        {exec.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Joined :- {new Date(exec.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>

                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-4 md:px-6 py-4">
                                            <div className="space-y-1 text-sm">

                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Phone size={14} className="text-gray-400" />
                                                    {exec.phone}
                                                </div>

                                                <div className="flex items-center gap-2 text-gray-600 break-all">
                                                    <Mail size={14} className="text-gray-400" />
                                                    {exec.email}
                                                </div>

                                            </div>
                                        </td>

                                        {/* Performance */}

                                        <td className="px-4 md:px-6 py-4">

                                            <div className="flex flex-col items-center gap-3">



                                                <button
                                                    onClick={() => handleStatusToggle(exec)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                                     ${exec.status === "active" ? "bg-green-500" : "bg-gray-300"}`}
                                                >

                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                                                          ${exec.status === "active" ? "translate-x-6" : "translate-x-1"}`}
                                                    />

                                                </button>
                                                <span className={`text-sm font-medium ${exec.status === "active"
                                                    ? "text-green-600"
                                                    : "text-gray-500"
                                                    }`}>
                                                    {exec.status}
                                                </span>

                                            </div>

                                        </td>


                                        {/* Status */}
                                        <td className="px-4 md:px-6 py-4">

                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${exec.status === "active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {exec?.stats?.totalLeads}
                                            </span>

                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 md:px-6 py-4">

                                            <div className="flex items-center justify-center gap-2 md:gap-3">



                                                <button className="p-2 hover:bg-green-50 rounded-lg">
                                                    <Edit3 size={16} className="text-green-600" />
                                                </button>

                                                <button className="p-2 hover:bg-red-50 rounded-lg">
                                                    <Trash2 size={16} className="text-red-600" />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>
                    </div>

                </div>


                {/* Empty State */}
                {filteredExecutives.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mb-2">No executives found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your search or add a new executive</p>
                        <button
                            onClick={() => navigate("/addExecutive")}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={18} />
                            Add Executive
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ViewExecutives;