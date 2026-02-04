import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Mic, PlayCircle } from 'lucide-react';

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

            {/* Recent History Removed as per user request (no backend data) */}
        </div>
    );
};
