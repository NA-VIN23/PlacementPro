import React from 'react';
import { Mail, Phone, MapPin, BookOpen, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StaffProfile: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="relative group">
                <div className="h-40 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2929&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                </div>

                <div className="relative px-8 pb-4 flex flex-col md:flex-row items-end -mt-12 gap-6">
                    <div className="w-32 h-32 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff&size=128`}
                            alt={user?.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex-1 text-slate-900 pb-2">
                        <h1 className="text-3xl font-bold">{user?.name}</h1>
                        <p className="text-slate-500 font-medium">Senior Placement Coordinator • Computer Science Dept</p>
                    </div>

                    <div className="flex gap-3 pb-2">
                        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 shadow-sm">
                            Edit Profile
                        </button>
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
                                <span className="text-sm">{user?.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <Phone className="w-5 h-5 text-slate-400" />
                                <span className="text-sm">+91 99999 88888</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <MapPin className="w-5 h-5 text-slate-400" />
                                <span className="text-sm">Faculty Block A, Room 304</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 text-lg mb-4">Current Responsibilities</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border border-slate-100 rounded-lg flex items-start gap-3 bg-slate-50/50">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <UserCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Placement Coordinator</h4>
                                    <p className="text-xs text-slate-500 mt-1">Leading placement activities for CSE Batch 2024</p>
                                </div>
                            </div>
                            <div className="p-4 border border-slate-100 rounded-lg flex items-start gap-3 bg-slate-50/50">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Academic Mentor</h4>
                                    <p className="text-xs text-slate-500 mt-1">Mentoring 20 students for final year projects</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 text-lg mb-4">Activity Log</h3>
                        <div className="space-y-4">
                            {[
                                { action: "Published 'Java Mock Test 2'", time: "2 hours ago" },
                                { action: "Graded 15 assignments", time: "5 hours ago" },
                                { action: "Scheduled interview for Rahul Verma", time: "Yesterday" },
                                { action: "Updated placement policy document", time: "Jan 25, 2024" },
                            ].map((log, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-2 rounded-lg transition-colors">
                                    <span className="text-sm font-medium text-slate-700">{log.action}</span>
                                    <span className="text-xs text-slate-400">{log.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
