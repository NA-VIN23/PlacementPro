import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { Users, FileCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/api';
import PixelTransition from '../../components/PixelTransition';
import KRLogo from '../../assets/KR logo.png';

export const StaffDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeExams: 0,
        avgPerformance: '0%'
    });
    const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const statsData = await staffService.getStats();
                setStats(statsData);

                const submissionsData = await staffService.getAllSubmissions();
                setRecentSubmissions(submissionsData.slice(0, 5)); // Top 5
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            }
        };
        fetchDashboardData();
    }, []);

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
                <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-w-0">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Recent Submissions</h3>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        {recentSubmissions.length === 0 ? (
                            <div className="p-6 text-center text-slate-400">No submissions yet.</div>
                        ) : (
                            <table className="w-full text-sm text-left min-w-[600px]">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3">Student</th>
                                        <th className="px-6 py-3">Test</th>
                                        <th className="px-6 py-3">Score</th>
                                        <th className="px-6 py-3">Submitted</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentSubmissions.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-800">
                                                {row.users?.name || row.student_id}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {row.exams?.title || 'Unknown Exam'}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-blue-600">
                                                {row.score}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {new Date(row.submitted_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
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
