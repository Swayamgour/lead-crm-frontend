import React, { useState, useEffect } from "react";
import {
    User,
    Phone,
    Mail,
    Lock,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    Camera,
    Upload,
    Save,
    RotateCcw,
    HelpCircle,
    ArrowLeft,
    Edit3,
    Loader
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateUserMutation, useUpdateUserMutation, useGetUserByIdQuery } from "../../redux/api";

function AddEditExecutive() {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID from URL for edit mode
    const isEditMode = Boolean(id);

    const [executive, setExecutive] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [addExecutive] = useCreateUserMutation();
    const [updateExecutive] = useUpdateUserMutation();

    // Fetch executive data if in edit mode
    const { data: existingExecutive, isLoading: isLoadingExecutive } = useGetUserByIdQuery(id, {
        skip: !isEditMode
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Populate form when in edit mode
    useEffect(() => {
        if (isEditMode && existingExecutive) {
            setExecutive({
                name: existingExecutive.name || "",
                phone: existingExecutive.phone || "",
                email: existingExecutive.email || "",
                password: "", // Don't populate password for security
                confirmPassword: "",
            });

            // Set profile image if exists
            if (existingExecutive.avatar) {
                setProfileImage(existingExecutive.avatar);
            }
        }
    }, [isEditMode, existingExecutive]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExecutive(prev => ({
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

        if (!executive.name.trim()) newErrors.name = "Name is required";

        if (!executive.phone.trim()) newErrors.phone = "Phone number is required";
        else if (!/^\d{10}$/.test(executive.phone)) newErrors.phone = "Enter a valid 10-digit phone number";

        if (!executive.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(executive.email)) newErrors.email = "Enter a valid email address";

        // Password validation only for new executives or if password field is filled in edit mode
        if (!isEditMode) {
            if (!executive.password) newErrors.password = "Password is required";
            else if (executive.password.length < 8) newErrors.password = "Password must be at least 8 characters";

            if (executive.password !== executive.confirmPassword) {
                newErrors.confirmPassword = "Passwords do not match";
            }
        } else {
            // In edit mode, password is optional
            if (executive.password) {
                if (executive.password.length < 8) newErrors.password = "Password must be at least 8 characters";
                if (executive.password !== executive.confirmPassword) {
                    newErrors.confirmPassword = "Passwords do not match";
                }
            }
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();

            formData.append("name", executive.name);
            formData.append("phone", executive.phone);
            formData.append("email", executive.email);

            // Only append password if it's provided (for new users or password update)
            if (executive.password) {
                formData.append("password", executive.password);
            }

            // Add profile image if exists
            if (profileImage && typeof profileImage !== 'string') {
                formData.append("avatar", profileImage);
            }

            let response;

            if (isEditMode) {
                // Update existing executive
                formData.append("id", id);
                response = await updateExecutive(formData).unwrap();
                console.log("Updated:", response);
            } else {
                // Add new executive
                response = await addExecutive(formData).unwrap();
                console.log("Created:", response);
            }

            setShowSuccess(true);

            // Navigate back after success
            setTimeout(() => {
                navigate("/"); // or whatever your executives list route is
            }, 1500);

        } catch (error) {
            console.error("Error saving executive:", error);
            setErrors({ submit: error.data?.message || "Failed to save executive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        if (isEditMode && existingExecutive) {
            // Reset to original values in edit mode
            setExecutive({
                name: existingExecutive.name || "",
                phone: existingExecutive.phone || "",
                email: existingExecutive.email || "",
                password: "",
                confirmPassword: "",
            });
            setProfileImage(existingExecutive.avatar || null);
        } else {
            // Reset form in add mode
            setExecutive({
                name: "",
                phone: "",
                email: "",
                password: "",
                confirmPassword: "",
            });
            setProfileImage(null);
        }
        setErrors({});
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);

            // Also store the file for FormData
            setProfileImage(file);
        }
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'EX';
    };

    // Loading state for edit mode
    if (isEditMode && isLoadingExecutive) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading executive details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header with Back Button */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                    >
                        <div className="p-2 rounded-lg bg-white shadow-sm group-hover:shadow group-hover:bg-gray-50 transition-all">
                            <ArrowLeft size={18} />
                        </div>
                        <span>Back to Executives</span>
                    </button>

                    {/* <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">Need help?</span>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Contact Support</button>
                    </div> */}
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-slideDown shadow-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="text-green-600" size={18} />
                        </div>
                        <div>
                            <p className="text-green-800 font-medium">
                                {isEditMode ? "Executive updated successfully!" : "Executive added successfully!"}
                            </p>
                            <p className="text-green-600 text-sm">Redirecting to executives list...</p>
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
                    {/* Header with Gradient */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 md:px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                {isEditMode ? <Edit3 className="text-white" size={28} /> : <User className="text-white" size={28} />}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {isEditMode ? "Edit Sales Executive" : "Add Sales Executive"}
                                </h1>
                                <p className="text-blue-100 mt-1">
                                    {isEditMode
                                        ? "Update sales team member profile information"
                                        : "Create a new sales team member profile"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Image Upload */}
                    <div className="px-6 md:px-8 py-6 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg overflow-hidden">
                                    {profileImage ? (
                                        <img
                                            src={typeof profileImage === 'string' ? profileImage : URL.createObjectURL(profileImage)}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        getInitials(executive.name)
                                    )}
                                </div>
                                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg border-2 border-white">
                                    <Camera size={14} className="text-white" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                                {profileImage && (
                                    <button
                                        onClick={() => setProfileImage(null)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors shadow-lg border-2 border-white"
                                    >
                                        <X size={12} className="text-white" />
                                    </button>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">Profile Photo</h3>
                                <p className="text-sm text-gray-500 mt-1">Upload a profile picture (JPG, PNG, GIF) - Max 2MB</p>
                                <div className="mt-3 flex gap-2">
                                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors shadow-sm">
                                        <Upload size={14} />
                                        Upload Photo
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                    {profileImage && (
                                        <button
                                            onClick={() => setProfileImage(null)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                                        >
                                            <X size={14} />
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        <div className="space-y-6">
                            {/* Info Message for Edit Mode */}
                            {isEditMode && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                                    <p className="text-sm text-blue-700">
                                        Leave password fields empty if you don't want to change the password.
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Full Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={executive.name}
                                            onChange={handleChange}
                                            placeholder="Enter executive's full name"
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all
                                                ${errors.name
                                                    ? 'border-red-300 focus:ring-red-200 bg-red-50'
                                                    : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
                                                }`}
                                        />
                                        {errors.name && (
                                            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle size={12} />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <Phone size={18} />
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={executive.phone}
                                            onChange={handleChange}
                                            placeholder="10-digit mobile number"
                                            maxLength="10"
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all
                                                ${errors.phone
                                                    ? 'border-red-300 focus:ring-red-200 bg-red-50'
                                                    : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
                                                }`}
                                        />
                                        {errors.phone && (
                                            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle size={12} />
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={executive.email}
                                            onChange={handleChange}
                                            placeholder="executive@company.com"
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all
                                                ${errors.email
                                                    ? 'border-red-300 focus:ring-red-200 bg-red-50'
                                                    : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
                                                }`}
                                        />
                                        {errors.email && (
                                            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle size={12} />
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Password {!isEditMode && <span className="text-red-500">*</span>}
                                        {isEditMode && <span className="text-xs text-gray-400 ml-2">(optional)</span>}
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={executive.password}
                                            onChange={handleChange}
                                            placeholder={isEditMode ? "Leave empty to keep current" : "Create password"}
                                            className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all
                                                ${errors.password
                                                    ? 'border-red-300 focus:ring-red-200 bg-red-50'
                                                    : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        {errors.password && (
                                            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle size={12} />
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Confirm Password {!isEditMode && <span className="text-red-500">*</span>}
                                        {isEditMode && <span className="text-xs text-gray-400 ml-2">(if changing)</span>}
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={executive.confirmPassword}
                                            onChange={handleChange}
                                            placeholder={isEditMode ? "Confirm new password" : "Confirm password"}
                                            className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all
                                                ${errors.confirmPassword
                                                    ? 'border-red-300 focus:ring-red-200 bg-red-50'
                                                    : 'border-gray-200 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-300'
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                        >
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        {errors.confirmPassword && (
                                            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle size={12} />
                                                {errors.confirmPassword}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-full sm:w-auto px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 flex items-center justify-center gap-2 font-medium"
                            >
                                <RotateCcw size={16} />
                                Reset
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader size={16} className="animate-spin" />
                                        {isEditMode ? "Updating..." : "Saving..."}
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        {isEditMode ? "Update Executive" : "Save Executive"}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Help Section */}
               
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

export default AddEditExecutive;