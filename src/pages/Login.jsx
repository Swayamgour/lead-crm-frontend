// Login.jsx
import React, { useState } from 'react';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    ArrowRight,
    MessageSquare,
    Users,
    BarChart3,
    Shield,
    CheckCircle,
    Facebook,
    Mail as MailIcon,
    Chrome
} from 'lucide-react';
import { useLoginMutation } from '../redux/api';
import { useNavigate } from 'react-router-dom';

import logo from "../assets/logo.png";
import toast from 'react-hot-toast';



const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // use2

    const validateForm = () => {
        const newErrors = {};
        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 3) {
            newErrors.password = 'Password must be at least 4 characters';
        }
        return newErrors;
    };

    const [login] = useLoginMutation()

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();

        if (Object.keys(newErrors).length === 0) {

            setIsLoading(true);

            try {

                const body = {
                    email: email,
                    password: password
                };

                const res = await login(body);

                console.log();

                if (res?.data?.token) {

                    localStorage.setItem("token", res.data.token);
                    if (res?.data?.user?.role === "admin") {
                        navigate('/');

                    } else {
                        navigate('/Leads');
                    }


                } else {
                    // console.log("Login failed");
                    toast.error(res?.error?.data?.message)
                }

            } catch (error) {
                console.log("Login error:", error);
            }

            setIsLoading(false);

        } else {
            setErrors(newErrors);
        }
    };

    // Features list for the right side
    const features = [
        { icon: MessageSquare, text: 'WhatsApp Chatbot Integration', color: 'text-green-500' },
        { icon: Users, text: 'Lead Management & Tracking', color: 'text-blue-500' },
        { icon: BarChart3, text: 'Real-time Analytics', color: 'text-purple-500' },
        { icon: Shield, text: 'Secure & Encrypted', color: 'text-red-500' },
    ];

    return (
        <div className="min-h-screen  bg-gradient-to-br from-blue-600 to-purple-700">
            <div className="flex min-h-screen items-center justify-center">
                {/* Left Side - Login Form */}
                <div className="w-full  flex items-center justify-center p-8">
                    <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
                        {/* Logo */}
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center space-x-2 mb-4">
                                {/* y */}
                                {/* <img src='/assets/logo.png' alt='dayro Logo' /> */}
                                <img src={logo} alt="Logo" width={200} />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Log in </h2>
                            <p className="text-gray-600">Sign in to manage your leads and chatbot</p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setErrors({ ...errors, email: '' });
                                        }}
                                        className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'
                                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                        placeholder="Enter your email"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setErrors({ ...errors, password: '' });
                                        }}
                                        className={`w-full pl-10 pr-12 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'
                                            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Remember Me & Forgot Password */}
                            {/* <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                                </label>
                                <button
                                    type="button"
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Forgot Password?
                                </button>
                            </div> */}

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <LogIn size={20} className="mr-2" />
                                        Sign In
                                    </>
                                )}
                            </button>

                            {/* Social Login Options */}
                            <div className="relative my-8">
                                {/* <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div> */}
                                {/* <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">Or continue with</span>
                                </div> */}
                            </div>

                            {/* <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Chrome size={20} className="text-gray-700" />
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <MailIcon size={20} className="text-gray-700" />
                                </button>
                                <button
                                    type="button"
                                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Facebook size={20} className="text-blue-600" />
                                </button>
                            </div> */}

                            {/* Sign Up Link */}
                            {/* <p className="text-center text-gray-600">
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Sign up for free
                                </button>
                            </p> */}
                        </form>
                    </div>
                </div>

                {/* Right Side - Hero Section */}

            </div>

            {/* Custom CSS for animations */}
            <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
        </div>
    );
};

export default Login;