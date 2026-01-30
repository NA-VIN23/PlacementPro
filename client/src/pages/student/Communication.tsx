import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Mic, MessageSquare, Video, History, PlayCircle, BarChart2 } from 'lucide-react';

export const StudentCommunication: React.FC = () => {
    const navigate = useNavigate();

    const startSession = (type: string) => {
        navigate('/student/interview', { state: { type } });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader
                title="AI Communication Coach"
                description="Practice mock interviews and improve your soft skills with real-time AI feedback."
            />

            {/* Hero Card */}
            <div className="rounded-3xl bg-slate-900 overflow-hidden relative min-h-[300px] flex items-center p-8 md:p-12">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

                <div className="relative z-10 max-w-2xl space-y-6">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-semibold tracking-wide backdrop-blur-sm">
                        NEW: GPT-4 Powered Analysis
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                        Master Your next <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Interview</span>
                    </h2>
                    <p className="text-slate-300 text-lg md:w-3/4">
                        Participate in realistic mock interviews tailored to your target role. Get instant feedback on your confidence, pacing, and answer quality.
                    </p>
                    <button
                        onClick={() => startSession('general')}
                        className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all flex items-center gap-3 shadow-lg shadow-white/10 group"
                    >
                        <PlayCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        Start New Session
                    </button>
                </div>
            </div>

            {/* Practice Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125 duration-500">
                        <Video className="w-32 h-32 text-blue-600" />
                    </div>
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                        <Video className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Video Mock Interview</h3>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                        Full-length video interview simulation with behavioral and technical questions.
                    </p>
                    <button
                        onClick={() => startSession('video')}
                        className="w-full py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-900 hover:text-white transition-all"
                    >
                        Practice Now
                    </button>
                </div>

                <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125 duration-500">
                        <Mic className="w-32 h-32 text-purple-600" />
                    </div>
                    <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                        <Mic className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Speech Analysis</h3>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                        Improve your diction, filler word usage (ums, ahs), and speaking pace with targeted drills.
                    </p>
                    <button
                        onClick={() => startSession('speech')}
                        className="w-full py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-900 hover:text-white transition-all"
                    >
                        Practice Now
                    </button>
                </div>

                <div className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-125 duration-500">
                        <MessageSquare className="w-32 h-32 text-emerald-600" />
                    </div>
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 shadow-sm">
                        <MessageSquare className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">STAR Method Drills</h3>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                        Learn to structure your answers effectively using the Situation, Task, Action, Result framework.
                    </p>
                    <button
                        onClick={() => startSession('star')}
                        className="w-full py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-900 hover:text-white transition-all"
                    >
                        Practice Now
                    </button>
                </div>
            </div>

            {/* Recent History */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <History className="w-5 h-5 text-slate-400" />
                        Recent Sessions
                    </h3>
                    <button className="text-brand-600 text-sm font-medium hover:underline">View All History</button>
                </div>
                <div className="divide-y divide-slate-100">
                    {[
                        { title: "Behavioral Interview #3", date: "Jan 26, 2024", duration: "15 min", score: "8.5/10" },
                        { title: "Technical Screen: Java", date: "Jan 24, 2024", duration: "25 min", score: "7.2/10" },
                        { title: "Soft Skills: Introduction", date: "Jan 20, 2024", duration: "5 min", score: "9.0/10" },
                    ].map((session, i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                                <span className="font-medium text-slate-800">{session.title}</span>
                                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">{session.date}</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="text-sm text-slate-500">{session.duration}</span>
                                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{session.score}</span>
                                <button className="text-slate-400 hover:text-brand-600">
                                    <BarChart2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
