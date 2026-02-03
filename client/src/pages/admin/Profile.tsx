import React, { useState } from 'react';
import { Mail, ShieldCheck, Settings, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/api';

export const AdminProfile: React.FC = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [email, setEmail] = useState(user?.email || '');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async () => {
        setLoading(true);
        try {
            await adminService.updateProfile({ email });
            setIsEditing(false);
            alert('Profile updated successfully!');
            // Ideally update local user context here if needed, or force reload
        } catch (error) {
            console.error("Failed to update profile", error);
            alert('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            {/* Header Card */}
            {/* Header Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center text-white shadow-xl rotate-3 hover:rotate-0 transition-all duration-300">
                    <ShieldCheck className="w-10 h-10" />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-slate-900">{user?.name}</h1>
                    <p className="text-slate-500 font-medium">Administrator Profile</p>
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-xl text-xs font-bold text-emerald-700 border border-emerald-100">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        Active Status
                    </div>
                </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-8">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4">
                    <Settings className="w-5 h-5 text-slate-400" />
                    Account Settings
                </h3>

                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-xl border border-slate-100 text-slate-500 shadow-sm">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</p>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="px-3 py-1 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full"
                                    />
                                ) : (
                                    <p className="text-lg text-slate-900 font-medium">{email}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        disabled={loading}
                                        className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
                                >
                                    Change Email
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
