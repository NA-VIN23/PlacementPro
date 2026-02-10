import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, User, GraduationCap, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { UserRole } from '../types';
import { cn } from '../utils/cn';
import LightRays from '../components/LightRays';

export const LoginForm: React.FC = () => {
    const { role } = useParams<{ role: string }>();
    const navigate = useNavigate();
    const { login } = useAuth();
    const { error: toastError } = useToast();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Validate role
    const validRoles = ['student', 'staff', 'admin', 'hod'];

    const { user, isAuthenticated } = useAuth();

    React.useEffect(() => {
        if (isAuthenticated && user) {
            const dashboard = user.role === 'STUDENT' ? '/student/dashboard' :
                user.role === 'STAFF' ? '/staff/dashboard' :
                    user.role === 'HOD' ? '/hod/dashboard' :
                        '/admin/dashboard';
            navigate(dashboard, { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    if (!role || !validRoles.includes(role)) {
        return <div className="p-8 text-center">Invalid Role selected. <button onClick={() => navigate('/')} className="text-blue-600 underline">Go Back</button></div>;
    }

    const currentRole = role.toUpperCase() as UserRole;

    const roleConfig = {
        STUDENT: {
            label: 'Student Login',
            identifierLabel: 'Registration Number',
            identifierPlaceholder: 'e.g. CS2024001',
            icon: GraduationCap,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        STAFF: {
            label: 'Staff Login',
            identifierLabel: 'College Email',
            identifierPlaceholder: 'e.g. sharma@college.edu',
            icon: User,
            color: 'text-violet-600',
            bgColor: 'bg-violet-50'
        },
        HOD: {
            label: 'HOD Login',
            identifierLabel: 'HOD Email',
            identifierPlaceholder: 'e.g. ithod@college.edu',
            icon: User,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50'
        },
        ADMIN: {
            label: 'Admin Login',
            identifierLabel: 'Administrator Email',
            identifierPlaceholder: 'e.g. admin@college.edu',
            icon: Lock,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50'
        }
    };

    const config = roleConfig[currentRole];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate network delay
        try {
            await login(identifier, password, currentRole);
            setLoading(false);

            navigate(
                currentRole === 'STUDENT' ? '/student/dashboard' :
                    currentRole === 'STAFF' ? '/staff/dashboard' :
                        currentRole === 'HOD' ? '/hod/dashboard' :
                            '/admin/dashboard'
            );
        } catch (error: any) {
            console.error('Login failed:', error);
            setLoading(false);
            toastError("Wrong Credentials or Check your Connection");
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans text-slate-900 overflow-hidden">
            {/* Left Section: Form */}
            <div className="w-full lg:w-[40%] flex flex-col p-8 lg:p-12 relative z-20">
                {/* Branding */}
                <div className="flex items-center gap-3 mb-16">
                    <img src="/logo.png" alt="PlacementPrePro" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-lg tracking-tight text-black">PlacementPrePro </span>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full -mt-20">
                    <div className="mb-10">
                        <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase mb-4">WELCOME BACK</p>
                        <h1 className="text-5xl font-serif font-bold text-slate-900 mb-3 leading-tight tracking-tight">
                            {config.label.split(' ')[0]} Login<span className="text-blue-600">.</span>
                        </h1>

                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">{config.identifierLabel}</label>
                            <div className="relative group">
                                <input
                                    type={currentRole === 'STUDENT' ? 'text' : 'email'}
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full pl-5 pr-12 py-3.5 rounded-xl bg-[#EFF6FF] border-transparent focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all outline-none font-medium text-sm text-slate-700 placeholder:text-slate-400"
                                    placeholder={config.identifierPlaceholder}
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                                    <config.icon className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">Password</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-5 pr-12 py-3.5 rounded-xl bg-[#EFF6FF] border-transparent focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all outline-none font-medium text-sm text-slate-700 placeholder:text-slate-400"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                                >
                                    {showPassword ? (
                                        <Lock className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full py-3.5 rounded-full text-white font-bold text-sm shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] transition-all hover:shadow-[0_15px_25px_-10px_rgba(37,99,235,0.6)] hover:-translate-y-0.5 mt-4",
                                loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                            )}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-[10px] text-slate-400 font-medium tracking-wide">
                    © 2026 PlacementPrePro. All rights reserved.
                </div>
            </div>

            {/* Right Section: Image with Curve */}
            <div className="hidden lg:flex lg:w-[60%] fixed right-0 top-0 bottom-0 overflow-hidden z-10 bg-black items-center justify-center lg:pl-36">
                {/* Organic Curve Divider */}
                <div className="absolute top-0 left-0 h-full w-[45vh] z-20 pointer-events-none -translate-x-[1px]">
                    <svg className="h-full w-full text-white fill-current" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M 0 0 L 50 0 C 110 30 0 70 50 100 L 0 100 Z" />
                    </svg>
                </div>

                <div className="absolute inset-0 w-full h-full pointer-events-none z-10 pl-47.86">
                    <LightRays
                        raysOrigin="top-center"
                        raysColor="#ffffff"
                        raysSpeed={1.5}
                        lightSpread={1.5}
                        rayLength={6}
                        followMouse={true}
                        mouseInfluence={0.1}
                        noiseAmount={0}
                        distortion={0}
                        pulsating={false}
                        fadeDistance={1}
                        saturation={1}
                    />
                </div>

                <img
                    src="/login-bg.png"
                    alt="PlacementPro Background"
                    className="w-[90%] h-auto object-contain relative z-0 brightness-125"
                />
            </div>
        </div>
    );
};
