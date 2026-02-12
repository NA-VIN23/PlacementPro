import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Plus, Search, Shield, Mail, CheckCircle, XCircle, Trash2, Upload } from 'lucide-react';
import { cn } from '../../utils/cn';
import { adminService } from '../../services/api';
import { BulkImportModal } from '../../components/admin/BulkImportModal';
import { PaginatedTable, type Column } from '../../components/ui/PaginatedTable';

export const AdminUserManagement: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const fetchUsers = async () => {
        try {
            const data = await adminService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesRole = roleFilter === 'All' ? true : (user.role || '').toUpperCase() === roleFilter.toUpperCase();
        const userName = user.name || '';
        const userEmail = user.email || '';
        const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userEmail.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRole && matchesSearch;
    });

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'Active' ? false : true; // false = Inactive
            await adminService.toggleUserStatus(id, newStatus);
            // Optimistic update or refetch
            setUsers(users.map(u => u.id === id ? { ...u, is_active: newStatus } : u));
        } catch (error) {
            alert('Failed to update user status');
        }
    };

    const handleDeleteUser = async (user: any) => {
        const confirmMessage = `Deleting ${user.name} will permanently remove:\n\n• All exam data\n• All submissions\n• All scores and history\n\nThis action CANNOT be undone.\nDo you want to continue?`;
        if (!confirm(confirmMessage)) return;

        try {
            await adminService.deleteUser(user.id);
            setUsers(users.filter(u => u.id !== user.id));
        } catch (error: any) {
            console.error("Delete failed", error);
            const msg = error.response?.data?.message || 'Failed to delete user';
            const details = error.response?.data?.details || '';
            alert(`${msg}${details ? `\nDetails: ${details}` : ''}`);
        }
    };

    const columns: Column<any>[] = [
        {
            header: "Name / Email",
            accessor: (user) => (
                <div>
                    <p className="font-bold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {user.email}
                    </p>
                </div>
            )
        },
        {
            header: "Role",
            accessor: (user) => (
                <span className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
                    user.role === 'STUDENT' ? "bg-blue-50 text-blue-700 border-blue-100" :
                        user.role === 'STAFF' ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                            user.role === 'HOD' ? "bg-violet-50 text-violet-700 border-violet-100" :
                                "bg-slate-100 text-slate-700 border-slate-200"
                )}>
                    {user.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                    {user.role}
                </span>
            )
        },
        {
            header: "Detail",
            accessor: (user) => (
                <span className="text-slate-600">
                    {user.registration_number || '-'}
                </span>
            )
        },
        {
            header: "Status",
            accessor: (user) => (
                <div className="flex items-center gap-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full", user.is_active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-red-500")}></div>
                    <span className="text-slate-700 font-medium">{user.is_active ? 'Active' : 'Inactive'}</span>
                </div>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            headerClassName: "text-right",
            accessor: (user) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => handleToggleStatus(user.id, user.is_active ? 'Active' : 'Inactive')}
                        className={cn("p-2 rounded-xl transition-colors", user.is_active ? "text-slate-400 hover:text-red-600 hover:bg-red-50" : "text-slate-400 hover:text-green-600 hover:bg-green-50")}
                        title={user.is_active ? "Deactivate" : "Activate"}
                    >
                        {user.is_active ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title={`Delete ${user.role}`}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader
                title="User Management"
                description="Manage students, faculty, and administrative accounts."
                action={
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="px-4 py-2 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                        >
                            <Upload className="w-5 h-5" />
                            Bulk Import
                        </button>
                        <button
                            onClick={() => navigate('/admin/users/add')}
                            className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add User
                        </button>
                    </div>
                }
            />

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                {/* Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {['All', 'Student', 'Staff', 'HOD', 'Admin'].map(role => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-bold rounded-xl transition-all",
                                    roleFilter === role ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {role}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search filtered users..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <PaginatedTable
                    data={filteredUsers}
                    columns={columns}
                    loading={loading}
                    emptyMessage="No users found matching your criteria."
                />
            </div>

            <BulkImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={() => {
                    fetchUsers();
                }}
            />
        </div>
    );
};
