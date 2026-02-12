import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { BarChart2, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { staffService } from '../../services/api';
import { PaginatedTable, type Column } from '../../components/ui/PaginatedTable';

export const StaffStudentAnalysis: React.FC = () => {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({ totalStudents: 0 });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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

    const filteredSubmissions = submissions.filter(sub =>
        (sub.users?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns: Column<any>[] = [
        {
            header: "Student Name",
            accessor: (sub) => (
                <span className="font-medium text-slate-800">{sub.users?.name || 'Unknown'}</span>
            )
        },
        {
            header: "Exam Title",
            accessor: (sub) => (
                <span className="text-slate-600">{sub.exams?.title || 'Unknown Exam'}</span>
            )
        },
        {
            header: "Score",
            accessor: (sub) => (
                <span className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-bold",
                    sub.score >= 4 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                )}>
                    {sub.score}
                </span>
            )
        },
        {
            header: "Submitted At",
            accessor: (sub) => (
                <span className="text-slate-500 text-xs">
                    {new Date(sub.submitted_at).toLocaleDateString()}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader
                title="Student Performance Analysis"
                description="Comprehensive insights into student progress, strengths, and areas for improvement."
            />

            {/* High Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    label="Avg. Score"
                    value={`${avgScore}%`}
                    icon={BarChart2}
                    color="blue"
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
                    color="purple"
                />
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <h3 className="font-bold text-slate-800">Student Performance List</h3>
                    <div className="flex gap-2 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search by student name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 flex-1 md:w-64"
                        />
                    </div>
                </div>

                <PaginatedTable
                    data={filteredSubmissions}
                    columns={columns}
                    loading={loading}
                    emptyMessage="No submissions found."
                />
            </div>
        </div>
    );
};
