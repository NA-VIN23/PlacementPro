import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { Users, FileCheck, MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StaffDashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <div>
            <PageHeader
                title={`Welcome, ${user?.name}`}
                description="Overview of student performance and pending assignments."
                action={
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        + New Assessment
                    </button>
                }
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    label="Total Students"
                    value="120"
                    icon={Users}
                    color="blue"
                />
                <StatsCard
                    label="Assessments Graded"
                    value="45"
                    icon={FileCheck}
                    color="emerald"
                    trend="15 pending"
                    trendUp={false}
                />
                <StatsCard
                    label="Scheduled Interviews"
                    value="8"
                    icon={MessageSquare}
                    color="purple"
                    trend="for this week"
                    trendUp={true}
                />
                <StatsCard
                    label="At Risk Students"
                    value="5"
                    icon={AlertCircle}
                    color="orange"
                    trend="Needs attention"
                    trendUp={false}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Submissions */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800">Recent Submissions needs Grading</h3>
                    </div>
                    <div className="p-0">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3">Student</th>
                                    <th className="px-6 py-3">Test</th>
                                    <th className="px-6 py-3">Submitted</th>
                                    <th className="px-6 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[
                                    { name: "Amit Patel", test: "Java Basics", time: "2 hrs ago" },
                                    { name: "Priya Singh", test: "Aptitude 101", time: "4 hrs ago" },
                                    { name: "Rohan Das", test: "Data Structures", time: "Yesterday" },
                                ].map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800">{row.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{row.test}</td>
                                        <td className="px-6 py-4 text-slate-500">{row.time}</td>
                                        <td className="px-6 py-4">
                                            <button className="text-blue-600 font-medium hover:text-blue-800">Grade</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Upcoming Mock Interviews */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-800">Upcoming Mock Interviews</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {[
                            { name: "Sneha Gupta", time: "Today, 03:00 PM", type: "HR Round" },
                            { name: "Vikram Malhotra", time: "Tomorrow, 10:00 AM", type: "Technical" },
                            { name: "Arjun Reddy", time: "Tomorrow, 02:00 PM", type: "Technical" },
                        ].map((item, idx) => (
                            <div key={idx} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                                    {item.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-800">{item.name}</h4>
                                    <p className="text-sm text-slate-500">{item.time} • {item.type}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
