import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { Users, Building, Activity, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <div>
            <PageHeader
                title={`Admin Dashboard`}
                description="System overview and user management statistics."
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    label="Total Users"
                    value="1,245"
                    icon={Users}
                    color="blue"
                    trend="+45 this month"
                    trendUp={true}
                />
                <StatsCard
                    label="Placement Partners"
                    value="24"
                    icon={Building}
                    color="purple"
                />
                <StatsCard
                    label="System Health"
                    value="99.9%"
                    icon={Activity}
                    color="emerald"
                />
                <StatsCard
                    label="Active Admins"
                    value="3"
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
                        <button className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-lg text-left transition-colors border border-slate-200">
                            + Add New Student Batch
                        </button>
                        <button className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-lg text-left transition-colors border border-slate-200">
                            + Add Faculty Member
                        </button>
                        <button className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-lg text-left transition-colors border border-slate-200">
                            Manage Roles & Permissions
                        </button>
                        <button className="w-full py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-lg text-left transition-colors border border-slate-200">
                            System Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
