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
            questions: a.questions,
            start_time: a.start_time,
            end_time: a.end_time
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
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/20 rounded-2xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold bg-black/20 px-3 py-1.5 rounded-full">All Time</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold mb-1">{stats.weeksCompleted}</h3>
                        <p className="text-blue-100 font-medium">Weeks Completed</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/20 rounded-2xl">
                            <BarChart className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-bold bg-black/20 px-3 py-1.5 rounded-full text-white">Performance</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold mb-1">{stats.avgScore}</h3>
                        <p className="text-blue-100 font-medium">Average Score</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/20 rounded-2xl">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-bold bg-black/20 px-3 py-1.5 rounded-full text-white">Active</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold mb-1">{stats.assessmentAvailable}</h3>
                        <p className="text-blue-100 font-medium">Assessment Available</p>
                    </div>
                </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex bg-white p-1.5 rounded-full border border-slate-200 shadow-sm">
                    {(['ALL', 'Weekly', 'Daily'] as CategoryFilter[]).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={cn(
                                "px-6 py-2 rounded-full text-sm font-bold transition-all",
                                filter === cat ? "bg-slate-900 text-white shadow-md border border-slate-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search assessments..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Weekly Assessment Cards */}
            {weeklyAssessments.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-blue-600" />
                        Weekly Assessments
                    </h2>
                    <div className="grid grid-cols-1 gap-6">
                        {weeklyAssessments.map((week) => (
                            <div
                                key={week.id}
                                className={cn(
                                    "bg-white rounded-3xl border shadow-sm overflow-hidden transition-all",
                                    week.status === 'Locked' ? "opacity-60 border-slate-200" : "border-slate-200 hover:shadow-lg hover:border-blue-200"
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
                                            <div key={idx} className={cn("p-4 rounded-2xl border flex items-center gap-3", part.color)}>
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
                                            "w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all",
                                            week.status === 'Completed' ? "bg-green-100 text-green-700 cursor-default" :
                                                week.status === 'Available' ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30" :
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
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Code className="w-5 h-5 text-indigo-600" />
                        Daily Practice
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAssessments.map(t => {
                            const now = new Date();
                            const start = t.start_time ? new Date(t.start_time) : null;
                            const end = t.end_time ? new Date(t.end_time) : null;

                            // Status Logic
                            // Locked if start time exists and is in future
                            const isLocked = start && now < start;
                            const isExpired = end && now > end;
                            const isSubmitted = t.status === 'Completed';
                            // Missed if expired and NOT submitted
                            const isMissed = isExpired && !isSubmitted;

                            // If submitted, can view results ONLY if expired (or immediate if no end time? assume end time exists)
                            const canViewResults = isSubmitted && isExpired;
                            const isWaitingForResult = isSubmitted && !isExpired;

                            return (
                                <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-200 shadow-sm hover:shadow-lg transition-all flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                                            <Code className="w-6 h-6" />
                                        </div>
                                        {isSubmitted ? (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Submitted
                                            </span>
                                        ) : isMissed ? (
                                            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
                                                <HelpCircle className="w-3 h-3" />
                                                Not Attended
                                            </span>
                                        ) : isLocked ? (
                                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Locked
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold animate-pulse">
                                                Live Now
                                            </span>
                                        )}
                                    </div>

                                    <div className="mb-6 flex-1">
                                        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2" title={t.title}>{t.title}</h3>
                                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {t.duration} mins
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <HelpCircle className="w-3.5 h-3.5" />
                                                {t.questions} Questions
                                            </div>
                                        </div>
                                        <div className="mt-3 p-2 bg-slate-50 rounded-lg text-xs space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Starts:</span>
                                                <span className="font-semibold text-slate-700">{start ? start.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Ends:</span>
                                                <span className="font-semibold text-slate-700">{end ? end.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    {canViewResults ? (
                                        <button
                                            onClick={() => navigate(`/student/assessment/result/${t.id}`)}
                                            className="w-full py-3 rounded-xl font-bold transition-all bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center gap-2"
                                        >
                                            View Results <ArrowRight className="w-4 h-4" />
                                        </button>
                                    ) : isWaitingForResult ? (
                                        <button
                                            disabled
                                            className="w-full py-3 rounded-xl font-bold bg-slate-50 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            Results visible after {end?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </button>
                                    ) : isMissed ? (
                                        <button
                                            disabled
                                            className="w-full py-3 rounded-xl font-bold bg-red-50 text-red-400 cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            Not Attended
                                        </button>
                                    ) : isLocked ? (
                                        <button
                                            disabled
                                            className="w-full py-3 rounded-xl font-bold bg-slate-50 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            Starts {start?.toLocaleString()}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate(`/student/assessment/${t.id}`)}
                                            className="w-full py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/25 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                        >
                                            Start Assessment <ArrowRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
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
