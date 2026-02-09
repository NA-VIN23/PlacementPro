import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/api';
import {
    CheckCircle2,
    FileText,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Star,
    Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Exam } from '../../types';
import PixelTransition from '../../components/PixelTransition';
import KRLogo from '../../assets/KR logo.png';

export const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        assessmentsPassed: 0,
        pendingTasks: 0,
        rank: 'N/A',
        avgScore: '0%',
        activity: [] as { date: string, status: 'attended' | 'missed' }[]
    });

    const getDayStatus = (day: number, current: Date) => {
        const dateStr = new Date(current.getFullYear(), current.getMonth(), day).toLocaleDateString('en-CA');
        return stats.activity?.find(a => a.date === dateStr)?.status;
    };
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        if (exams.length === 0) setLoading(true);
        else setRefreshing(true);

        try {
            const [statsData, examsData] = await Promise.all([
                studentService.getDashboardStats(),
                studentService.getAvailableExams()
            ]);
            setStats(statsData);
            // Sort by latest start_time first
            const sorted = examsData.sort((a: Exam, b: Exam) =>
                new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
            );
            setExams(sorted);
        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getExamStatus = (exam: Exam): 'LOCKED' | 'ACTIVE' | 'COMPLETED' => {
        const now = new Date();
        const start = new Date(exam.start_time);
        const end = new Date(exam.end_time);

        // Adjust for timezone if needed, but assuming ISO strings are handled correctly by Date()
        // If "now" is local and start is UTC, standard Date comparison works if strings are ISO.

        if (now < start) return 'LOCKED';
        if (now > end) return 'COMPLETED';
        return 'ACTIVE';
    };

    return (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-screen pb-8 lg:pb-0">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col gap-4 lg:gap-6 pr-0 lg:pr-1">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            Hello {user?.name?.split(' ')[0] || 'Student'} <span className="text-2xl">👋</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Let's do some productive activities today.</p>
                    </div>
                </div>

                {/* Summary Report Card (Blue) */}
                <div className="">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800">Summary Report</h2>
                    </div>

                    <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden shrink-0">
                        {/* Decorative Background Circles */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

                        {/* Metric 1: Attendance -> Assessments Passed */}
                        <div className="flex items-start gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                                <CheckCircle2 className="w-6 h-6 text-yellow-300" />
                            </div>
                            <div>
                                <p className="text-blue-100 text-sm font-medium mb-1">Assessments</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold">{stats.assessmentsPassed}</h3>
                                    <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded text-white font-medium">Passed</span>
                                </div>
                                <p className="text-xs text-blue-200 mt-2 leading-relaxed opacity-80">
                                    Great, you always completing assessments!
                                </p>
                            </div>
                        </div>

                        {/* Metric 2: Task -> Pending Tasks */}
                        <div className="flex items-start gap-4 relative z-10 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                                <FileText className="w-6 h-6 text-orange-300" />
                            </div>
                            <div>
                                <p className="text-blue-100 text-sm font-medium mb-1">Pending Task</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold">{stats.pendingTasks}</h3>
                                </div>
                                <p className="text-xs text-blue-200 mt-2 leading-relaxed opacity-80">
                                    Don't forget to turn in your tasks.
                                </p>
                            </div>
                        </div>

                        {/* Metric 3: Subject -> Avg Score */}
                        <div className="flex items-start gap-4 relative z-10 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                                <BookOpen className="w-6 h-6 text-emerald-300" />
                            </div>
                            <div>
                                <p className="text-blue-100 text-sm font-medium mb-1">Score</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold">{stats.avgScore}</h3>
                                    <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded text-white font-medium">Pts</span>
                                </div>
                                <p className="text-xs text-blue-200 mt-2 leading-relaxed opacity-80">
                                    Keep improving your subjects score.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lower Section: Score Graph & GPA */}
                <div className="flex-1 flex flex-col md:flex-row gap-4">
                    {/* Available Assessments */}
                    <div className="flex-[2] bg-white rounded-3xl p-5 shadow-sm border border-slate-50 flex flex-col h-[340px] relative">
                        {refreshing && (
                            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-3xl">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-800"></div>
                                    <span className="text-xs font-bold text-slate-800 animate-pulse">Refreshing...</span>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Available Assessments</h2>
                                <p className="text-slate-400 text-xs mt-1">Exams assigned to your batch</p>
                            </div>
                            <button
                                onClick={fetchData}
                                disabled={refreshing || loading}
                                className={`p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors ${refreshing ? 'animate-spin' : ''}`}
                                title="Refresh"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
                            </button>
                        </div>

                        <div className="space-y-4 overflow-y-auto flex-1 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                            {loading ? <div className="text-center text-xs text-slate-400">Loading...</div> :
                                exams.length === 0 ? <div className="text-center text-xs text-slate-400 py-8">No active exams available at the moment.</div> :
                                    exams.map((exam, i) => {
                                        const status = getExamStatus(exam);
                                        const isLocked = status === 'LOCKED';
                                        const isCompleted = status === 'COMPLETED';
                                        const isActive = status === 'ACTIVE';

                                        return (
                                            <div key={i} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-2xl transition-all shadow-sm ${isActive ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {isActive && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 animate-pulse">Live</span>}
                                                        {isLocked && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">Upcoming</span>}
                                                        {isCompleted && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600">Finished</span>}

                                                        <h4 className="font-bold text-slate-800 text-sm truncate">{exam.title}</h4>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                                                        <div className="flex items-center gap-1">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                                            {exam.duration} Mins
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                                                            {new Date(exam.start_time).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (isActive) navigate(`/student/assessment/${exam.id}`);
                                                        if (isCompleted) navigate(`/student/assessment/result/${exam.id}`);
                                                    }}
                                                    disabled={isLocked}
                                                    className={`px-6 py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-2 group whitespace-nowrap
                                                        ${isActive ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200' : ''}
                                                        ${isLocked ? 'bg-slate-100 text-slate-400 border-slate-100 cursor-not-allowed' : ''}
                                                        ${isCompleted ? 'bg-white text-slate-600 border-slate-200 hover:border-orange-200 hover:text-orange-600' : ''}
                                                    `}
                                                >
                                                    {isLocked && <span className="flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> Locked</span>}
                                                    {isActive && <span className="flex items-center gap-2"><Play className="w-3 h-3 fill-current" /> Start Now</span>}
                                                    {isCompleted && <span>View Results</span>}
                                                </button>
                                            </div>
                                        );
                                    })}
                        </div>
                    </div>

                    {/* Right Column: Rank & Learning Module */}
                    <div className="flex-1 flex flex-col gap-4">
                        {/* GPA / Rank Card */}
                        <div className="bg-gradient-to-b from-blue-400 to-indigo-500 rounded-3xl p-5 shadow-xl shadow-blue-100 text-white relative overflow-hidden flex flex-col justify-center items-center text-center h-36 shrink-0">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10 scale-90">
                                <h3 className="text-indigo-100 font-medium text-xs mb-2 uppercase tracking-widest">Your Rank</h3>
                                <div className="text-5xl font-bold mb-2 tracking-tighter">{stats.rank === 'N/A' ? '-' : stats.rank}</div>
                                <p className="text-[10px] text-indigo-100 opacity-80">Global Rank</p>
                            </div>
                            {/* Bottom Illustration Mock */}
                            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>

                        {/* Start Learning Card */}
                        <div className="bg-blue-600 rounded-3xl p-5 shadow-xl shadow-blue-200 text-white relative overflow-hidden flex flex-col justify-center gap-3 h-[180px]">
                            {/* Decorative Gradients */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/3"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-white/10 rounded-lg">
                                        <Star className="w-3 h-3 text-yellow-300 fill-current" />
                                    </div>
                                    <span className="text-[10px] font-bold text-blue-100 tracking-wider uppercase">Learning Module</span>
                                </div>
                                <h2 className="text-lg font-bold mb-2 leading-tight">Start Learning</h2>
                                <p className="text-blue-100/80 text-[11px] leading-relaxed mb-0">
                                    Explore concepts across multiple topics with structured lessons.
                                </p>
                            </div>

                            <button
                                onClick={() => navigate('/student/learning')}
                                className="relative z-10 w-full py-2.5 bg-white hover:bg-blue-50 text-blue-600 text-xs font-bold rounded-xl shadow-lg shadow-blue-900/10 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Play className="w-3 h-3 fill-current group-hover:scale-110 transition-transform" />
                                Let's Start
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel (Profile & Schedule) */}
            <div className="w-full lg:w-64 bg-white lg:bg-transparent flex flex-col gap-4 lg:gap-6 shrink-0">
                {/* Spacer to align Calendar with Summary Report (matches Header height + Summary Title) */}
                <div className="hidden lg:block h-[102px] shrink-0"></div>

                {/* Real-time Working Calendar */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-50 h-[250px] shrink-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-slate-800 text-base">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-2 text-slate-400">
                            <ChevronLeft
                                className="w-5 h-5 cursor-pointer hover:text-slate-600"
                                onClick={handlePrevMonth}
                            />
                            <ChevronRight
                                className="w-5 h-5 cursor-pointer hover:text-slate-600"
                                onClick={handleNextMonth}
                            />
                        </div>
                    </div>
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-600 font-medium mb-1">
                        <span className="text-slate-300">S</span>
                        <span className="text-slate-300">M</span>
                        <span className="text-slate-300">T</span>
                        <span className="text-slate-300">W</span>
                        <span className="text-slate-300">T</span>
                        <span className="text-slate-300">F</span>
                        <span className="text-slate-300">S</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium content-center">
                        {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => (
                            <span key={`empty-${i}`} className="text-slate-300"></span>
                        ))}
                        {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
                            const day = i + 1;
                            const status = getDayStatus(day, currentDate);
                            const isToday = day === new Date().getDate() &&
                                currentDate.getMonth() === new Date().getMonth() &&
                                currentDate.getFullYear() === new Date().getFullYear();

                            // Priority: Status (Green/Red) > Today (Blue)
                            // User requirement: "if nothings happens on that day then no circle of color is needed" (unless it's Today? User said "Today's date circle is blue as default")
                            // So:
                            // - Attended -> Green
                            // - Missed -> Red
                            // - Today (and no status) -> Blue
                            // - Else -> None

                            let bgClass = 'text-slate-600 hover:bg-slate-100';
                            if (status === 'attended') {
                                bgClass = 'bg-green-500 text-white shadow-md shadow-green-200';
                            } else if (status === 'missed') {
                                bgClass = 'bg-red-500 text-white shadow-md shadow-red-200';
                            } else if (isToday) {
                                bgClass = 'bg-blue-600 text-white shadow-md shadow-blue-200';
                            }

                            return (
                                <span
                                    key={day}
                                    className={`flex items-center justify-center rounded-full w-6 h-6 cursor-pointer transition-all text-[11px] ${bgClass}`}
                                >
                                    {day}
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* KR Logo Pixel Transition */}
                <div className="w-full h-[200px] mt-2">
                    <PixelTransition
                        firstContent={
                            <div className="w-full h-full flex items-center justify-center bg-white rounded-[15px]">
                                <img
                                    src={KRLogo}
                                    alt="KR Logo"
                                    className="w-full h-full object-contain p-4"
                                />
                            </div>
                        }
                        secondContent={
                            <div className="w-full h-full flex items-center justify-center bg-white rounded-[15px]">
                                <img src="/logo.png" alt="PlacementPrePro" className="w-48 h-48 object-contain" />
                            </div>
                        }
                        gridSize={12}
                        pixelColor="#ffffff"
                        animationStepDuration={0.4}
                        className="w-full h-full rounded-[15px]"
                    />
                </div>


            </div>
        </div>
    );
};
