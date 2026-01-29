import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Search, Clock, HelpCircle, BarChart, ArrowRight, CheckCircle2, Code, Brain } from 'lucide-react';
import { cn } from '../../utils/cn';
import { studentService } from '../../services/api';

type CategoryFilter = 'ALL' | 'Weekly' | 'Daily';

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
    const [filter, setFilter] = useState<CategoryFilter>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        weeksCompleted: 0,
        avgScore: '0%',
        assessmentAvailable: 0
    });
    const [allAssessments, setAllAssessments] = useState<any[]>([]);

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                const data = await studentService.getAssessmentPageData();
                setStats(data.stats);
                setAllAssessments(data.assessments);
            } catch (error) {
                console.error('Failed to load assessment data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssessments();
    }, []);

    const isWeekly = (title: string) => title.toLowerCase().includes('week');

    // 1. Weekly Assessments List
    const weeklyAssessments: WeeklyAssessment[] = allAssessments
        .filter(a => isWeekly(a.title) && (filter === 'ALL' || filter === 'Weekly'))
        .filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(a => ({
            id: a.id,
            week: parseInt(a.title.match(/Week (\d+)/i)?.[1] || '0'),
            title: a.title,
            status: a.status,
            dueDate: a.dueDate,
            parts: [{
                name: 'Full Assessment',
                type: 'Technical',
                questions: a.questions,
                duration: a.duration,
                icon: Code,
                color: 'bg-blue-50 text-blue-600 border-blue-200'
            }]
        }));

    // 2. Daily/Other Assessments List
    const filteredAssessments = allAssessments
        .filter(a => !isWeekly(a.title) && (filter === 'ALL' || filter === 'Daily'))
        .filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(a => ({
            id: a.id,
            title: a.title,
            type: 'Technical', // Default type
            status: a.status === 'Completed' ? 'Completed' : 'Pending', // pending/completed
            duration: a.duration,
            questions: a.questions
        }));

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
                        <h3 className="text-3xl font-bold mb-1">{stats.weeksCompleted}</h3>
                        <p className="text-indigo-100 font-medium">Weeks Completed</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <BarChart className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Performance</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-800 mb-1">{stats.avgScore}</h3>
                        <p className="text-slate-500 font-medium">Average Score</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">Active</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-800 mb-1">{stats.assessmentAvailable}</h3>
                        <p className="text-slate-500 font-medium">Assessment Available</p>
                    </div>
                </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    {(['ALL', 'Weekly', 'Daily'] as CategoryFilter[]).map(cat => (
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

            {/* Weekly Assessment Cards */}
            {weeklyAssessments.length > 0 && (
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

                                    {/* Parts Breakdown - Simplified */}
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

            {/* Individual/Daily Assessment Cards */}
            {filteredAssessments.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAssessments.map((assessment) => (
                        <div key={assessment.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold",
                                        "bg-orange-50 text-orange-600"
                                    )}>
                                        Daily
                                    </span>
                                    {assessment.status === 'Available' && (
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
                    ))}
                </div>
            )}

            {loading && (
                <div className="col-span-full text-center py-12 text-slate-400">
                    <p>Loading assessments...</p>
                </div>
            )}

            {!loading && weeklyAssessments.length === 0 && filteredAssessments.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-400">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No assessments found.</p>
                </div>
            )}
        </div>
    );
};
