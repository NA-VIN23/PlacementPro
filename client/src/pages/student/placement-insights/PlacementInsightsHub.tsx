import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    GraduationCap,
    TrendingUp,
    Calendar,
    ArrowRight,
    Users
} from 'lucide-react';
import { placementInsightsService } from '../../../services/placementInsightsService';

// Interfaces for response data
interface MockData {
    kpi: {
        totalCompanies: number;
        studentsPlaced: number;
        avgCGPA: number;
    };
    recentCompanies: any[]; // Using any for brevity, better to strict type
    upcomingDrives: any[];
    placementHistory: any[];
}

export const PlacementInsightsHub: React.FC = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<MockData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await placementInsightsService.getOverview();
                setData(res);
            } catch (err) {
                console.error("Failed to load insights", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
    if (!data) return <div className="p-8 text-red-500">Failed to load data.</div>;

    return (
        <div className="space-y-8 animate-fade-in font-sans text-slate-800">
            {/* Header with Sub-Nav */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Placement Insights Hub</h1>
                    <p className="text-slate-500 mt-1">Track history, prepare for drives, and succeed.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/student/placement-insights/history')}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-blue-600 font-medium transition-colors flex items-center gap-2"
                    >
                        <Building2 className="w-4 h-4" />
                        Company History
                    </button>
                    <button
                        onClick={() => navigate('/student/placement-insights/radar')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Calendar className="w-4 h-4" />
                        Placement Radar
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active Companies</p>
                            <h3 className="text-2xl font-bold text-slate-900">{data.kpi.totalCompanies}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Students Placed</p>
                            <h3 className="text-2xl font-bold text-slate-900">{data.kpi.studentsPlaced}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Avg Package Offered</p>
                            <h3 className="text-2xl font-bold text-slate-900">8.5 LPA</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Placement History Chart (Simple Visualization) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Placement Trends (Last 4 Years)
                        </h2>
                    </div>
                    {/* CSS Bar Chart */}
                    <div className="h-64 flex items-end justify-between gap-4 px-4 pb-2 border-b border-slate-200">
                        {data.placementHistory.map((h, i) => {
                            // Mock height calculation based on simple logic
                            const height = Math.min((h.studentsPlaced / 100) * 100, 100);
                            return (
                                <div key={i} className="flex flex-col items-center gap-2 group w-full">
                                    <div className="relative w-full bg-blue-100 rounded-t-lg transition-all duration-500 group-hover:bg-blue-200" style={{ height: `${height * 3}px` }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {h.studentsPlaced} Placed
                                        </div>
                                    </div>
                                    <div className="text-xs font-semibold text-slate-500 text-center truncate w-20">{h.year} - {h.company.split(' ')[0]}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming Drives (Compact) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-orange-500" />
                            Upcoming Drives
                        </h2>
                        <button onClick={() => navigate('/student/placement-insights/radar')} className="text-sm text-blue-600 font-medium hover:underline">View All</button>
                    </div>

                    <div className="space-y-4">
                        {data.upcomingDrives.slice(0, 3).map((drive, i) => (
                            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-bold text-slate-900">{drive.company}</h4>
                                        <p className="text-xs text-slate-500 mt-1">{drive.role}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${drive.status === 'Upcoming' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {drive.status}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className="text-xs text-slate-400 font-medium">{drive.date}</span>
                                    <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                        Details <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Companies */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                        Recent Company Visits
                    </h2>
                    <button onClick={() => navigate('/student/placement-insights/history')} className="text-sm text-blue-600 font-medium hover:underline">View All Companies</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {data.recentCompanies.map((c, i) => (
                        <div key={i} className="group p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer bg-white"
                            onClick={() => navigate(`/student/placement-insights/company/${c.company === 'TechCorp Solutions' ? 'c1' : 'c2'}`)} // Mock ID link
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                                    {c.company.substring(0, 2)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">{c.company}</h4>
                                    <p className="text-xs text-slate-500">{c.year}</p>
                                </div>
                            </div>
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Role:</span>
                                    <span className="font-medium text-slate-700">{c.role}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Pkg:</span>
                                    <span className="font-medium text-slate-700">{c.avgPackage}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
