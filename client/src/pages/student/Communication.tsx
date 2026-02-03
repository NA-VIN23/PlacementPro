import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Mic, PlayCircle, History, BarChart2 } from 'lucide-react';

export const StudentCommunication: React.FC = () => {
    const navigate = useNavigate();

    const startInterview = () => {
        navigate('/student/interview');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader
                title="AI Interview Practice"
                description="Practice mock interviews with our AI interviewer and get real-time feedback."
            />

            {/* Hero Card */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900/40 to-slate-900 overflow-hidden relative min-h-[350px] flex items-center p-8 md:p-12 border border-blue-500/20">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>

                <div className="relative z-10 max-w-2xl space-y-6">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-semibold tracking-wide backdrop-blur-sm">
                        <Mic className="w-4 h-4" />
                        Voice-Powered AI Interview
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                        Practice with <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">AI Interviewer</span>
                    </h2>
                    <p className="text-slate-300 text-lg md:w-3/4">
                        Experience a realistic voice-based interview powered by AI. The interviewer will ask personalized questions based on your profile and provide instant feedback.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={startInterview}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-lg transition-all flex items-center gap-3 shadow-lg shadow-blue-500/25 group"
                        >
                            <PlayCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            Start Interview
                        </button>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-4 pt-4">
                        {['🎤 Voice-based', '🤖 AI-powered', '📝 Personalized questions', '⚡ Real-time feedback'].map((feature, i) => (
                            <span key={i} className="px-3 py-1.5 bg-slate-800/50 rounded-xl text-slate-300 text-sm border border-slate-700/50">
                                {feature}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent History */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <History className="w-5 h-5 text-slate-400" />
                        Recent Sessions
                    </h3>
                    <button className="text-blue-600 text-sm font-medium hover:underline">View All History</button>
                </div>
                <div className="divide-y divide-slate-100">
                    {[
                        { title: "AI Interview #3", date: "Jan 26, 2024", duration: "15 min", score: "8.5/10" },
                        { title: "AI Interview #2", date: "Jan 24, 2024", duration: "25 min", score: "7.2/10" },
                        { title: "AI Interview #1", date: "Jan 20, 2024", duration: "10 min", score: "9.0/10" },
                    ].map((session, i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                                <span className="font-medium text-slate-800">{session.title}</span>
                                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-lg">{session.date}</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="text-sm text-slate-500">{session.duration}</span>
                                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{session.score}</span>
                                <button className="text-slate-400 hover:text-blue-600">
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
