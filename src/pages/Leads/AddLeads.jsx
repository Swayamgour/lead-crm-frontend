import React, { useState, useEffect, useCallback } from "react";
import {
    User, Phone, Mail, Tag, ClipboardList, Calendar,
    ChevronDown, AlertCircle, CheckCircle, RotateCcwIcon, SaveAll,
    DollarSign, Calendar as CalendarIcon, Briefcase
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import RemarkEditor from "../../components/RemarkEditor";
import { useGetUsersQuery, useCreateLeadMutation } from "../../redux/api";
import { leadSources, leadStatus } from "../../components/data";

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

    const [touched, setTouched] = useState({
        name: false,
        source: false,
        phone: false,
        email: false,
        status: false,
        assignedTo: false,
        followUpDate: false,
        expectedValue: false
    });

    const { data } = useGetUsersQuery();
    const [CreateLead] = useCreateLeadMutation();
    const salesTeam = data || [];

    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [tagInput, setTagInput] = useState("");

    // Validation functions
    const validateName = useCallback((name) => {
        if (!name.trim()) return "Lead name is required";
        if (name.trim().length < 2) return "Name must be at least 2 characters";
        if (name.trim().length > 100) return "Name must be less than 100 characters";
        if (!/^[a-zA-Z\s\-'.]+$/.test(name.trim())) {
            return "Name can only contain letters, spaces, hyphens, and apostrophes";
        }
        return null;
    }, []);

    const validatePhone = useCallback((phone) => {
        if (!phone.trim()) return "Phone number is required";
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return "Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9";
        }
        return null;
    }, []);

    const validateEmail = useCallback((email) => {
        if (email && email.trim()) {
            const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return "Enter a valid email address (e.g., name@company.com)";
            }
            if (email.length > 100) return "Email must be less than 100 characters";
        }
        return null;
    }, []);

    const validateSource = useCallback((source) => {
        if (!source) return "Please select a lead source";
        return null;
    }, []);

    const validateStatus = useCallback((status) => {
        if (!status) return "Please select a lead status";
        return null;
    }, []);

    const validateAssignedTo = useCallback((assignedTo) => {
        if (!assignedTo) return "Please assign to a sales executive";
        return null;
    }, []);

    const validateFollowUpDate = useCallback((date) => {
        if (date) {
            const selectedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                return "Follow-up date cannot be in the past";
            }
        }
        return null;
    }, []);

    const validateExpectedValue = useCallback((value) => {
        if (value && value.trim()) {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) return "Please enter a valid number";
            if (numValue < 0) return "Value cannot be negative";
            if (numValue > 100000000) return "Value cannot exceed ₹10,00,00,000";
        }
        return null;
    }, []);

    // Real-time validation
    const validateField = useCallback((field, value) => {
        switch (field) {
            case 'name':
                return validateName(value);
            case 'phone':
                return validatePhone(value);
            case 'email':
                return validateEmail(value);
            case 'source':
                return validateSource(value);
            case 'status':
                return validateStatus(value);
            case 'assignedTo':
                return validateAssignedTo(value);
            case 'followUpDate':
                return validateFollowUpDate(value);
            case 'expectedValue':
                return validateExpectedValue(value);
            default:
                return null;
        }
    }, [validateName, validatePhone, validateEmail, validateSource, validateStatus, validateAssignedTo, validateFollowUpDate, validateExpectedValue]);

    // Update errors when fields change
    useEffect(() => {
        const newErrors = {};
        Object.keys(lead).forEach(field => {
            if (touched[field] && field !== 'remarks' && field !== 'tags') {
                const error = validateField(field, lead[field]);
                if (error) newErrors[field] = error;
            }
        });
        setErrors(newErrors);
    }, [lead, touched, validateField]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Special handling for phone to only allow digits
        if (name === 'phone') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
            setLead(prev => ({
                ...prev,
                [name]: digitsOnly
            }));
        } else {
            setLead(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Mark field as touched
        if (!touched[name]) {
            setTouched(prev => ({
                ...prev,
                [name]: true
            }));
        }
    };

    const handleBlur = (field) => {
        setTouched(prev => ({
            ...prev,
            [field]: true
        }));
    };

    const handleRadioChange = (personId) => {
        setLead(prev => ({
            ...prev,
            assignedTo: personId
        }));

        if (!touched.assignedTo) {
            setTouched(prev => ({
                ...prev,
                assignedTo: true
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const fieldsToValidate = ['name', 'phone', 'source', 'status', 'assignedTo'];

        fieldsToValidate.forEach(field => {
            const error = validateField(field, lead[field]);
            if (error) newErrors[field] = error;
        });

        // Validate optional fields
        const emailError = validateField('email', lead.email);
        if (emailError) newErrors.email = emailError;

        const followUpDateError = validateField('followUpDate', lead.followUpDate);
        if (followUpDateError) newErrors.followUpDate = followUpDateError;

        const expectedValueError = validateField('expectedValue', lead.expectedValue);
        if (expectedValueError) newErrors.expectedValue = expectedValueError;

        // Mark all fields as touched
        setTouched({
            name: true,
            source: true,
            phone: true,
            email: true,
            status: true,
            assignedTo: true,
            followUpDate: true,
            expectedValue: true
        });

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            // Scroll to first error
            const firstErrorField = Object.keys(newErrors)[0];
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
                errorElement.focus();
            }
            return;
        }

        try {
            console.log("Lead Data:", lead);
            await CreateLead(lead).unwrap();

            setShowSuccess(true);

            setTimeout(() => {
                setShowSuccess(false);
                navigate(-1);
            }, 2000);

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
                    tags: []
                });
                setTagInput("");
                setTouched({});
                setErrors({});
            }, 1000);

        } catch (error) {
            console.error("Error creating lead:", error);
            const errorMessage = error.data?.message || "Failed to create lead";

            if (errorMessage.includes("phone")) {
                setErrors({ phone: "Phone number already exists" });
                setTouched(prev => ({ ...prev, phone: true }));
            } else if (errorMessage.includes("email")) {
                setErrors({ email: "Email already exists" });
                setTouched(prev => ({ ...prev, email: true }));
            } else {
                setErrors({ submit: errorMessage });
            }

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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
            tags: []
        });
        setTagInput("");
        setTouched({});
        setErrors({});
    };

    // Helper function to get input styling based on validation state
    const getInputClassName = (fieldName) => {
        const hasError = errors[fieldName] && touched[fieldName];
        const isValid = !errors[fieldName] && touched[fieldName] && lead[fieldName];

        if (hasError) {
            return "border-red-300 focus:ring-red-200 bg-red-50";
        }
        if (isValid) {
            return "border-green-300 focus:ring-green-200 bg-green-50";
        }
        return "border-gray-200 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300";
    };

    // Get status badge color
    const getStatusColor = (status) => {
        const colors = {
            'New': 'bg-blue-100 text-blue-800',
            'Contacted': 'bg-yellow-100 text-yellow-800',
            'Qualified': 'bg-green-100 text-green-800',
            'Lost': 'bg-red-100 text-red-800',
            'Won': 'bg-purple-100 text-purple-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    // Get source badge color
    const getSourceColor = (source) => {
        const colors = {
            'Website': 'bg-indigo-100 text-indigo-800',
            'Social Media': 'bg-pink-100 text-pink-800',
            'Referral': 'bg-emerald-100 text-emerald-800',
            'Call': 'bg-orange-100 text-orange-800',
            'Email': 'bg-cyan-100 text-cyan-800',
            'Other': 'bg-gray-100 text-gray-800'
        };
        return colors[source] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Success Message */}
                {showSuccess && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-slideDown shadow-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="text-green-600" size={18} />
                        </div>
                        <div>
                            <p className="text-green-800 font-medium">Lead added successfully!</p>
                            <p className="text-green-600 text-sm">Redirecting to leads list...</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {errors.submit && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" size={18} />
                        <p className="text-red-800">{errors.submit}</p>
                    </div>
                )}

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                <ClipboardList className="text-white" size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Add New Lead</h1>
                                <p className="text-blue-100 mt-1">Fill lead details and assign to sales executive</p>
                            </div>
                        </div>
                    </div>

                    {/* Form Body */}


                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Lead Name */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Lead Name <span className="text-red-500">*</span>
                                </label>

                                <div className="group">
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={lead.name}
                                            onChange={handleChange}
                                            onBlur={() => handleBlur('name')}
                                            placeholder="Enter customer full name"
                                            className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${getInputClassName('name')}`}
                                        />
                                    </div>

                                    <div className="min-h-[20px]">
                                        {touched.name && errors.name && (
                                            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle size={12} /> {errors.name}
                                            </p>
                                        )}
                                        {touched.name && !errors.name && lead.name && (
                                            <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                                                <CheckCircle size={12} /> Valid name
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>

                                <div className="group">
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={18} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={lead.phone}
                                            onChange={handleChange}
                                            onBlur={() => handleBlur('phone')}
                                            placeholder="10-digit mobile number"
                                            maxLength="10"
                                            className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${getInputClassName('phone')}`}
                                        />
                                    </div>

                                    <div className="min-h-[20px]">
                                        {touched.phone && errors.phone && (
                                            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle size={12} /> {errors.phone}
                                            </p>
                                        )}
                                        {touched.phone && !errors.phone && lead.phone && (
                                            <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                                                <CheckCircle size={12} /> Valid phone number
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Email Address <span className="text-gray-400 text-xs">(optional)</span>
                                </label>

                                <div className="group">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={18} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={lead.email}
                                            onChange={handleChange}
                                            onBlur={() => handleBlur('email')}
                                            placeholder="customer@example.com"
                                            className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${getInputClassName('email')}`}
                                        />
                                    </div>

                                    <div className="min-h-[20px]">
                                        {touched.email && errors.email && (
                                            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle size={12} /> {errors.email}
                                            </p>
                                        )}
                                        {touched.email && !errors.email && lead.email && (
                                            <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                                                <CheckCircle size={12} /> Valid email address
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Lead Source */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Lead Source <span className="text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <select
                                        name="source"
                                        value={lead.source}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur('source')}
                                        className={`w-full pl-10 pr-8 py-3 border rounded-xl appearance-none ${getInputClassName('source')}`}
                                    >
                                        <option value="">Select Source</option>
                                        {leadSources.map((src) => (
                                            <option key={src.value} value={src.value}>{src.value}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                </div>

                                <div className="min-h-[20px]">
                                    {touched.source && errors.source && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.source}
                                        </p>
                                    )}
                                    {touched.source && !errors.source && lead.source && (
                                        <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                                            <CheckCircle size={12} /> Source selected
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Lead Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Lead Status <span className="text-red-500">*</span>
                                </label>

                                <div className="relative">
                                    <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <select
                                        name="status"
                                        value={lead.status}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur('status')}
                                        className={`w-full pl-10 pr-8 py-3 border rounded-xl appearance-none ${getInputClassName('status')}`}
                                    >
                                        <option value="">Select Status</option>
                                        {leadStatus.map((status) => (
                                            <option key={status.value} value={status.value}>{status.value}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                </div>

                                <div className="min-h-[20px]">
                                    {touched.status && errors.status && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle size={12} /> {errors.status}
                                        </p>
                                    )}
                                    {touched.status && !errors.status && lead.status && (
                                        <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                                            <CheckCircle size={12} /> Status selected
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* 👉 baaki code SAME rakho (Assign, FollowUp, Value, Remarks etc.) */}

                            {/* Assign Lead */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assign Lead To <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {salesTeam.map((person) => (
                                        <label
                                            key={person._id}
                                            className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all
                                                ${lead.assignedTo === person._id
                                                    ? "border-blue-500 bg-blue-50 shadow-sm"
                                                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                                }`}
                                            onClick={() => handleRadioChange(person._id)}
                                        >
                                            <input
                                                type="radio"
                                                name="assignedTo"
                                                value={person._id}
                                                checked={lead.assignedTo === person._id}
                                                onChange={handleChange}
                                                className="sr-only"
                                            />
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                                                {person.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <p className="text-sm font-medium text-gray-900">{person.name}</p>
                                                <p className="text-xs text-gray-500">{person.phone || 'No phone'}</p>
                                            </div>
                                            {lead.assignedTo === person._id && (
                                                <CheckCircle size={16} className="text-blue-600" />
                                            )}
                                        </label>
                                    ))}
                                    {salesTeam.length === 0 && (
                                        <div className="col-span-full text-center py-8 text-gray-500">
                                            No sales executives available
                                        </div>
                                    )}
                                </div>
                                {touched.assignedTo && errors.assignedTo && (
                                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.assignedTo}
                                    </p>
                                )}
                                {touched.assignedTo && !errors.assignedTo && lead.assignedTo && (
                                    <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                                        <CheckCircle size={12} />
                                        Assigned successfully
                                    </p>
                                )}
                            </div>

                            {/* Follow Up Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Follow Up Date <span className="text-gray-400 text-xs">(optional)</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        name="followUpDate"
                                        value={lead.followUpDate}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur('followUpDate')}
                                        min={new Date().toISOString().split('T')[0]}
                                        className={`w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${getInputClassName('followUpDate')}`}
                                    />
                                    {touched.followUpDate && errors.followUpDate && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle size={12} />
                                            {errors.followUpDate}
                                        </p>
                                    )}
                                    {touched.followUpDate && !errors.followUpDate && lead.followUpDate && (
                                        <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                                            <CheckCircle size={12} />
                                            Valid date
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Expected Value */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Expected Value (₹) <span className="text-gray-400 text-xs">(optional)</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                                    <input
                                        type="number"
                                        name="expectedValue"
                                        value={lead.expectedValue}
                                        onChange={handleChange}
                                        onBlur={() => handleBlur('expectedValue')}
                                        placeholder="Enter amount"
                                        min="0"
                                        step="1000"
                                        className={`w-full pl-8 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${getInputClassName('expectedValue')}`}
                                    />
                                    {touched.expectedValue && errors.expectedValue && (
                                        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                            <AlertCircle size={12} />
                                            {errors.expectedValue}
                                        </p>
                                    )}
                                    {touched.expectedValue && !errors.expectedValue && lead.expectedValue && (
                                        <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                                            <CheckCircle size={12} />
                                            Valid amount
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Remarks */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Remarks / Notes
                                </label>
                                <RemarkEditor
                                    value={lead.remarks}
                                    onChange={(val) =>
                                        setLead((prev) => ({
                                            ...prev,
                                            remarks: val
                                        }))
                                    }
                                />
                            </div>

                        </div>
                        <div className="mt-15 pt-6 border-t border-gray-100 flex items-center justify-end gap-3 ">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-700 font-medium"
                            >
                                <RotateCcwIcon size={16} />
                                Reset
                            </button>

                            <button
                                type="submit"
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium"
                            >
                                <SaveAll size={16} />
                                Save Lead
                            </button>
                        </div>
                    </form>

                </div>
            </div>

            {/* Add CSS animations */}
            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

export default AddLead;