import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { Users, FileCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/api';
import PixelTransition from '../../components/PixelTransition';
import KRLogo from '../../assets/KR logo.png';
import { PaginatedTable, type Column } from '../../components/ui/PaginatedTable';

export const StaffDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeExams: 0,
        avgPerformance: '0%'
    });
    const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);

    const [refreshing, setRefreshing] = useState(false);

    const fetchDashboardData = async (silent = false) => {
        if (!silent) setRefreshing(true);
        try {
            const statsData = await staffService.getStats();
            setStats(statsData);

            const submissionsData = await staffService.getAllSubmissions();

            // Ensure sorted by date DESC before grouping
            submissionsData.sort((a: any, b: any) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

            // Group by student+exam to show unique latest submission with attempt count
            const uniqueMap = new Map();
            submissionsData.forEach((sub: any) => {
                const key = `${sub.student_id}-${sub.exam_id}`;
                if (uniqueMap.has(key)) {
                    const existing = uniqueMap.get(key);
                    existing.totalAttempts = (existing.totalAttempts || 1) + 1;
                } else {
                    sub.totalAttempts = 1;
                    uniqueMap.set(key, sub);
                }
            });

            setRecentSubmissions(Array.from(uniqueMap.values()));
        } catch (err) {
            console.error("Failed to fetch dashboard data", err);
        } finally {
            if (!silent) setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        const interval = setInterval(() => {
            fetchDashboardData(true);
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, []);

    const columns: Column<any>[] = [
        {
            header: "Student",
            accessor: (row) => (
                <div className="font-medium text-slate-800">
                    {row.users?.name || row.student_id}
                </div>
            )
        },
        {
            header: "Test",
            accessor: (row) => (
                <div className="text-slate-600">
                    {row.exams?.title || 'Unknown Exam'}
                </div>
            )
        },
        {
            header: "Score",
            accessor: (row) => (
                <div className="font-bold text-blue-600">
                    {row.score}
                </div>
            )
        },
        {
            header: "Attempts",
            accessor: (row) => (
                <div className="text-slate-600 font-medium ml-4">
                    {row.totalAttempts || 1}
                </div>
            )
        },
        {
            header: "Violations",
            accessor: (row) => {
                const count = row.answers?._metadata?.violationCount || 0;

                if (count === 0) return <span className="text-slate-400">-</span>;

                return (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold">
                        {count}
                    </span>
                );
            }
        },
        {
            header: "Submitted",
            accessor: (row) => (
                <div className="text-slate-500 text-xs">
                    {new Date(row.submitted_at).toLocaleString()}
                </div>
            )
        }
    ];

    return (
        <div className="animate-fade-in">
            <PageHeader
                title={`Welcome, ${user?.name || 'Staff'}`}
                description="Overview of student performance and recent activity."
                action={
                    <button
                        onClick={() => navigate('/staff/assign-assessment')}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                    >
                        + New Assessment
                    </button>
                }
            />

            {/* Stats Grid - 3 Columns now */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                    label="Total Students"
                    value={stats.totalStudents.toString()}
                    icon={Users}
                    color="blue"
                />
                <StatsCard
                    label="Active Exams"
                    value={stats.activeExams.toString()}
                    icon={FileCheck}
                    color="emerald"
                    trend="Live Now"
                    trendUp={true}
                />
                <StatsCard
                    label="Avg Performance"
                    value={stats.avgPerformance}
                    icon={AlertCircle}
                    color="purple"
                    trend="Overall"
                    trendUp={true}
                />
            </div>

            {/* Main Content Layout: Recent Submissions (Flex-1) + KR Card (Fixed Sidebar) */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Recent Submissions */}
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-w-0 flex flex-col h-[500px] relative">
                    {refreshing && (
                        <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-800"></div>
                                <span className="text-xs font-bold text-slate-800 animate-pulse">Refreshing...</span>
                            </div>
                        </div>
                    )}
                    <div className="p-6 pb-2 flex justify-between items-center shrink-0">
                        <h3 className="font-bold text-slate-800">Recent Submissions</h3>
                        <button
                            onClick={() => fetchDashboardData(false)}
                            disabled={refreshing}
                            className={`p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors ${refreshing ? 'animate-spin' : ''}`}
                            title="Refresh Submissions"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden p-4 pt-0">
                        <PaginatedTable
                            data={recentSubmissions}
                            columns={columns}
                            defaultPageSize={5}
                            pageSizeOptions={[5, 10, 20]}
                            emptyMessage="No submissions yet."
                        />
                    </div>
                </div>

                {/* KR Logo Card (Replaces Upcoming Mock Interviews) */}
                <div className="w-full lg:w-64 shrink-0 h-[200px]">
                    <PixelTransition
                        firstContent={
                            <div className="w-full h-full flex items-center justify-center bg-white rounded-[15px] border border-slate-50 shadow-sm">
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
