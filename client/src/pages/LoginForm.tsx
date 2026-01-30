import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, User, GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { cn } from '../utils/cn';

export const LoginForm: React.FC = () => {
    const { role } = useParams<{ role: string }>();
    const navigate = useNavigate();
    const { login } = useAuth();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Validate role
    const validRoles = ['student', 'staff', 'admin'];

    const { user, isAuthenticated } = useAuth();

    React.useEffect(() => {
        if (isAuthenticated && user) {
            const dashboard = user.role === 'STUDENT' ? '/student/dashboard' :
                user.role === 'STAFF' ? '/staff/dashboard' :
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
            await login(identifier, password);
            setLoading(false);

            navigate(
                currentRole === 'STUDENT' ? '/student/dashboard' :
                    currentRole === 'STAFF' ? '/staff/dashboard' :
                        '/admin/dashboard'
            );
        } catch (error) {
            console.error('Login failed during component submit:', error);
            setLoading(false);
            alert('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Banner */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497294815431-9365093b7331?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-transparent"></div>

                <div className="relative z-10 p-12 max-w-lg text-white">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Role Selection
                    </button>

                    <h1 className="text-4xl font-bold mb-6">Secure Access Portal</h1>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        Welcome to the {role} portal. Please sign in to verify your identity and access your dashboard.
                    </p>
                </div>
            </div>

            {/* Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
                    <div className="flex items-center gap-3 mb-8">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", config.bgColor, config.color)}>
                            <config.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{config.label}</h2>
                            <p className="text-sm text-slate-500">Enter your credentials to continue</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{config.identifierLabel}</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type={currentRole === 'STUDENT' ? 'text' : 'email'}
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                                    placeholder={config.identifierPlaceholder}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-slate-700">Password</label>
                                <a href="#" className="text-xs text-brand-600 hover:underline">Forgot password?</a>
                            </div>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "w-full py-3 px-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95",
                                loading ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20"
                            )}
                        >
                            {loading ? (
                                <span>Signing in...</span>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-400">
                            Protected by PlacementPro Secure Login System
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
