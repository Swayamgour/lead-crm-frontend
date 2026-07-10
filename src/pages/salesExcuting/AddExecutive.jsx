import React, { useState, useEffect, useCallback } from "react";
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
    Loader,
    X
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateUserMutation, useUpdateUserMutation, useGetUserByIdQuery } from "../../redux/api";
import toast from "react-hot-toast";

function AddEditExecutive() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [executive, setExecutive] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [touched, setTouched] = useState({
        name: false,
        phone: false,
        email: false,
        password: false,
        confirmPassword: false,
    });

    const [addExecutive] = useCreateUserMutation();
    const [updateExecutive] = useUpdateUserMutation();

    const { data: existingExecutive, isLoading: isLoadingExecutive } = useGetUserByIdQuery(id, {
        skip: !isEditMode
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validation functions
    const validateName = useCallback((name) => {
        if (!name.trim()) return "Name is required";
        if (name.trim().length < 2) return "Name must be at least 2 characters";
        if (name.trim().length > 50) return "Name must be less than 50 characters";
        if (!/^[a-zA-Z\s\-']+$/.test(name.trim())) return "Name can only contain letters, spaces, hyphens, and apostrophes";
        return null;
    }, []);

    const validatePhone = useCallback((phone) => {
        if (!phone.trim()) return "Phone number is required";
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) return "Enter a valid 10-digit mobile number starting with 6,7,8, or 9";
        return null;
    }, []);

    const validateEmail = useCallback((email) => {
        if (!email.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        if (!emailRegex.test(email)) return "Enter a valid email address (e.g., name@company.com)";
        if (email.length > 100) return "Email must be less than 100 characters";
        return null;
    }, []);

    const validatePassword = useCallback((password, isEditMode, existingPassword = "") => {
        if (!isEditMode && !password) return "Password is required";
        if (password) {
            if (password.length < 6) return "Password must be at least 6 characters";
            // if (password.length > 50) return "Password must be less than 50 characters";
            // if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            //     return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
            // }
        }
        return null;
    }, []);

    const validateConfirmPassword = useCallback((confirmPassword, password) => {
        if (password || confirmPassword) {
            if (confirmPassword !== password) return "Passwords do not match";
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
            case 'password':
                return validatePassword(value, isEditMode, existingExecutive?.password);
            case 'confirmPassword':
                return validateConfirmPassword(value, executive.password);
            default:
                return null;
        }
    }, [validateName, validatePhone, validateEmail, validatePassword, validateConfirmPassword, isEditMode, existingExecutive, executive.password]);

    // Update errors when fields change
    useEffect(() => {
        const newErrors = {};
        Object.keys(executive).forEach(field => {
            if (touched[field]) {
                const error = validateField(field, executive[field]);
                if (error) newErrors[field] = error;
            }
        });
        setErrors(newErrors);
    }, [executive, touched, validateField]);

    // Populate form when in edit mode
    useEffect(() => {
        if (isEditMode && existingExecutive) {
            setExecutive({
                name: existingExecutive.name || "",
                phone: existingExecutive.phone || "",
                email: existingExecutive.email || "",
                password: "",
                confirmPassword: "",
            });

            if (existingExecutive.avatar) {
                setProfileImage(existingExecutive.avatar);
            }
        }
    }, [isEditMode, existingExecutive]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Special handling for phone to only allow digits
        if (name === 'phone') {
            const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
            setExecutive(prev => ({
                ...prev,
                [name]: digitsOnly
            }));
        } else {
            setExecutive(prev => ({
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

    const validateForm = () => {
        const newErrors = {};
        const fields = ['name', 'phone', 'email'];

        // Always validate these fields
        fields.forEach(field => {
            const error = validateField(field, executive[field]);
            if (error) newErrors[field] = error;
        });

        // Validate password fields
        const passwordError = validateField('password', executive.password);
        if (passwordError) newErrors.password = passwordError;

        const confirmPasswordError = validateField('confirmPassword', executive.confirmPassword);
        if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

        // Mark all fields as touched
        setTouched({
            name: true,
            phone: true,
            email: true,
            password: true,
            confirmPassword: true,
        });

        return newErrors;
    };

    // console.log(id)

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

        setIsSubmitting(true);

        try {
            const formData = new FormData();

            formData.append("name", executive.name.trim());
            formData.append("phone", executive.phone);
            formData.append("email", executive.email.trim().toLowerCase());

            if (executive.password) {
                formData.append("password", executive.password);
            }

            if (profileImage && typeof profileImage !== 'string') {
                formData.append("avatar", profileImage);
            }

            let response;

            if (isEditMode) {
                formData.append("id", id);
                // response = await updateExecutive(formData).unwrap();
                // console.log("Updated:", response);

                response = await updateExecutive({
                    id: id,
                    data: formData
                }).unwrap();
            } else {
                response = await addExecutive(formData).unwrap();
                console.log("Created:", response);
            }

            setShowSuccess(true);
            toast.success(isEditMode ? "Executive updated successfully!" : "Executive added successfully!");
            navigate("/ViewExecutives");

            // setTimeout(() => {

            // }, 1500);

        } catch (error) {
            console.error("Error saving executive:", error);
            const errorMessage = error.data?.message || "Failed to save executive";

            // Handle specific error messages from API
            if (errorMessage.includes("email")) {
                setErrors({ email: "Email already exists" });
                setTouched(prev => ({ ...prev, email: true }));
            } else if (errorMessage.includes("phone")) {
                setErrors({ phone: "Phone number already exists" });
                setTouched(prev => ({ ...prev, phone: true }));
            } else {
                setErrors({ submit: errorMessage });
            }

            // Scroll to error
            window.scrollTo({ top: 0, behavior: "smooth" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        if (isEditMode && existingExecutive) {
            setExecutive({
                name: existingExecutive.name || "",
                phone: existingExecutive.phone || "",
                email: existingExecutive.email || "",
                password: "",
                confirmPassword: "",
            });
            setProfileImage(existingExecutive.avatar || null);
        } else {
            setExecutive({
                name: "",
                phone: "",
                email: "",
                password: "",
                confirmPassword: "",
            });
            setProfileImage(null);
        }

        setTouched({});
        setErrors({});
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                setErrors({ image: "Please upload a valid image file (JPG, PNG, GIF)" });
                return;
            }

            // Validate file size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                setErrors({ image: "Image size should be less than 2MB" });
                return;
            }

            setErrors(prev => ({ ...prev, image: null }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
            setProfileImage(file);
        }
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'EX';
    };

    // Helper function to get input styling based on validation state
    const getInputClassName = (fieldName) => {
        const hasError = errors[fieldName] && touched[fieldName];
        const isValid = !errors[fieldName] && touched[fieldName] && executive[fieldName];

        if (hasError) {
            return "border-red-300 focus:ring-red-200 bg-red-50";
        }
        if (isValid) {
            return "border-green-300 focus:ring-green-200 bg-green-50";
        }
        return "border-gray-100 focus:ring-blue-200 focus:border-blue-400 hover:border-gray-200";
    };

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
                        <div className="p-2 rounded-xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)] group-hover:shadow group-hover:bg-gray-50 transition-all">
                            <ArrowLeft size={18} />
                        </div>
                        <span>Back to Executives</span>
                    </button>
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 animate-slideDown shadow-lg">
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
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                        <AlertCircle className="text-red-600" size={18} />
                        <p className="text-red-800">{errors.submit}</p>
                    </div>
                )}

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header with Gradient */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 md:px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
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
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-3xl shadow-lg overflow-hidden">
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
                                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)]">
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
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors shadow-[0_1px_2px_rgba(15,23,42,0.05),0_1px_10px_rgba(15,23,42,0.06)]"
                                        >
                                            <X size={14} />
                                            Remove
                                        </button>
                                    )}
                                </div>
                                {errors.image && (
                                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.image}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        <div className="space-y-6">
                            {/* Info Message for Edit Mode */}
                            {isEditMode && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
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

                                    <div className="group">
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                                                <User size={18} />
                                            </div>

                                            <input
                                                type="text"
                                                name="name"
                                                value={executive.name}
                                                onChange={handleChange}
                                                onBlur={() => handleBlur('name')}
                                                placeholder="Enter executive's full name"
                                                className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 transition-all ${getInputClassName('name')}`}
                                            />
                                        </div>

                                        <div className="min-h-[20px]">
                                            {touched.name && errors.name && (
                                                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle size={12} />
                                                    {errors.name}
                                                </p>
                                            )}
                                            {touched.name && !errors.name && executive.name && (
                                                <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                                                    <CheckCircle size={12} />
                                                    Valid name
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
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500">
                                                <Phone size={18} />
                                            </div>

                                            <input
                                                type="tel"
                                                name="phone"
                                                value={executive.phone}
                                                onChange={handleChange}
                                                onBlur={() => handleBlur('phone')}
                                                placeholder="10-digit mobile number"
                                                maxLength="10"
                                                className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 ${getInputClassName('phone')}`}
                                            />
                                        </div>

                                        <div className="min-h-[20px]">
                                            {touched.phone && errors.phone && (
                                                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle size={12} />
                                                    {errors.phone}
                                                </p>
                                            )}
                                            {touched.phone && !errors.phone && executive.phone && (
                                                <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                                                    <CheckCircle size={12} />
                                                    Valid phone number
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>

                                    <div className="group">
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500">
                                                <Mail size={18} />
                                            </div>

                                            <input
                                                type="email"
                                                name="email"
                                                value={executive.email}
                                                onChange={handleChange}
                                                onBlur={() => handleBlur('email')}
                                                placeholder="executive@company.com"
                                                className={`w-full pl-10 pr-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 ${getInputClassName('email')}`}
                                            />
                                        </div>

                                        <div className="min-h-[20px]">
                                            {touched.email && errors.email && (
                                                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle size={12} />
                                                    {errors.email}
                                                </p>
                                            )}
                                            {touched.email && !errors.email && executive.email && (
                                                <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
                                                    <CheckCircle size={12} />
                                                    Valid email
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Password {!isEditMode && <span className="text-red-500">*</span>}
                                    </label>

                                    <div className="group">
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                <Lock size={18} />
                                            </div>

                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={executive.password}
                                                onChange={handleChange}
                                                onBlur={() => handleBlur('password')}
                                                placeholder="Create password"
                                                className={`w-full pl-10 pr-12 py-3 border rounded-2xl focus:outline-none focus:ring-2 ${getInputClassName('password')}`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>

                                        <div className="min-h-[20px]">
                                            {touched.password && errors.password && (
                                                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle size={12} />
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Confirm Password
                                    </label>

                                    <div className="group">
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                <Lock size={18} />
                                            </div>

                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={executive.confirmPassword}
                                                onChange={handleChange}
                                                onBlur={() => handleBlur('confirmPassword')}
                                                placeholder="Confirm password"
                                                className={`w-full pl-10 pr-12 py-3 border rounded-2xl focus:outline-none focus:ring-2 ${getInputClassName('confirmPassword')}`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>

                                        <div className="min-h-[20px]">
                                            {touched.confirmPassword && errors.confirmPassword && (
                                                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle size={12} />
                                                    {errors.confirmPassword}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-full sm:w-auto px-6 py-3 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors text-gray-700 flex items-center justify-center gap-2 font-medium"
                            >
                                <RotateCcw size={16} />
                                Reset
                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting || Object.keys(errors).some(key => errors[key] && key !== 'submit')}
                                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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