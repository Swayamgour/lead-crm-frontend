import React, { useState } from "react";
import {
    User, Phone, Mail, Users, Tag, ClipboardList, Calendar,
    ChevronDown, X, Save, RotateCcw, AlertCircle, CheckCircle,
    ArrowLeft, MessageSquare, Clock, Bell, TrendingUp,
    RotateCcwIcon,
    Eye,
    SaveAll
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import RemarkEditor from "../../components/RemarkEditor";
import { useGetUsersQuery, useCreateLeadMutation } from "../../redux/api";
import { leadStatus } from "../../components/data";

const leadSources = [
    { value: "IndiaMART", icon: "🛒", color: "bg-orange-100 text-orange-700" },
    { value: "Website", icon: "🌐", color: "bg-blue-100 text-blue-700" },
    { value: "Meta Platforms", icon: "📱", color: "bg-indigo-100 text-indigo-700" },
    { value: "WhatsApp Chatbot", icon: "🤖", color: "bg-green-100 text-green-700" },
    { value: "Manual Entry", icon: "📝", color: "bg-gray-100 text-gray-700" },
    { value: "Reference", icon: "👥", color: "bg-purple-100 text-purple-700" },
    { value: "Phone Call", icon: "📞", color: "bg-teal-100 text-teal-700" },
    { value: "Email Campaign", icon: "✉️", color: "bg-red-100 text-red-700" }
];

// {leadStatus}



function AddLead() {
    const navigate = useNavigate();
    const [lead, setLead] = useState({
        name: "",
        source: "",
        phone: "",
        email: "",
        status: "",
        assignedTo: "",
        remarks: "",
        followUpDate: "",
        expectedValue: "",
        tags: []
    });

    // priority: "Medium",

    const { data } = useGetUsersQuery()
    const [CreateLead] = useCreateLeadMutation()

    const salesTeam = data || []



    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [showPreview, setShowPreview] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLead(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!lead.name.trim()) newErrors.name = "Lead name is required";
        if (!lead.phone.trim()) newErrors.phone = "Phone number is required";
        else if (!/^\d{10}$/.test(lead.phone)) newErrors.phone = "Enter a valid 10-digit phone number";

        if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
            newErrors.email = "Enter a valid email address";
        }

        if (!lead.source) newErrors.source = "Please select a lead source";
        if (!lead.status) newErrors.status = "Please select a lead status";
        if (!lead.assignedTo) newErrors.assignedTo = "Please assign to a sales executive";

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        console.log("Lead Data:", lead);
        await CreateLead(lead)

        // Show success message
        setShowSuccess(true);
        navigate(-1)

        setTimeout(() => setShowSuccess(false), 3000);

        // Reset form after successful submission
        setTimeout(() => {
            setLead({
                name: "",
                source: "",
                phone: "",
                email: "",
                status: "",
                assignedTo: "",
                remarks: "",
                followUpDate: "",
                expectedValue: "",
                // priority: "Medium",
                tags: []
            });
            setTagInput("");
            setErrors({});
        }, 2000);
    };

    const handleReset = () => {
        setLead({
            name: "",
            source: "",
            phone: "",
            email: "",
            status: "",
            assignedTo: "",
            remarks: "",
            followUpDate: "",
            expectedValue: "",
            // priority: "Medium",
            tags: []
        });
        setTagInput("");
        setErrors({});
    };

    const addTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!lead.tags.includes(tagInput.trim())) {
                setLead(prev => ({
                    ...prev,
                    tags: [...prev.tags, tagInput.trim()]
                }));
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove) => {
        setLead(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header with Navigation */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Leads</span>
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">Need help?</span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm">Contact Support</button>
                    </div>
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-slideDown">
                        <CheckCircle className="text-green-600" size={20} />
                        <p className="text-green-800">Lead added successfully! Redirecting...</p>
                    </div>
                )}

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                <ClipboardList className="text-white" size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Add New Lead</h1>
                                <p className="text-blue-100 mt-1">Capture enquiry details and assign to sales executive</p>
                            </div>
                        </div>

                        {/* Progress Steps */}

                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Lead Name - Full Width */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lead Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={lead.name}
                                        onChange={handleChange}
                                        placeholder="Enter customer full name"
                                        className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all
                                            ${errors.name
                                                ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                                                : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400'}`}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle size={12} />
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={lead.phone}
                                        onChange={handleChange}
                                        placeholder="10-digit mobile number"
                                        maxLength="10"
                                        className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all
                                            ${errors.phone
                                                ? 'border-red-300 focus:ring-red-200'
                                                : 'border-gray-200 focus:ring-blue-200'}`}
                                    />
                                    {errors.phone && (
                                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle size={12} />
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={lead.email}
                                        onChange={handleChange}
                                        placeholder="customer@example.com"
                                        className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all
                                            ${errors.email
                                                ? 'border-red-300 focus:ring-red-200'
                                                : 'border-gray-200 focus:ring-blue-200'}`}
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle size={12} />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Lead Source */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lead Source <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <select
                                        name="source"
                                        value={lead.source}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-8 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all appearance-none
                                            ${errors.source
                                                ? 'border-red-300 focus:ring-red-200'
                                                : 'border-gray-200 focus:ring-blue-200'}`}
                                    >
                                        <option value="">Select Source</option>
                                        {leadSources.map((src) => (
                                            <option key={src.value} value={src.value}>
                                                {src.icon} {src.value}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                </div>
                                {errors.source && (
                                    <p className="mt-1 text-xs text-red-600">{errors.source}</p>
                                )}
                            </div>

                            {/* Lead Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lead Status <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <ClipboardList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <select
                                        name="status"
                                        value={lead.status}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-8 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all appearance-none
                                            ${errors.status
                                                ? 'border-red-300 focus:ring-red-200'
                                                : 'border-gray-200 focus:ring-blue-200'}`}
                                    >
                                        <option value="">Select Status</option>
                                        {leadStatus.map((status) => (
                                            <option key={status.value} value={status.value}>
                                                {status.icon} {status.value}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                </div>
                                {errors.status && (
                                    <p className="mt-1 text-xs text-red-600">{errors.status}</p>
                                )}
                            </div>

                            {/* Assign Lead */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Assign Lead To <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {salesTeam.map((person) => (
                                        <label
                                            key={person._id}
                                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all
                                                ${lead.assignedTo === person._id
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="assignedTo"
                                                value={person._id}
                                                checked={lead.assignedTo === person._id}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />

                                            {/* <div
                                                className={`w-8 h-8 ${person.color} rounded-full flex items-center justify-center text-white font-medium text-sm`}
                                            >
                                                {person.initials}
                                            </div> */}

                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">{person.name}</p>
                                                <p className="text-xs text-gray-500">{person.phone}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {errors.assignedTo && (
                                    <p className="mt-2 text-xs text-red-600">{errors.assignedTo}</p>
                                )}
                            </div>

                            {/* Follow Up Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Follow Up Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        name="followUpDate"
                                        value={lead.followUpDate}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    />
                                </div>
                            </div>

                            {/* Expected Value */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Expected Value (₹)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                                    <input
                                        type="number"
                                        name="expectedValue"
                                        value={lead.expectedValue}
                                        onChange={handleChange}
                                        placeholder="Enter amount"
                                        className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    />
                                </div>
                            </div>

                            {/* Priority */}




                            {/* Remarks */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Remarks / Notes
                                </label>
                                <RemarkEditor
                                    value={lead.remarks}
                                    onChange={(val) => setLead({ ...lead, remarks: val })}
                                />
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                            >
                                <RotateCcwIcon size={16} />
                                Reset
                            </button>

                            {/* <button
                                type="button"
                                onClick={() => setShowPreview(!showPreview)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                            >
                                <Eye size={16} />
                                Preview
                            </button> */}

                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                            >
                                <SaveAll size={16} />
                                Save Lead
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview Modal */}

            </div>
        </div>
    );
}

export default AddLead;