import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatsCard } from '../../components/ui/StatsCard';
import { CheckCircle, Clock, Trophy, Target, PlayCircle, Star, Calendar, RefreshCw, AlertCircle, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/api';
import type { Exam } from '../../types';

export const StudentDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchExams = async () => {
        setLoading(true);
        try {
            const data = await studentService.getAvailableExams();
            setExams(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch exams', err);
            setError('Could not load exams. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const isExamActive = (exam: Exam) => {
        const now = new Date();
        const start = new Date(exam.start_time);
        const end = new Date(exam.end_time);
        return now >= start && now <= end;
    };

    const getStatusText = (exam: Exam) => {
        if (isExamActive(exam)) return 'Active Now';
        const now = new Date();
        if (now < new Date(exam.start_time)) return 'Upcoming';
        return 'Expired';
    };

    const getStatusColor = (exam: Exam) => {
        if (isExamActive(exam)) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        const now = new Date();
        if (now < new Date(exam.start_time)) return 'text-blue-600 bg-blue-50 border-blue-100';
        return 'text-slate-500 bg-slate-50 border-slate-100';
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-700 p-8 md:p-12 text-white shadow-xl">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
                    </h1>
                    <p className="text-brand-100 text-lg mb-8 opacity-90">
                        You're on a 5-day streak! Keep up the momentum to reach your placement goals.
                    </p>
                    <button className="px-6 py-3 bg-white text-brand-700 font-bold rounded-xl hover:bg-brand-50 transition-colors shadow-lg shadow-black/10 inline-flex items-center gap-2">
                        <PlayCircle className="w-5 h-5" />
                        Resume Preparation
                    </button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <div className="absolute bottom-0 right-20 w-32 h-32 bg-purple-500/20 rounded-full translate-y-1/2 blur-xl"></div>
            </div>

            {/* Quick Stats (Mock for now) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard label="Assessments Passed" value="12" icon={CheckCircle} color="brand" trend="2 this week" trendUp={true} />
                <StatsCard label="Pending Tasks" value="3" icon={Clock} color="orange" />
                <StatsCard label="Your Rank" value="#42" icon={Trophy} color="purple" trend="Top 5%" trendUp={true} />
                <StatsCard label="Avg Score" value="85%" icon={Target} color="emerald" trend="+5% improvement" trendUp={true} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Available Assessments */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Available Assessments</h2>
                                <p className="text-sm text-slate-500">Exams assigned to your batch</p>
                            </div>
                            <button
                                onClick={fetchExams}
                                className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                                title="Refresh List"
                            >
                                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <div className="p-6">
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-slate-400">Loading assessments...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8 bg-red-50 rounded-xl border border-red-100">
                                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                    <p className="text-red-700 font-medium">{error}</p>
                                    <button onClick={fetchExams} className="mt-2 text-sm text-red-600 underline">Try Again</button>
                                </div>
                            ) : exams.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-slate-900 mb-1">No Assessments Available</h3>
                                    <p className="text-slate-500">You're all caught up! Check back later.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {exams.map((exam) => (
                                        <div key={exam.id} className="group relative bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(exam)}`}>
                                                        {getStatusText(exam)}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                                                        {exam.title}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5" /> {exam.duration} Mins</span>
                                                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1.5" /> {new Date(exam.start_time).toLocaleDateString()}</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => navigate(`/student/assessment/${exam.id}`)}
                                                disabled={!isExamActive(exam)}
                                                className={`px-6 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${isExamActive(exam)
                                                    ? 'bg-slate-900 text-white hover:bg-brand-600 shadow-lg shadow-slate-900/20 hover:shadow-brand-600/20 active:scale-95'
                                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                    }`}
                                            >
                                                <Play className="w-4 h-4" />
                                                {isExamActive(exam) ? 'Start' : 'Locked'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
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
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-500 rounded-full blur-3xl opacity-20"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
