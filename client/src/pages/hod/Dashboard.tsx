import React, { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, TrendingUp, UserCheck } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export const HODDashboard: React.FC = () => {
    const { user } = useAuth();
    const token = localStorage.getItem('placement_token');
    const [stats, setStats] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const statsRes = await axios.get('http://localhost:5000/api/hod/stats', config);
                setStats(statsRes.data);

                const analyticsRes = await axios.get('http://localhost:5000/api/hod/analytics', config);
                setAnalytics(analyticsRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchData();
    }, [token]);

    if (loading) return <div>Loading Dashboard...</div>;

    const StatCard = ({ title, value, icon: Icon, color }: any) => (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-xl ${color} bg-opacity-10`}>
                <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Department Dashboard</h1>
                    <p className="text-slate-500">Overview of {user?.department || 'Department'} Performance</p>
                </div>
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm">
                    {user?.department} Department
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={stats?.studentCount || 0}
                    icon={GraduationCap}
                    color="text-blue-600 bg-blue-50"
                />
                <StatCard
                    title="Total Staff"
                    value={stats?.staffCount || 0}
                    icon={UserCheck}
                    color="text-violet-600 bg-violet-50"
                />
                <StatCard
                    title="Active Classes"
                    value={stats?.classCount || 0}
                    icon={BookOpen}
                    color="text-emerald-600 bg-emerald-50"
                />
                <StatCard
                    title="Avg Assessment Score"
                    value={analytics?.averageScore || 0}
                    icon={TrendingUp}
                    color="text-orange-600 bg-orange-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Department Analytics</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                            <span className="text-slate-600 font-medium">Assessment Participation</span>
                            <span className="font-bold text-indigo-600">{analytics?.participation || '0%'}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                            <span className="text-slate-600 font-medium">Total Submissions Processed</span>
                            <span className="font-bold text-indigo-600">{analytics?.totalSubmissions || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white">
                    <h3 className="font-bold text-lg mb-2">HOD Notice</h3>
                    <p className="text-indigo-100 text-sm mb-6">
                        You can view all staff and students in your department.
                        Data is strictly read-only. Report any discrepancies to the Administrator.
                    </p>
                    <div className="flex gap-4">
                        {/* Quick links could go here */}
                    </div>
                </div>
            </div>
        </div>
    );
};
