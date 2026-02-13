import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Mic, PlayCircle, Trophy, Clock, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { studentService } from '../../services/api';

interface InterviewRecord {
    id: string;
    interview_type: string;
    score: number | null;
    fluency_score: number | null;
    grammar_score: number | null;
    communication_score: number | null;
    confidence_score: number | null;
    correctness_score: number | null;
    feedback: string | null;
    created_at: string;
}

const ScoreBar: React.FC<{ label: string; score: number; color: string }> = ({ label, score, color }) => (
    <div className="space-y-1">
        <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">{label}</span>
            <span className="text-sm font-bold text-white">{score}/10</span>
        </div>
        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
                style={{ width: `${(score / 10) * 100}%` }}
            />
        </div>
    </div>
);

const InterviewCard: React.FC<{ record: InterviewRecord }> = ({ record }) => {
    const [expanded, setExpanded] = useState(false);
    const hasScores = record.score !== null && record.score > 0;

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-emerald-400';
        if (score >= 6) return 'text-blue-400';
        if (score >= 4) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getScoreGlow = (score: number) => {
        if (score >= 8) return 'shadow-emerald-500/20';
        if (score >= 6) return 'shadow-blue-500/20';
        if (score >= 4) return 'shadow-yellow-500/20';
        return 'shadow-red-500/20';
    };

    return (
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300">
            {/* Top row — always visible */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg ${hasScores
                        ? `bg-gradient-to-br from-blue-600 to-indigo-600 text-white ${getScoreGlow(record.score!)}`
                        : 'bg-slate-700 text-slate-400'
                        }`}>
                        {hasScores ? record.score : '—'}
                    </div>
                    <div>
                        <p className="font-semibold text-white text-sm">
                            {record.interview_type} Interview
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(record.created_at)} at {formatTime(record.created_at)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {hasScores && (
                        <span className={`text-2xl font-bold ${getScoreColor(record.score!)}`}>
                            {record.score}<span className="text-sm font-normal text-slate-500">/10</span>
                        </span>
                    )}
                    {!hasScores && (
                        <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            Pending
                        </span>
                    )}
                    {hasScores && (
                        expanded
                            ? <ChevronUp className="w-5 h-5 text-slate-400" />
                            : <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                </div>
            </button>

            {/* Expanded detail — score bars + feedback */}
            {expanded && hasScores && (
                <div className="px-5 pb-5 pt-2 border-t border-white/5 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        <ScoreBar label="English Fluency" score={record.fluency_score || 0} color="bg-gradient-to-r from-emerald-500 to-emerald-400" />
                        <ScoreBar label="Grammar" score={record.grammar_score || 0} color="bg-gradient-to-r from-blue-500 to-blue-400" />
                        <ScoreBar label="Communication" score={record.communication_score || 0} color="bg-gradient-to-r from-violet-500 to-violet-400" />
                        <ScoreBar label="Confidence" score={record.confidence_score || 0} color="bg-gradient-to-r from-amber-500 to-amber-400" />
                        <ScoreBar label="Answer Correctness" score={record.correctness_score || 0} color="bg-gradient-to-r from-cyan-500 to-cyan-400" />
                    </div>

                    {record.feedback && (
                        <div className="mt-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Feedback</p>
                            <p className="text-sm text-slate-300 leading-relaxed">{record.feedback}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const StudentCommunication: React.FC = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState<InterviewRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await studentService.getInterviewHistory();
            setHistory(data || []);
        } catch (err) {
            console.error('Failed to fetch interview history:', err);
        } finally {
            setLoading(false);
        }
    };

    const startInterview = () => {
        navigate('/student/interview');
    };

    // Compute stats from history
    const completedInterviews = history.filter(h => h.score !== null && h.score > 0);
    const averageScore = completedInterviews.length > 0
        ? Math.round(completedInterviews.reduce((sum, h) => sum + (h.score || 0), 0) / completedInterviews.length * 10) / 10
        : 0;
    const bestScore = completedInterviews.length > 0
        ? Math.max(...completedInterviews.map(h => h.score || 0))
        : 0;

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

            {/* Stats Row */}
            {completedInterviews.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Mic className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{completedInterviews.length}</p>
                            <p className="text-xs text-slate-400">Interviews Done</p>
                        </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{averageScore}<span className="text-sm font-normal text-slate-500">/10</span></p>
                            <p className="text-xs text-slate-400">Average Score</p>
                        </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{bestScore}<span className="text-sm font-normal text-slate-500">/10</span></p>
                            <p className="text-xs text-slate-400">Best Score</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Interview History */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-slate-400" />
                    Interview History
                </h3>

                {loading ? (
                    <div className="bg-white/5 rounded-2xl p-8 border border-white/10 text-center">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">Loading history...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="bg-white/5 rounded-2xl p-8 border border-white/10 text-center">
                        <Mic className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">No interviews yet. Start your first interview above!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map(record => (
                            <InterviewCard key={record.id} record={record} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
