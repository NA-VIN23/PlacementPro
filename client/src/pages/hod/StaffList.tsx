import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Mail } from 'lucide-react';
import { PaginatedTable, type Column } from '../../components/ui/PaginatedTable';

export const HODStaffList: React.FC = () => {
    const token = localStorage.getItem('placement_token');
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/hod/staff', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStaff(res.data);
            } catch (error) {
                console.error("Failed to fetch staff", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchStaff();
    }, [token]);

    const formatAssignment = (batchString: string) => {
        if (!batchString) return 'No Assignment';
        if (batchString.startsWith('RANGE:')) {
            const [range, extras] = batchString.replace('RANGE:', '').split('|');
            const [start, end] = range.split(':');
            const extraCount = extras ? extras.split(',').length : 0;
            return `${start} - ${end}${extraCount > 0 ? ` (+${extraCount})` : ''}`;
        }
        return batchString;
    };

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns: Column<any>[] = [
        {
            header: "Staff Member",
            accessor: (member) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                        {member.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-900">{member.name}</span>
                </div>
            )
        },
        {
            header: "Email",
            accessor: (member) => (
                <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3 h-3" />
                    {member.email}
                </div>
            )
        },
        {
            header: "Assigned Classes",
            accessor: (member) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {formatAssignment(member.batch)}
                </span>
            )
        },
        {
            header: "Status",
            accessor: (member) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${member.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {member.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        }
    ];

    if (loading) return <div>Loading Staff...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Department Staff</h1>
                    <p className="text-slate-500">View all staff members in your department</p>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search staff..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <PaginatedTable
                    data={filteredStaff}
                    columns={columns}
                    emptyMessage="No staff found."
                />
            </div>
        </div>
    );
};
