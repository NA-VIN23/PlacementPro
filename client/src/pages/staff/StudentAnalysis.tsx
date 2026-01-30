import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { BarChart2, TrendingUp, Users, AlertTriangle, Download, Filter } from 'lucide-react';
import { cn } from '../../utils/cn';
import { staffService } from '../../services/api';

export const StaffStudentAnalysis: React.FC = () => {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ totalStudents: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subsData, statsData] = await Promise.all([
                    staffService.getAllSubmissions(),
                    staffService.getStats()
                ]);
                setSubmissions(subsData);
                setStats(statsData);
            } catch (error) {
                console.error("Failed to fetch analysis data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Derived Stats
    const totalSubmissions = submissions.length;

    // Avg Score
    const avgScore = totalSubmissions > 0
        ? Math.round(submissions.reduce((acc, curr) => acc + (curr.score / (curr.total || 5) * 100), 0) / totalSubmissions)
        : 0;

    // Participation: Unique students who submitted / Total Students
    const uniqueStudents = new Set(submissions.map(s => s.student_id)).size;
    const participationRate = stats.totalStudents > 0
        ? Math.round((uniqueStudents / stats.totalStudents) * 100)
        : 0;

    // Weak Areas: Exam with lowest average score
    let weakArea = "N/A";
    if (submissions.length > 0) {
        const examScores: Record<string, { total: number, count: number }> = {};

        submissions.forEach(sub => {
            const title = sub.exams?.title || "Unknown";
            if (!examScores[title]) examScores[title] = { total: 0, count: 0 };
            // Normalize score to percentage
            const percentage = (sub.score / (sub.total || 5)) * 100;
            examScores[title].total += percentage;
            examScores[title].count += 1;
        });

        let minAvg = 101;

        Object.entries(examScores).forEach(([title, data]) => {
            const avg = data.total / data.count;
            if (avg < minAvg) {
                minAvg = avg;
                weakArea = title;
            }
        });
    }

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
                    label="Avg. Score"
                    value={`${avgScore}%`}
                    icon={BarChart2}
                    color="brand"
                    trend="+2.5%"
                    trendUp={true}
                />
                <StatsCard
                    label="Total Submissions"
                    value={totalSubmissions.toString()}
                    icon={Users}
                    color="emerald"
                    trend="This Week"
                    trendUp={true}
                />
                <StatsCard
                    label="Weakest Topic"
                    value={weakArea}
                    icon={AlertTriangle}
                    color="orange"
                    trend="Needs Focus"
                    trendUp={false}
                />
                <StatsCard
                    label="Participation"
                    value={`${participationRate}%`}
                    icon={TrendingUp}
                    color="blue"
                />
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
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
                                <th className="px-6 py-4">Exam Title</th>
                                <th className="px-6 py-4">Score</th>
                                <th className="px-6 py-4">Submitted At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
                            ) : submissions.length === 0 ? (
                                <tr><td colSpan={4} className="p-4 text-center text-slate-500">No submissions found.</td></tr>
                            ) : (
                                submissions.map((sub, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800">{sub.users?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4 text-slate-600">{sub.exams?.title || 'Unknown Exam'}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-bold",
                                                sub.score >= 4 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {sub.score} / {sub.total || 5}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs">
                                            {new Date(sub.submitted_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
