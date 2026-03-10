import React, { useState } from "react";
import {
    User,
    Phone,
    Mail,
    Lock,
    Briefcase,
    Calendar,
    MapPin,
    Award,
    Shield,
    Eye,
    EyeOff,
    CheckCircle,
    XCircle,
    AlertCircle,
    Camera,
    Upload,
    Download,
    Save,
    RotateCcw,
    Users,
    Star,
    TrendingUp,
    Target,
    Clock,
    BadgeCheck,
    Fingerprint,
    Key,
    Smartphone,
    Globe,
    Github,
    Linkedin,
    Twitter,
    Instagram,
    Facebook,
    MessageCircle,
    FileText,
    Image,
    Video,
    Link,
    ChevronDown,
    ChevronUp,
    Plus,
    Minus,
    Settings,
    HelpCircle,
    ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreateUserMutation } from "../../redux/api";

function AddExecutive() {
    const [executive, setExecutive] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",

    });

    const navigate = useNavigate()


    const [addExecutive] = useCreateUserMutation()

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [activeTab, setActiveTab] = useState("personal");
    const [errors, setErrors] = useState({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [skillInput, setSkillInput] = useState("");
    const [languageInput, setLanguageInput] = useState("");


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

        if (!executive.password) newErrors.password = "Password is required";
        else if (executive.password.length < 8) newErrors.password = "Password must be at least 8 characters";

        if (executive.password !== executive.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (executive.phone && executive.emergencyContact && !/^\d{10}$/.test(executive.emergencyContact)) {
            newErrors.emergencyContact = "Enter a valid 10-digit phone number";
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

        try {

            const formData = new FormData();

            formData.append("name", executive.name);
            formData.append("phone", executive.phone);
            formData.append("email", executive.email);
            formData.append("password", executive.password);
            // formData.append("confirmPassword", executive.confirmPassword);

            // image agar hai
            if (profileImage) {
                formData.append("avatar", profileImage);
            }

            const res = await addExecutive(formData).unwrap();

            console.log(res);

            setShowSuccess(true);
            navigate(-1)


            setTimeout(() => setShowSuccess(false), 3000);

            setExecutive({
                name: "",
                phone: "",
                email: "",
                password: "",
                confirmPassword: ""
            });

            setProfileImage(null);
            setErrors({});

        } catch (error) {
            console.error(error);
        }
    };

    const handleReset = () => {
        setExecutive({
            name: "",
            phone: "",
            email: "",
            password: "",
            confirmPassword: "",
            role: "Sales Executive",
            department: "Sales",
            employeeId: "",
            joiningDate: "",
            designation: "",
            experience: "",
            qualification: "",
            address: "",
            city: "",
            state: "",
            pincode: "",
            emergencyContact: "",
            bloodGroup: "",
            dateOfBirth: "",
            panNumber: "",
            aadharNumber: "",
            bankAccount: "",
            ifscCode: "",
            salary: "",
            target: "",
            commission: "",
            reportingManager: "",
            team: "",
            skills: [],
            languages: [],
            certifications: [],
            documents: []
        });
        setProfileImage(null);
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
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            <div className="max-w-5xl mx-auto">

                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Executive</span>
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
                        <p className="text-green-800">Executive added successfully! Redirecting...</p>
                    </div>
                )}

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header with Gradient */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 md:px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                <User className="text-white" size={28} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Add Sales Executive</h1>
                                <p className="text-blue-100 mt-1">Create a new sales team member profile</p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Image Upload */}
                    <div className="px-6 md:px-8 py-6 border-b border-gray-100">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-3xl overflow-hidden">
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        executive.name ? executive.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'EX'
                                    )}
                                </div>
                                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                                    <Camera size={16} className="text-white" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800">Profile Photo</h3>
                                <p className="text-sm text-gray-500 mt-1">Upload a profile picture (JPG, PNG, GIF)</p>
                                <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                    <Upload size={14} />
                                    Upload Photo
                                </button>
                            </div>
                        </div>
                    </div>



                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        {/* Personal Info Tab */}
                        {activeTab === "personal" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Full Name */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                name="name"
                                                value={executive.name}
                                                onChange={handleChange}
                                                placeholder="Enter executive's full name"
                                                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all
                                                    ${errors.name
                                                        ? 'border-red-300 focus:ring-red-200'
                                                        : 'border-gray-200 focus:ring-blue-200'
                                                    }`}
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
                                                value={executive.phone}
                                                onChange={handleChange}
                                                placeholder="10-digit mobile number"
                                                maxLength="10"
                                                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all
                                                    ${errors.phone
                                                        ? 'border-red-300 focus:ring-red-200'
                                                        : 'border-gray-200 focus:ring-blue-200'
                                                    }`}
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
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={executive.email}
                                                onChange={handleChange}
                                                placeholder="executive@company.com"
                                                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all
                                                    ${errors.email
                                                        ? 'border-red-300 focus:ring-red-200'
                                                        : 'border-gray-200 focus:ring-blue-200'
                                                    }`}
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle size={12} />
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={executive.password}
                                                onChange={handleChange}
                                                placeholder="Create password"
                                                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all
                                                    ${errors.password
                                                        ? 'border-red-300 focus:ring-red-200'
                                                        : 'border-gray-200 focus:ring-blue-200'
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                            {errors.password && (
                                                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle size={12} />
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm Password <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={executive.confirmPassword}
                                                onChange={handleChange}
                                                placeholder="Confirm password"
                                                className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all
                                                    ${errors.confirmPassword
                                                        ? 'border-red-300 focus:ring-red-200'
                                                        : 'border-gray-200 focus:ring-blue-200'
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                            {errors.confirmPassword && (
                                                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle size={12} />
                                                    {errors.confirmPassword}
                                                </p>
                                            )}
                                        </div>
                                    </div>



                                </div>

                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="w-full sm:w-auto px-6 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={16} />
                                Reset Form
                            </button>

                            <button
                                type="submit"
                                className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                                <Save size={16} />
                                Save Executive
                            </button>
                        </div>





                    </form>
                </div>

                {/* Help Section */}
                <div className="mt-6 bg-blue-50 rounded-lg p-4 flex items-start gap-3">
                    <HelpCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                        <h4 className="text-sm font-medium text-blue-800">Need help adding an executive?</h4>
                        <p className="text-xs text-blue-600 mt-1">
                            Fill in the required information for the new sales executive. All fields marked with <span className="text-red-500">*</span> are mandatory.
                            The executive will receive login credentials via email.
                        </p>
                    </div>
                </div>
            </div>

            {/* Add CSS animations */}
            <style jsx>{`
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
                    animation: slideDown 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

export default AddExecutive;