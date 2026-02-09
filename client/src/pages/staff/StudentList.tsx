import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { staffService } from '../../services/api';
import { Search, Filter } from 'lucide-react';
import { PaginatedTable, type Column } from '../../components/ui/PaginatedTable';

interface Student {
    id: string;
    name?: string;
    email: string;
    registration_number?: string;
    department?: string;
    batch?: string;
    created_at: string;
}

export const StudentList: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await staffService.getStudents();
                setStudents(data);
            } catch (error) {
                console.error('Failed to fetch students', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    // Derived Filters
    const filteredStudents = students.filter(s => {
        const matchesSearch =
            (s.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (s.registration_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept = departmentFilter ? s.department === departmentFilter : true;

        return matchesSearch && matchesDept;
    });

    // Extract unique departments for filter dropdown
    const uniqueDepartments = Array.from(new Set(students.map(s => s.department).filter(Boolean))) as string[];

    const columns: Column<Student>[] = [
        {
            header: "Student Info",
            accessor: (student) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                        {(student.name || student.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">{student.name || 'Unknown'}</p>
                        <p className="text-slate-500 text-xs">{student.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Roll Number",
            accessor: (student) => (
                <span className="font-mono text-slate-600">
                    {student.registration_number || '-'}
                </span>
            )
        },
        {
            header: "Department",
            accessor: (student) => (
                <span className="inline-block px-2 py-1 bg-slate-100 rounded text-slate-600 font-medium text-xs">
                    {student.department || 'N/A'}
                </span>
            )
        },
        {
            header: "Batch",
            accessor: (student) => (
                <div className="text-slate-600">
                    {student.batch || '-'}
                </div>
            )
        },
        {
            header: "Joined",
            accessor: (student) => (
                <div className="text-slate-500">
                    {new Date(student.created_at).toLocaleDateString()}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            <PageHeader
                title="Student Database"
                description="View and manage student records."
            />

            {/* Filters */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by Name, Roll No, or Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative min-w-[200px] w-full md:w-auto">
                        <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <select
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="">All Departments</option>
                            {uniqueDepartments.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4">
                <PaginatedTable
                    data={filteredStudents}
                    columns={columns}
                    loading={loading}
                    emptyMessage="No students found matching your filters."
                />
            </div>

            <div className="text-center text-xs text-slate-400 pb-4">
                Showing {filteredStudents.length} of {students.length} students
            </div>
        </div>
    );
};
