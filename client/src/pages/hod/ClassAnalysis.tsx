import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatsCard } from '../../components/ui/StatsCard';
import { PaginatedTable, type Column } from '../../components/ui/PaginatedTable';
import { hodService } from '../../services/api';
import { BarChart2, TrendingUp, Users, AlertTriangle, ArrowLeft } from 'lucide-react';

interface StudentAnalysis {
    id: string;
    name: string;
    registration_number: string;
    averageScore: number;
    participation: number;
    lastAssessment: string;
    status: string;
}

export const HODClassAnalysis: React.FC = () => {
    const { staffId } = useParams<{ staffId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!staffId) return;
            try {
                // Call the Updated API: /hod/staff/:staffId/students
                const res = await hodService.getStaffStudents(staffId);
                setData(res);
            } catch (error) {
                console.error("Failed to fetch class analysis", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalysis();
    }, [staffId]);

    const filteredStudents = useMemo(() => {
        return data?.students?.filter((s: any) =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];
    }, [data, searchTerm]);

    const columns: Column<StudentAnalysis>[] = [
        {
            header: "Student",
            accessor: (student) => (
                <div className="font-semibold text-slate-800">{student.name}</div>
            )
        },
        {
            header: "Reg No",
            accessor: (student) => (
                <span className="font-mono text-sm text-slate-600">{student.registration_number || '-'}</span>
            )
        },
        {
            header: "Avg Score",
            accessor: (student) => (
                <span className={`font-bold ${student.averageScore >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                    {student.averageScore}%
                </span>
            )
        },
        {
            header: "Participation",
            accessor: (student) => <span className="text-slate-600">{student.participation}%</span>
        },
        {
            header: "Last Assessment",
            accessor: (student) => <span className="text-slate-500 text-sm">{student.lastAssessment}</span>
        },
        {
            header: "Status",
            accessor: (student) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${student.status === 'Good' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {student.status}
                </span>
            )
        }
    ];

    if (loading) return <div>Loading Analysis...</div>;

    // Only return 'not found' if data is completely missing (API error)
    if (!data) return <div className="p-8 text-center text-red-500">Analysis could not be loaded. Please try again.</div>;

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            <button
                onClick={() => navigate('/hod/analytics')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-2"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Department Analytics
            </button>

            <PageHeader
                title={`Class Analysis - ${data.staff?.name || 'Unknown Staff'}`}
                description="Detailed performance metrics for students in this class."
            />

            {/* High Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard
                    label="Avg. Score"
                    value={`${data.summary?.avgScore || 0}%`}
                    icon={BarChart2}
                    color="blue"
                />
                <StatsCard
                    label="Assessments"
                    value={data.summary?.assessmentCount || 0}
                    icon={Users}
                    color="emerald"
                />
                <StatsCard
                    label="Participation"
                    value={`${data.summary?.participation || 0}%`}
                    icon={TrendingUp}
                    color="purple"
                />
                <StatsCard
                    label="Weak Areas"
                    value={data.summary?.weakestTopic || 'N/A'}
                    icon={AlertTriangle}
                    color="orange"
                />
            </div>

            {/* Student Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Student Performance</h3>
                    <input
                        type="text"
                        placeholder="Search student..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64"
                    />
                </div>

                <PaginatedTable<StudentAnalysis>
                    data={filteredStudents}
                    columns={columns}
                    pageSizeOptions={[10, 25, 50]}
                    defaultPageSize={10}
                    emptyMessage="No students found."
                />
            </div>
        </div>
    );
};
