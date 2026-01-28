import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Search, Clock, HelpCircle, BarChart, ArrowRight, CheckCircle2, Code, Brain, Sigma, MessageSquare, Layers } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useData } from '../../context/DataContext';

type CategoryFilter = 'ALL' | 'Technical' | 'Aptitude' | 'Coding';

interface WeeklyAssessment {
    id: string;
    week: number;
    title: string;
    status: 'Available' | 'Completed' | 'Locked';
    dueDate: string;
    parts: {
        name: string;
        type: 'Technical' | 'Aptitude' | 'Coding' | 'Interview';
        questions: number;
        duration: number;
        icon: React.ElementType;
        color: string;
    }[];
}

export const StudentAssessment: React.FC = () => {
    const navigate = useNavigate();
    const { assessments } = useData();
    const [filter, setFilter] = useState<CategoryFilter>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Weekly Assessment Data (Combined Parts A-D)
    const weeklyAssessments: WeeklyAssessment[] = [
        {
            id: 'week-1',
            week: 1,
            title: 'Week 1 - Foundation Assessment',
            status: 'Completed',
            dueDate: '2024-01-15',
            parts: [
                { name: 'Part A: Technical', type: 'Technical', questions: 15, duration: 20, icon: Code, color: 'bg-blue-50 text-blue-600 border-blue-200' },
                { name: 'Part B: Aptitude', type: 'Aptitude', questions: 15, duration: 20, icon: Sigma, color: 'bg-purple-50 text-purple-600 border-purple-200' },
                { name: 'Part C: Coding', type: 'Coding', questions: 2, duration: 30, icon: Layers, color: 'bg-orange-50 text-orange-600 border-orange-200' },
                { name: 'Part D: Mock Interview', type: 'Interview', questions: 5, duration: 15, icon: MessageSquare, color: 'bg-green-50 text-green-600 border-green-200' },
            ]
        },
        {
            id: 'week-2',
            week: 2,
            title: 'Week 2 - Intermediate Assessment',
            status: 'Available',
            dueDate: '2024-01-22',
            parts: [
                { name: 'Part A: Technical', type: 'Technical', questions: 20, duration: 25, icon: Code, color: 'bg-blue-50 text-blue-600 border-blue-200' },
                { name: 'Part B: Aptitude', type: 'Aptitude', questions: 20, duration: 25, icon: Sigma, color: 'bg-purple-50 text-purple-600 border-purple-200' },
                { name: 'Part C: Coding', type: 'Coding', questions: 3, duration: 40, icon: Layers, color: 'bg-orange-50 text-orange-600 border-orange-200' },
                { name: 'Part D: Mock Interview', type: 'Interview', questions: 5, duration: 15, icon: MessageSquare, color: 'bg-green-50 text-green-600 border-green-200' },
            ]
        },
        {
            id: 'week-3',
            week: 3,
            title: 'Week 3 - Advanced Assessment',
            status: 'Locked',
            dueDate: '2024-01-29',
            parts: [
                { name: 'Part A: Technical', type: 'Technical', questions: 25, duration: 30, icon: Code, color: 'bg-blue-50 text-blue-600 border-blue-200' },
                { name: 'Part B: Aptitude', type: 'Aptitude', questions: 25, duration: 30, icon: Sigma, color: 'bg-purple-50 text-purple-600 border-purple-200' },
                { name: 'Part C: Coding', type: 'Coding', questions: 4, duration: 50, icon: Layers, color: 'bg-orange-50 text-orange-600 border-orange-200' },
                { name: 'Part D: Mock Interview', type: 'Interview', questions: 5, duration: 20, icon: MessageSquare, color: 'bg-green-50 text-green-600 border-green-200' },
            ]
        }
    ];

    // Get individual assessments by type for category filter view
    const filteredAssessments = assessments.filter(a => {
        if (filter === 'ALL') return true;
        return a.type === filter;
    }).filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const getTotalDuration = (parts: WeeklyAssessment['parts']) => {
        return parts.reduce((acc, p) => acc + p.duration, 0);
    };

    const getTotalQuestions = (parts: WeeklyAssessment['parts']) => {
        return parts.reduce((acc, p) => acc + p.questions, 0);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader
                title="Assessment Center"
                description="Take weekly assessments covering Technical, Aptitude, Coding & Mock Interview."
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold bg-black/20 px-2 py-1 rounded-lg">All Time</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold mb-1">1</h3>
                        <p className="text-indigo-100 font-medium">Weeks Completed</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <BarChart className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+5%</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-800 mb-1">78%</h3>
                        <p className="text-slate-500 font-medium">Average Score</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">This Week</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-800 mb-1">1</h3>
                        <p className="text-slate-500 font-medium">Assessment Available</p>
                    </div>
                </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    {(['ALL', 'Technical', 'Aptitude', 'Coding'] as CategoryFilter[]).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                filter === cat ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search assessments..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Weekly Assessment Cards (Shown when ALL is selected) */}
            {filter === 'ALL' && (
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-brand-600" />
                        Weekly Assessments
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                        {weeklyAssessments.map((week) => (
                            <div
                                key={week.id}
                                className={cn(
                                    "bg-white rounded-2xl border shadow-sm overflow-hidden transition-all",
                                    week.status === 'Locked' ? "opacity-60 border-slate-200" : "border-slate-200 hover:shadow-lg hover:border-slate-300"
                                )}
                            >
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-xs font-bold",
                                                    week.status === 'Completed' ? "bg-green-100 text-green-700" :
                                                        week.status === 'Available' ? "bg-blue-100 text-blue-700" :
                                                            "bg-slate-100 text-slate-500"
                                                )}>
                                                    {week.status}
                                                </span>
                                                <span className="text-xs text-slate-400">Due: {week.dueDate}</span>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800">{week.title}</h3>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {getTotalDuration(week.parts)} mins
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <HelpCircle className="w-4 h-4" />
                                                {getTotalQuestions(week.parts)} Questions
                                            </div>
                                        </div>
                                    </div>

                                    {/* Parts Breakdown */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                                        {week.parts.map((part, idx) => (
                                            <div key={idx} className={cn("p-4 rounded-xl border flex items-center gap-3", part.color)}>
                                                <part.icon className="w-5 h-5 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="font-bold text-sm truncate">{part.name}</p>
                                                    <p className="text-xs opacity-70">{part.questions} Qs • {part.duration} min</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => week.status === 'Available' && navigate(`/student/assessment/${week.id}`)}
                                        disabled={week.status === 'Locked'}
                                        className={cn(
                                            "w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                                            week.status === 'Completed' ? "bg-green-100 text-green-700 cursor-default" :
                                                week.status === 'Available' ? "bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/30" :
                                                    "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        )}
                                    >
                                        {week.status === 'Completed' ? (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                Completed - View Results
                                            </>
                                        ) : week.status === 'Available' ? (
                                            <>
                                                Start Weekly Assessment
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        ) : (
                                            <>
                                                Locked - Unlocks Soon
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Individual Assessment Cards (Shown when specific category is selected) */}
            {filter !== 'ALL' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAssessments.length > 0 ? filteredAssessments.map((assessment) => (
                        <div key={assessment.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold",
                                        assessment.type === 'Technical' ? "bg-blue-50 text-blue-600" :
                                            assessment.type === 'Aptitude' ? "bg-purple-50 text-purple-600" :
                                                "bg-orange-50 text-orange-600"
                                    )}>
                                        {assessment.type}
                                    </span>
                                    {assessment.status === 'Pending' && (
                                        <span className="flex h-3 w-3 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                    {assessment.title}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {assessment.duration} mins
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <HelpCircle className="w-4 h-4" />
                                        {assessment.questions} Qs
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/student/assessment/${assessment.id}`)}
                                    className="w-full py-3 rounded-xl border-2 border-slate-100 font-bold text-slate-600 group-hover:border-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    Start Assessment
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center py-12 text-slate-400">
                            <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No {filter} assessments found.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
