import React from 'react';
import { Mail, ShieldCheck, Activity, Key, Settings, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminProfile: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="h-32 bg-slate-900 relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                </div>
                <div className="px-8 pb-8 flex flex-col md:flex-row items-end -mt-10 gap-6">
                    <div className="w-24 h-24 bg-brand-600 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <div className="flex-1 pb-2 text-center md:text-left">
                        <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
                        <p className="text-slate-500 text-sm font-medium">System Administrator • Since 2023</p>
                    </div>
                    <div className="pb-2">
                        <button className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20">
                            System Logs
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-slate-400" />
                        Account Settings
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-500">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Email Address</p>
                                    <p className="text-xs text-slate-500">{user?.email}</p>
                                </div>
                            </div>
                            <button className="text-brand-600 text-xs font-bold hover:underline">Change</button>
                        </div>

                        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-500">
                                    <Key className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Two-Factor Auth</p>
                                    <p className="text-xs text-slate-500">Enabled</p>
                                </div>
                            </div>
                            <div className="w-8 h-4 bg-emerald-500 rounded-full relative cursor-pointer">
                                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-slate-400" />
                        System Health
                    </h3>

                    <div className="space-y-4">
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-sm font-bold text-emerald-800">All Systems Operational</span>
                            </div>
                            <p className="text-xs text-emerald-600">
                                Database, API Gateway, and Auth Services are running optimally with 99.9% uptime.
                            </p>
                        </div>

                        <div className="flex items-center justify-between p-3 border-b border-slate-50">
                            <span className="text-sm text-slate-600">Database Load</span>
                            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">12%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border-b border-slate-50">
                            <span className="text-sm text-slate-600">Storage Usage</span>
                            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded">45%</span>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6 border-l-4 border-l-red-500">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Critical Alerts</h3>
                            <p className="text-slate-500 text-sm mb-4">No critical security alerts found in the last 24 hours.</p>
                            <button className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline">View Security Log &rarr;</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
