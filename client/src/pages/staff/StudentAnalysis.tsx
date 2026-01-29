import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { BarChart2, TrendingUp, Users, AlertTriangle, Download, Filter } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useData } from '../../context/DataContext';

export const StaffStudentAnalysis: React.FC = () => {
    const { users } = useData();

    const students = users.filter(u => u.role === 'STUDENT');

    // Mock additional stats for now since they aren't in the user model
    const enrichedStudents = students.map(s => ({
        ...s,
        score: Math.floor(Math.random() * 40) + 50, // Mock score 50-90
        attendance: `${Math.floor(Math.random() * 20) + 80}%`, // Mock attendance 80-100
        status: ['Excellent', 'Good', 'Average', 'At Risk'][Math.floor(Math.random() * 4)] as 'Excellent' | 'Good' | 'Average' | 'At Risk'
    }));

    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader
                title="Student Performance Analysis"
                description="Comprehensive insights into student progress, strengths, and areas for improvement."
                action={
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm shadow-sm">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                }
            />

            {/* High Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    label="Avg. Class Score"
                    value="76%"
                    icon={BarChart2}
                    color="brand"
                    trend="+2.5%"
                    trendUp={true}
                />
                <StatsCard
                    label="Placement Ready"
                    value={`${enrichedStudents.filter(s => s.status === 'Excellent' || s.status === 'Good').length}`}
                    icon={Users}
                    color="emerald"
                    trend="Students"
                    trendUp={true}
                />
                <StatsCard
                    label="Weak Areas"
                    value="DSA"
                    icon={AlertTriangle}
                    color="orange"
                    trend="Needs Focus"
                    trendUp={false}
                />
                <StatsCard
                    label="Participation"
                    value="92%"
                    icon={TrendingUp}
                    color="blue"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Student Performance List</h3>
                        <div className="flex gap-2">
                            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg">
                                <Filter className="w-4 h-4" />
                            </button>
                            <input type="text" placeholder="Search..." className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Student Name</th>
                                    <th className="px-6 py-4">Avg Score</th>
                                    <th className="px-6 py-4">Attendance</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {enrichedStudents.map((student, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800">{student.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full",
                                                            student.score > 80 ? "bg-emerald-500" :
                                                                student.score < 50 ? "bg-red-500" : "bg-yellow-500"
                                                        )}
                                                        style={{ width: `${student.score}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-slate-500">{student.score}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{student.attendance}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-bold",
                                                student.status === 'Excellent' ? "bg-emerald-100 text-emerald-700" :
                                                    student.status === 'At Risk' ? "bg-red-100 text-red-700" :
                                                        "bg-blue-100 text-blue-700"
                                            )}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-brand-600 hover:underline font-medium text-xs">View Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Side Stats */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4">Skill Distribution</h3>
                        <div className="space-y-4">
                            {[
                                { skill: "Java / OOPS", val: 80, color: "bg-blue-500" },
                                { skill: "Data Structures", val: 65, color: "bg-purple-500" },
                                { skill: "React / Frontend", val: 45, color: "bg-orange-500" },
                                { skill: "Aptitude", val: 90, color: "bg-emerald-500" },
                            ].map((s, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                        <span>{s.skill}</span>
                                        <span>{s.val}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full", s.color)} style={{ width: `${s.val}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-brand-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold mb-2">Automated Report</h3>
                            <p className="text-brand-200 text-sm mb-4">Get a weekly summary of student progress delivered to your email.</p>
                            <button className="px-4 py-2 bg-white text-brand-900 text-sm font-bold rounded-lg hover:bg-brand-50 transition-colors">
                                Enable Now
                            </button>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
