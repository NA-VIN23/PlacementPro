import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { Users, Building, Activity, ShieldCheck } from 'lucide-react';
import { adminService } from '../../services/api';

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total: 0,
        marketing: 0, // Placeholder
        active: 0,
        admins: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const users = await adminService.getUsers();
                setStats({
                    total: users.length,
                    marketing: 0,
                    active: users.filter((u: any) => u.is_active).length,
                    admins: users.filter((u: any) => u.role === 'ADMIN').length
                });
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="animate-fade-in">
            <PageHeader
                title={`Admin Dashboard`}
                description="System overview and user management statistics."
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    label="Total Users"
                    value={stats.total.toString()}
                    icon={Users}
                    color="blue"
                    trend="Registered"
                    trendUp={true}
                />
                <StatsCard
                    label="Departments"
                    value="5"
                    icon={Building}
                    color="purple"
                />
                <StatsCard
                    label="Active Users"
                    value={stats.active.toString()}
                    icon={Activity}
                    color="emerald"
                />
                <StatsCard
                    label="Active Admins"
                    value={stats.admins.toString()}
                    icon={ShieldCheck}
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Placement Statistics</h3>
                    <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                        Chart Placeholder (Placement vs Time)
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/admin/users/add')}
                            className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-lg text-left transition-colors border border-slate-200"
                        >
                            + Add New User
                        </button>
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-lg text-left transition-colors border border-slate-200"
                        >
                            Manage Users
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
