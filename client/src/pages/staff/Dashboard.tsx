import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { Users, FileCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/api';

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
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Submissions */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800">Recent Submissions</h3>
                    </div>
                    <div className="p-0">
                        {recentSubmissions.length === 0 ? (
                            <div className="p-6 text-center text-slate-400">No submissions yet.</div>
                        ) : (
                            <table className="w-full text-sm text-left">
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
                                            <td className="px-6 py-4 font-semibold text-brand-600">
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

                {/* Upcoming Mock Interviews */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-800">Upcoming Mock Interviews</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="text-center text-slate-400 py-8">
                            No upcoming interviews scheduled.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
