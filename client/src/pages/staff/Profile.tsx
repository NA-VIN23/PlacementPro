import React, { useState, useEffect } from 'react';
import { Mail, Save, Edit2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/api';
import DotGrid from '../../components/DotGrid';

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
                <div className="h-40 bg-slate-900 rounded-t-3xl rounded-b-3xl overflow-hidden relative shadow-md">
                    <DotGrid
                        dotSize={4}
                        gap={20}
                        baseColor="#334155" // slate-700
                        activeColor="#60a5fa" // blue-400
                        proximity={120}
                        shockRadius={250}
                        shockStrength={5}
                        resistance={750}
                        returnDuration={1.5}
                        className="opacity-80"
                    />
                    {/* Overlay Text/Image if needed, but user just said update banner */}
                </div>

                <div className="relative px-8 pb-4 flex flex-col md:flex-row items-end -mt-12 gap-6">
                    <div className="w-32 h-32 rounded-3xl border-4 border-white bg-white shadow-lg overflow-hidden shrink-0">
                        <img
                            src={`https://ui-avatars.com/api/?name=${formData.name}&background=4f46e5&color=fff&size=128`}
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
                                    className="text-3xl font-bold w-full border-b-2 border-blue-500 focus:outline-none bg-transparent"
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
                                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Save
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 shadow-sm flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" /> Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <h3 className="font-bold text-slate-800 text-lg">Contact Info</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-600">
                                <Mail className="w-5 h-5 text-slate-400" />
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="text-sm border border-slate-300 rounded-xl px-2 py-1 w-full focus:ring-2 focus:ring-blue-500/20 outline-none"
                                    />
                                ) : (
                                    <span className="text-sm font-medium">{formData.email}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 text-lg mb-4">Activity Log (Real-time)</h3>
                        <div className="space-y-4">
                            {logs.length === 0 ? (
                                <p className="text-slate-400 text-sm italic">No recent activity found.</p>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-3 rounded-xl transition-colors">
                                        <span className="text-sm font-medium text-slate-700">{log.action}</span>
                                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">{log.time}</span>
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
