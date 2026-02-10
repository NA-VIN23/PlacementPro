import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { hodService } from '../../services/api';
import { BarChart, Users, TrendingUp, BookOpen, ArrowRight, ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';
import { PaginatedTable, type Column } from '../../components/ui/PaginatedTable';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: any;
    trend?: string;
    color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, trend, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
        <div>
            <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
            {trend && (
                <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
                    <TrendingUp className="w-3 h-3" />
                    {trend}
                </div>
            )}
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
    </div>
);

export const HODAnalytics: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [staffPerformance, setStaffPerformance] = useState<any[]>([]);

    // Comparison State
    const [classA, setClassA] = useState('');
    const [classB, setClassB] = useState('');
    const [comparisonData, setComparisonData] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // 1. Overall Stats
            const overall = await hodService.getAnalytics();
            setStats(overall);

            // 2. Staff List
            const staff = await hodService.getStaff();
            setStaffList(staff);

            // 3. Fetch Performance for EACH staff (Parallel)
            // Note: In a real large app, this should be paginated or single API call
            if (staff && staff.length > 0) {
                const performances = await Promise.all(
                    staff.map(async (s: any) => {
                        const perf = await hodService.getStaffPerformance(s.id).catch(() => null);
                        return perf ? { ...perf, staffId: s.id, staffName: s.name } : null;
                    })
                );
                setStaffPerformance(performances.filter(Boolean));
            }

        } catch (error) {
            console.error("Failed to load analytics", error);
        }
    };

    const handleCompare = async () => {
        if (!classA || !classB) return;
        try {
            const data = await hodService.compareClasses(classA, classB);
            setComparisonData(data);
        } catch (error) {
            console.error("Comparison failed", error);
        }
    };

    const columns: Column<any>[] = [
        {
            header: "Class Advisor",
            accessor: (item) => (
                <div>
                    <div
                        className="font-bold text-slate-800 hover:text-blue-600 cursor-pointer flex items-center gap-2 group"
                        onClick={() => navigate(`/hod/analytics/${item.staffId}`)}
                    >
                        {item.staffName}
                        <Eye className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-xs text-slate-500">Class Advisor</div>
                </div>
            )
        },
        {
            header: "Students",
            accessor: (item) => (
                <span className="text-slate-600">{item.studentCount}</span>
            )
        },
        {
            header: "Avg Score",
            accessor: (item) => (
                <span className={`font-bold ${item.averageScore >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                    {item.averageScore}%
                </span>
            )
        },
        {
            header: "Participation",
            accessor: (item) => (
                <span className="text-slate-600">{item.participation}%</span>
            )
        },
        {
            header: "Assessments",
            accessor: (item) => (
                <span className="text-slate-600">{item.assessmentCount}</span>
            )
        },
        {
            header: "Status",
            accessor: (item) => {
                if (item.averageScore >= 75) {
                    return (
                        <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                            <ArrowUpRight className="w-3 h-3" /> Excellent
                        </span>
                    );
                } else if (item.averageScore >= 50) {
                    return (
                        <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                            <ArrowRight className="w-3 h-3" /> Average
                        </span>
                    );
                } else {
                    return (
                        <span className="bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                            <ArrowDownRight className="w-3 h-3" /> Needs Focus
                        </span>
                    );
                }
            }
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            <PageHeader
                title="Department Analytics"
                description="Monitor performance metrics across all classes in your department."
            />

            {/* Overview Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard
                        title="Average Score"
                        value={`${stats.averageScore}%`}
                        icon={BarChart}
                        color="bg-blue-500"
                        trend="+2.4% vs last month"
                    />
                    <MetricCard
                        title="Avg. Participation"
                        value={stats.participation}
                        icon={Users}
                        color="bg-purple-500"
                    />
                    <MetricCard
                        title="Assessments Conducted"
                        value={stats.totalSubmissions || 0}
                        icon={BookOpen}
                        color="bg-orange-500"
                    />
                </div>
            )}

            {/* Class Performance Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4">
                <div className="mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-500" />
                        Class Performance
                    </h3>
                </div>
                <PaginatedTable
                    data={staffPerformance}
                    columns={columns}
                    emptyMessage="No class data available. Ensure staff have assigned students."
                />
            </div>

            {/* Class Comparison */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-xl overflow-hidden p-8 text-white">
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-blue-400" />
                            Class Comparison
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">Select two classes to compare performance metrics side-by-side.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Class A (Advisor)</label>
                        <select
                            className="w-full bg-slate-700 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
                            value={classA}
                            onChange={(e) => setClassA(e.target.value)}
                        >
                            <option value="">Select Staff...</option>
                            {staffList.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.department})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-center md:pb-3">
                        <div className="bg-slate-700 p-2 rounded-full text-slate-400 font-bold text-xs">VS</div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Class B (Advisor)</label>
                        <select
                            className="w-full bg-slate-700 border-none rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
                            value={classB}
                            onChange={(e) => setClassB(e.target.value)}
                        >
                            <option value="">Select Staff...</option>
                            {staffList.filter(s => s.id !== classA).map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.department})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleCompare}
                        disabled={!classA || !classB}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                    >
                        Compare Performace
                    </button>
                </div>

                {comparisonData && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-700 pt-8 animate-fade-in">
                        {/* Class A Stats */}
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                            <h4 className="font-bold text-lg text-blue-400 mb-4">{comparisonData.classA.staffName}</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between border-b border-slate-700 pb-2">
                                    <span className="text-slate-400">Avg Score</span>
                                    <span className="font-bold text-xl">{comparisonData.classA.averageScore}%</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-700 pb-2">
                                    <span className="text-slate-400">Participation</span>
                                    <span className="font-bold">{comparisonData.classA.participation}%</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-700 pb-2">
                                    <span className="text-slate-400">Student Count</span>
                                    <span className="font-bold">{comparisonData.classA.studentCount}</span>
                                </div>
                                <div className="pt-2">
                                    <span className="text-slate-400 text-sm block mb-2">Weak Areas</span>
                                    <div className="flex gap-2 flex-wrap">
                                        {comparisonData.classA.weakTopics.map((t: string, i: number) => (
                                            <span key={i} className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded-md border border-red-500/20">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Class B Stats */}
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                            <h4 className="font-bold text-lg text-purple-400 mb-4">{comparisonData.classB.staffName}</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between border-b border-slate-700 pb-2">
                                    <span className="text-slate-400">Avg Score</span>
                                    <span className="font-bold text-xl">{comparisonData.classB.averageScore}%</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-700 pb-2">
                                    <span className="text-slate-400">Participation</span>
                                    <span className="font-bold">{comparisonData.classB.participation}%</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-700 pb-2">
                                    <span className="text-slate-400">Student Count</span>
                                    <span className="font-bold">{comparisonData.classB.studentCount}</span>
                                </div>
                                <div className="pt-2">
                                    <span className="text-slate-400 text-sm block mb-2">Weak Areas</span>
                                    <div className="flex gap-2 flex-wrap">
                                        {comparisonData.classB.weakTopics.map((t: string, i: number) => (
                                            <span key={i} className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded-md border border-red-500/20">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
