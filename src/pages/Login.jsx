// Login.jsx
import React, { useState } from 'react';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Users,
    GitBranch,
    Activity,
    Loader2
} from 'lucide-react';
import { useLoginMutation } from '../redux/api';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, selectCurrentToken, selectCurrentUser } from '../redux/slices/authSlice';
import { Navigate, useNavigate } from 'react-router-dom';

import logo from "../assets/logo.png";
import toast from 'react-hot-toast';

// Stages of a lead's journey — mirrors the CRM's own pipeline,
// used as the signature visual on the brand panel.
const PIPELINE_STAGES = [
    { label: 'New Lead', icon: Users },
    { label: 'In Pipeline', icon: GitBranch },
    { label: 'Converted', icon: Activity },
];

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

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

    const [login] = useLoginMutation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true);

            try {
                const body = { email, password };
                const res = await login(body).unwrap();

                if (res?.token) {
                    // Store credentials in Redux (slice also persists to localStorage
                    // so the session survives a page refresh).
                    dispatch(setCredentials({ user: res.user, token: res.token }));

                    if (res?.user?.role === "admin") {
                        navigate('/');
                    } else {
                        navigate('/Leads');
                    }
                } else {
                    toast.error(res?.error?.data?.message || 'Login failed');
                }
            } catch (error) {
                console.log("Login error:", error);
                toast.error(error?.data?.message || 'Invalid email or password');
            }

            setIsLoading(false);
        } else {
            setErrors(newErrors);
        }
    };

    const token = useSelector(selectCurrentToken);
    const user = useSelector(selectCurrentUser);

    if (token && user) {
        if (user.role === "admin") {
            return <Navigate to="/" replace />;
        } else {
            return <Navigate to="/Leads" replace />;
        }
    }

    return (
        <div className="min-h-screen flex bg-[var(--brand-slate-50)]">

            {/* Left — Brand / Pipeline panel */}
            <div className="hidden lg:flex lg:w-[46%] relative flex-col justify-between overflow-hidden bg-[var(--brand-navy-950)] px-12 py-12">

                {/* ambient glow */}
                <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[var(--brand-blue-600)] opacity-20 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[var(--brand-amber-500)] opacity-10 blur-3xl" />

                <div className="relative z-10 flex items-center">
                    <img src={logo} alt="Logo" width={140} className="brightness-0 invert" />
                </div>

                <div className="relative z-10 max-w-sm">
                    <h1 className="font-[var(--font-display)] text-4xl font-bold text-white leading-tight mb-4">
                        Every lead,<br />on a clear path.
                    </h1>
                    <p className="text-slate-400 text-base leading-relaxed mb-10">
                        Track leads from first contact to closed deal — one pipeline, one source of truth.
                    </p>

                    {/* Signature element: pipeline flow */}
                    <div className="flex items-center gap-2">
                        {PIPELINE_STAGES.map((stage, i) => {
                            const Icon = stage.icon;
                            return (
                                <React.Fragment key={stage.label}>
                                    <div className="flex flex-col items-center gap-2">
                                        <div
                                            className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/10"
                                            style={{
                                                background: i === 2
                                                    ? 'linear-gradient(135deg, var(--brand-amber-500), var(--brand-amber-400))'
                                                    : 'rgba(255,255,255,0.06)',
                                                animation: `pulse-slow ${3 + i}s ease-in-out infinite`,
                                            }}
                                        >
                                            <Icon size={18} className={i === 2 ? 'text-[var(--brand-navy-950)]' : 'text-[var(--brand-blue-400)]'} />
                                        </div>
                                        <span className="text-[11px] text-slate-500 whitespace-nowrap">{stage.label}</span>
                                    </div>
                                    {i < PIPELINE_STAGES.length - 1 && (
                                        <div className="flex-1 h-px mb-5" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.02))' }} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                <p className="relative z-10 text-xs text-slate-600">
                    © {new Date().getFullYear()} — Internal CRM
                </p>
            </div>

            {/* Right — Form panel */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm">

                    <div className="lg:hidden flex justify-center mb-8">
                        <img src={logo} alt="Logo" width={150} />
                    </div>

                    <div className="mb-8">
                        <h2 className="font-[var(--font-display)] text-2xl font-bold text-slate-900 mb-1.5">Welcome back</h2>
                        <p className="text-sm text-slate-500">Sign in to manage your leads and pipeline</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Email address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setErrors({ ...errors, email: '' });
                                    }}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none
                                        ${errors.email
                                            ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                                            : 'border-slate-200 focus:border-[var(--brand-blue-500)] focus:ring-2 focus:ring-blue-100'
                                        }`}
                                    placeholder="you@company.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setErrors({ ...errors, password: '' });
                                    }}
                                    className={`w-full pl-10 pr-11 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none
                                        ${errors.password
                                            ? 'border-red-400 focus:ring-2 focus:ring-red-100'
                                            : 'border-slate-200 focus:border-[var(--brand-blue-500)] focus:ring-2 focus:ring-blue-100'
                                        }`}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.99]"
                            style={{ background: 'linear-gradient(135deg, var(--brand-blue-600), var(--brand-navy-800))' }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
