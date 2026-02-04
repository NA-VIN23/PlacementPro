import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Calendar, Clock, Link, Plus, Search, Video } from 'lucide-react';
import { cn } from '../../utils/cn';

export const StaffAssignInterview: React.FC = () => {
    const [scheduled, setScheduled] = React.useState(false);

    const handleSchedule = () => {
        setScheduled(true);
        setTimeout(() => setScheduled(false), 2000);
    };


    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader
                title="Schedule Mock Interviews"
                description="Assign and manage 1:1 mock interview sessions with students."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-blue-600" />
                            New Session
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Student</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Search student name..." />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Interview Type</label>
                                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white cursor-pointer">
                                    <option>Technical Round 1 (Java/Python)</option>
                                    <option>Technical Round 2 (System Design)</option>
                                    <option>HR & Behavioral</option>
                                    <option>Mock Aptitude Discussion</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="date"
                                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="time" className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Meeting Link (Optional)</label>
                                <div className="relative">
                                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Zoom / Google Meet URL" />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSchedule}
                            className={cn(
                                "w-full py-3 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30",
                                scheduled ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                            )}
                        >
                            {scheduled ? "Interview Scheduled!" : "Schedule Interview"}
                        </button>
                    </div>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800">Upcoming Interviews</h3>
                            <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View Calendar</button>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {[
                                { student: "Amit Patel", type: "Technical Round 1", date: "Today", time: "02:00 PM", status: "Upcoming" },
                                { student: "Priya Sharma", type: "HR Round", date: "Today", time: "04:30 PM", status: "Upcoming" },
                                { student: "Rahul Verma", type: "System Design", date: "Tomorrow", time: "10:00 AM", status: "Scheduled" },
                                { student: "Sneha Gupta", type: "Technical Round 1", date: "Jan 30", time: "11:00 AM", status: "Scheduled" },
                            ].map((item, idx) => (
                                <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                            {item.student.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{item.student}</h4>
                                            <p className="text-xs text-slate-500">{item.type}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="font-medium text-slate-700 text-sm">{item.date}</p>
                                            <p className="text-xs text-slate-400">{item.time}</p>
                                        </div>
                                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                                            <Video className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
