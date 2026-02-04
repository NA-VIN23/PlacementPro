import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { User, Mail, Lock, BookOpen, Hash, Building2, Save, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { adminService } from '../../services/api';

export const AdminAddUser: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [role, setRole] = useState<'Student' | 'Staff' | 'Admin'>('Student');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        // Student specific
        batch: '2024',
        branch: '',
        rollNumber: '',
        // Staff specific
        department: '',
        designation: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        setIsSubmitting(true);
        try {
            await adminService.addUser({
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                password: formData.password,
                role: role.toUpperCase() as any,
                registration_number: role === 'Student' ? formData.rollNumber : undefined,
                batch: role === 'Student' ? formData.batch : undefined,
                department: role === 'Student' ? formData.branch : (role === 'Staff' ? formData.department : undefined),
            });

            alert(`${role} created successfully!`);
            navigate('/admin/users');
        } catch (error: any) {
            console.error("Failed to add user", error);
            alert(error.response?.data?.message || "Failed to create user. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <PageHeader
                    title="Add New User"
                    description="Create a new account for a student, staff member, or administrator."
                />
                <button
                    onClick={() => navigate('/admin/users')}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Role Tabs */}
                <div className="border-b border-slate-100 bg-slate-50 p-4">
                    <div className="flex bg-slate-200/50 p-1 rounded-2xl w-full max-w-lg mx-auto">
                        {['Student', 'Staff', 'Admin'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRole(r as any)}
                                className={cn(
                                    "flex-1 py-2 text-sm font-bold rounded-xl transition-all shadow-sm",
                                    role === r
                                        ? "bg-white text-slate-800 shadow"
                                        : "bg-transparent text-slate-500 hover:text-slate-700 shadow-none"
                                )}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Common Fields */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-500" />
                            Personal Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="e.g. Rahul"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="e.g. Kumar"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="e.g. rahul@college.edu"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Role Specific Fields */}
                    {role === 'Student' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-500" />
                                Academic Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Batch Year</label>
                                    <select
                                        name="batch"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white cursor-pointer"
                                        onChange={handleChange}
                                    >
                                        <option>2023</option>
                                        <option>2024</option>
                                        <option>2025</option>
                                        <option>2026</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Branch / Stream</label>
                                    <input
                                        type="text"
                                        name="branch"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="e.g. Computer Science"
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Roll Number / Student ID</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            name="rollNumber"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            placeholder="e.g. CSE-2024-001"
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {role === 'Staff' && (
                        <div className="space-y-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-500" />
                                Department Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Department</label>
                                    <select
                                        name="department"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white cursor-pointer"
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Department</option>
                                        <option>IT</option>
                                        <option>CSE</option>
                                        <option>CSBS</option>
                                        <option>EEE</option>
                                        <option>MECH</option>
                                        <option>ECE</option>
                                        <option>AIDS</option>
                                        <option>AIML</option>
                                        <option>CIVIL</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Designation</label>
                                    <input
                                        type="text"
                                        name="designation"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="e.g. Assistant Professor"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="h-px bg-slate-100" />

                    {/* Security */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-blue-500" />
                            Security
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/users')}
                            className="px-6 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {isSubmitting ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
