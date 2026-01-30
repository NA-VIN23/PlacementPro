import React, { useState, useEffect } from 'react';
import { Mail, Save, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/api';

export const StaffProfile: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        department: (user as any)?.department || 'Computer Science'
    });
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await adminService.getLogs();
                setLogs(data);
            } catch (err) {
                console.error("Failed to fetch logs", err);
            }
        };
        fetchLogs();
    }, []);

    const handleUpdate = async () => {
        try {
            await adminService.updateProfile(formData);
            updateUser(formData);
            alert('Profile updated successfully!');
            setIsEditing(false);
            // Ideally update context or force reload to show new name in sidebar/header
        } catch (error) {
            console.error("Failed to update profile", error);
            alert('Failed to update profile');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="relative group">
                <div className="h-40 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2929&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                </div>

                <div className="relative px-8 pb-4 flex flex-col md:flex-row items-end -mt-12 gap-6">
                    <div className="w-32 h-32 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden">
                        <img
                            src={`https://ui-avatars.com/api/?name=${formData.name}&background=6366f1&color=fff&size=128`}
                            alt={formData.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex-1 text-slate-900 pb-2">
                        {isEditing ? (
                            <div className="space-y-2 max-w-md">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="text-3xl font-bold w-full border-b-2 border-brand-500 focus:outline-none bg-transparent"
                                />
                                <input
                                    type="text"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="text-slate-500 font-medium w-full border-b border-slate-300 focus:outline-none bg-transparent"
                                />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-3xl font-bold">{formData.name}</h1>
                                <p className="text-slate-500 font-medium">Staff Member • {formData.department}</p>
                            </>
                        )}
                    </div>

                    <div className="flex gap-3 pb-2">
                        {isEditing ? (
                            <button
                                onClick={handleUpdate}
                                className="px-4 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 shadow-lg flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" /> Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <h3 className="font-bold text-slate-800 text-lg">Contact Info</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-600">
                                <Mail className="w-5 h-5 text-slate-400" />
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="text-sm border border-slate-300 rounded px-2 py-1 w-full"
                                    />
                                ) : (
                                    <span className="text-sm">{formData.email}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 text-lg mb-4">Activity Log (Real-time)</h3>
                        <div className="space-y-4">
                            {logs.length === 0 ? (
                                <p className="text-slate-400 text-sm">No recent activity.</p>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                                        <span className="text-sm font-medium text-slate-700">{log.action}</span>
                                        <span className="text-xs text-slate-400">{log.time}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
