import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import { PaginatedTable, type Column } from '../../components/ui/PaginatedTable';

export const HODStudentList: React.FC = () => {
    const token = localStorage.getItem('placement_token');
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [staffList, setStaffList] = useState<any[]>([]);
    const [selectedStaffId, setSelectedStaffId] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch both students and staff
                const [studentsRes, staffRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/hod/students', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:5000/api/hod/staff', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                setStudents(studentsRes.data);
                setStaffList(staffRes.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchInitialData();
    }, [token]);

    const filteredStudents = useMemo(() => {
        if (!selectedStaffId) return [];

        const staff = staffList.find(s => s.id === selectedStaffId);
        if (!staff || !staff.batch || !staff.batch.startsWith('RANGE:')) return [];

        const [range, extrasStr] = staff.batch.replace('RANGE:', '').split('|');
        const [start, end] = range.split(':');
        const extras = extrasStr ? extrasStr.split(',') : [];

        const apparentStudents = students.filter(s => {
            const regNo = s.registration_number;
            if (!regNo) return false;
            const inRange = (start && end) ? (regNo >= start && regNo <= end) : false;
            const inExtras = extras.includes(regNo);
            return inRange || inExtras;
        });

        return apparentStudents.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.registration_number && s.registration_number.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [students, staffList, selectedStaffId, searchTerm]);

    const columns: Column<any>[] = [
        {
            header: "Student",
            accessor: (student) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                        {student.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Registration No",
            accessor: (student) => (
                <span className="font-mono text-sm text-slate-600">
                    {student.registration_number || '-'}
                </span>
            )
        },
        {
            header: "Batch",
            accessor: (student) => (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                    {student.batch || 'N/A'}
                </span>
            )
        },
        {
            header: "Status",
            accessor: (student) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${student.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {student.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        }
    ];

    if (loading) return <div>Loading Students...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Department Students</h1>
                    <p className="text-slate-500">View all students in your department ({students.length})</p>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by Name or Reg No..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                </div>
            </div>

            {/* Staff Selector */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Class Advisor (Staff)</label>
                <select
                    className="w-full md:w-1/3 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                >
                    <option value="">-- Select Staff --</option>
                    {staffList.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.department})</option>
                    ))}
                </select>
                <p className="text-xs text-slate-500 mt-2">
                    * You must select a staff member to view their assigned students.
                </p>
            </div>

            {!selectedStaffId && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <p className="text-slate-500 font-medium">Please select a Class Advisor to view student details.</p>
                </div>
            )}

            {selectedStaffId && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <PaginatedTable
                        data={filteredStudents}
                        columns={columns}
                        emptyMessage="No students found."
                    />
                </div>
            )}
        </div>
    );
};
