import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn';

export const RoleSelection: React.FC = () => {
    const navigate = useNavigate();

    const roles = [
        {
            id: 'student',
            label: 'Student',
            description: 'Learning, Assessments, & Growth',
            icon: GraduationCap,
            color: 'from-blue-500 to-cyan-500',
            activeBorder: 'border-blue-500',
            activeBg: 'bg-blue-50',
            activeRing: 'ring-blue-100',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
        },
        {
            id: 'staff',
            label: 'Faculty',
            description: 'Management, Grading, & Analytics',
            icon: Briefcase,
            color: 'from-violet-500 to-purple-500',
            activeBorder: 'border-violet-500',
            activeBg: 'bg-violet-50',
            activeRing: 'ring-violet-100',
            iconBg: 'bg-violet-50',
            iconColor: 'text-violet-600',
        }
    ] as const;

    return (
        <div className="min-h-screen flex w-full bg-[#fafafa]">
            {/* Safe Area for Mobile / Tablet */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-brand-900/90 to-purple-900/90"></div>

                {/* Animated decorative blobs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

                <div className="relative z-10 max-w-lg text-white space-y-8">
                    <div className="inline-block px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-sm font-medium tracking-wide">
                        🚀 PlacementPro v2.0
                    </div>
                    <h1 className="text-6xl font-extrabold leading-tight tracking-tight">
                        Shape Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                            Future Career
                        </span>
                    </h1>
                    <p className="text-lg text-slate-300 leading-relaxed font-light">
                        The comprehensive platform for college placement preparation. Master technical skills, ace interviews, and land your dream job with AI-powered insights.
                    </p>

                    <div className="space-y-4 pt-4">
                        {['AI-Driven Mock Interviews', 'Real-time Skill Assessment', 'Industry Standard Aptitude Tests'].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                <span className="text-slate-200 font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Role Selection Section */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-16 relative">
                <div className="w-full max-w-md space-y-10 animate-fade-in">
                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
                        <p className="text-slate-500">Select your role to continue to login.</p>
                    </div>

                    <div className="space-y-4">
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                onClick={() => navigate(`/login/${role.id}`)}
                                className={cn(
                                    "w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 text-left group relative overflow-hidden",
                                    "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50 hover:shadow-lg hover:shadow-slate-200/50 hover:scale-[1.02] transform"
                                )}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                                    role.iconBg
                                )}>
                                    <role.icon className={cn("w-6 h-6", role.iconColor)} />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors">
                                        {role.label}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">{role.description}</p>
                                </div>

                                <div className="pr-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                    <ArrowRight className="w-5 h-5 text-slate-400" />
                                </div>
                            </button>
                        ))}
                    </div>

                    <p className="text-center text-xs text-slate-400 mt-8">
                        Need help? Contact system administrator.
                    </p>
                </div>
            </div>
        </div>
    );
};
