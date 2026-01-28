import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatsCard } from '../../components/ui/StatsCard';
import { CheckCircle, Clock, Trophy, Target, PlayCircle, Star, ChevronRight, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            {/* Header Section with personalized greeting */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-700 p-8 md:p-12 text-white shadow-xl">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Welcome back, {user?.name.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-brand-100 text-lg mb-8 opacity-90">
                        You're on a 5-day streak! Keep up the momentum to reach your placement goals.
                    </p>
                    <button className="px-6 py-3 bg-white text-brand-700 font-bold rounded-xl hover:bg-brand-50 transition-colors shadow-lg shadow-black/10 inline-flex items-center gap-2">
                        <PlayCircle className="w-5 h-5" />
                        Resume Preparation
                    </button>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <div className="absolute bottom-0 right-20 w-32 h-32 bg-purple-500/20 rounded-full translate-y-1/2 blur-xl"></div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    label="Assessments Passed"
                    value="12"
                    icon={CheckCircle}
                    color="brand"
                    trend="2 this week"
                    trendUp={true}
                />
                <StatsCard
                    label="Pending Tasks"
                    value="3"
                    icon={Clock}
                    color="orange"
                />
                <StatsCard
                    label="Your Rank"
                    value="#42"
                    icon={Trophy}
                    color="purple"
                    trend="Top 5%"
                    trendUp={true}
                />
                <StatsCard
                    label="Avg Score"
                    value="85%"
                    icon={Target}
                    color="emerald"
                    trend="+5% improvement"
                    trendUp={true}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Upcoming Schedule */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Upcoming Schedule</h2>
                            <button className="text-brand-600 font-medium text-sm hover:underline">View Calendar</button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
                            {[
                                { title: "Data Structures Mock Test", date: "Tomorrow, 10:00 AM", tag: "Technical", color: "text-brand-600 bg-brand-50" },
                                { title: "Verbal Ability Quiz", date: "Jan 30, 02:00 PM", tag: "Aptitude", color: "text-purple-600 bg-purple-50" },
                                { title: "HR Interview Practice", date: "Feb 02, 11:00 AM", tag: "Soft Skills", color: "text-emerald-600 bg-emerald-50" },
                            ].map((item, idx) => (
                                <div key={idx} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                    <div className="flex items-center gap-5">
                                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 font-semibold text-xs leading-tight">
                                            <span>{item.date.split(',')[0].substr(0, 3)}</span>
                                            <span className="text-lg text-slate-900">{idx + 29}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 group-hover:text-brand-600 transition-colors text-base">{item.title}</h4>
                                            <p className="text-sm text-slate-400 mt-1">{item.date.split(',')[1]}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", item.color)}>
                                            {item.tag}
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-600 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Performance Chart Placeholder */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Performance Analysis</h2>
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm h-80 flex items-center justify-center bg-[url('https://cdn.dribbble.com/users/1387534/screenshots/16603708/media/a96f30a9051fb264f5146f328f416c14.png?resize=800x600&vertical=center')] bg-cover bg-center opacity-90 grayscale hover:grayscale-0 transition-all duration-500">
                            <div className="bg-white/90 backdrop-blur text-brand-900 px-6 py-3 rounded-lg font-medium shadow-lg">
                                Detailed Analysis Chart Coming Soon
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar: Leaderboard & Challenges */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-yellow-400 mb-2">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="font-bold uppercase tracking-wider text-xs">Daily Challenge</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Code Debugging Master</h3>
                            <p className="text-slate-300 text-sm mb-6">Find and fix the bugs in the given java snippet within 15 minutes.</p>

                            <button
                                onClick={() => navigate('/student/assessment')}
                                className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                Resume Practice
                            </button>
                        </div>

                        {/* Decor */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-500 rounded-full blur-3xl opacity-20"></div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white text-center">
                        <h3 className="text-2xl font-bold mb-2">Weekly Mock Test</h3>
                        <p className="text-indigo-100 mb-6">Complete the weekly challenge to boost your global rank.</p>
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm mb-6 inline-block">
                            <div className="text-3xl font-bold font-mono">23:59:12</div>
                            <div className="text-xs text-indigo-200 mt-1 uppercase tracking-wider">Time Remaining</div>
                        </div>
                        <button
                            onClick={() => navigate('/student/assessment/weekly-challenge')}
                            className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors"
                        >
                            Start Assessment
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800">Top Performers</h3>
                            <span className="text-xs font-bold text-brand-600 uppercase">This Week</span>
                        </div>

                        <div className="space-y-4">
                            {[
                                { name: "Sarah J.", score: "980 pts", img: "SJ" },
                                { name: "Mike R.", score: "945 pts", img: "MR" },
                                { name: "Jessica T.", score: "920 pts", img: "JT" },
                            ].map((p, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white",
                                            i === 0 ? "bg-yellow-400 shadow-yellow-200" :
                                                i === 1 ? "bg-slate-300" : "bg-orange-300"
                                        )}>
                                            {i + 1}
                                        </div>
                                        <span className="font-medium text-slate-700 text-sm">{p.name}</span>
                                    </div>
                                    <span className="font-bold text-slate-900 text-sm">{p.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

