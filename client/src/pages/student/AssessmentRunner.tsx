import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle, Shield, Eye, Monitor, X, CheckCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { studentService } from '../../services/api';
import type { Exam, Question } from '../../types';

type ViolationType = 'tab_switch' | 'fullscreen_exit' | 'copy_paste' | 'right_click';

interface Violation {
    type: ViolationType;
    timestamp: Date;
}

export const AssessmentRunner: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Data State
    const [exam, setExam] = useState<Exam | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [reviewDetails, setReviewDetails] = useState<any[]>([]);

    // Core Assessment State
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [flags, setFlags] = useState<string[]>([]);

    // Proctoring State

    const [violations, setViolations] = useState<Violation[]>([]);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [examStarted, setExamStarted] = useState(false);
    const MAX_VIOLATIONS = 3;

    // Fetch Exam Data
    useEffect(() => {
        const loadExam = async () => {
            if (!id) return;
            try {
                const data = await studentService.getExamQuestions(id);
                setExam(data.exam);
                setQuestions(data.questions);
                setTimeLeft(data.exam.duration * 60); // Set timer based on exam duration
            } catch (err) {
                console.error('Failed to load exam:', err);
                setError('Failed to load assessment. It might be expired or invalid.');
            } finally {
                setLoading(false);
            }
        };
        loadExam();
    }, [id]);

    // ========== PROCTORING FUNCTIONS ==========

    const addViolation = useCallback((type: ViolationType) => {
        if (submitted) return; // Don't track if already submitted

        const newViolation: Violation = { type, timestamp: new Date() };
        setViolations(prev => {
            const updated = [...prev, newViolation];
            if (updated.length >= MAX_VIOLATIONS) {
                // Auto-submit on max violations
                alert('EXAM TERMINATED: Maximum violations exceeded. Your test has been auto-submitted.');
                handleSubmit(true); // Force submit
            }
            return updated;
        });

        const messages: Record<ViolationType, string> = {
            'tab_switch': '⚠️ WARNING: Tab switch detected! Stay on the exam window.',
            'fullscreen_exit': '⚠️ WARNING: You exited fullscreen mode!',
            'copy_paste': '⚠️ WARNING: Copy/Paste is disabled during examination.',
            'right_click': '⚠️ WARNING: Right-click is disabled during examination.'
        };

        setWarningMessage(messages[type]);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 4000);
    }, [submitted]); // Added dependency to avoid stale closure if submitted changes, though mostly handles via check

    // Fullscreen Management
    const enterFullscreen = async () => {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            }

            setExamStarted(true);
        } catch (err) {
            console.error('Fullscreen failed:', err);
            // Fallback for demo/dev if fullscreen fails (e.g. inside iframe)
            setExamStarted(true);
        }
    };

    // ========== PROCTORING EVENT LISTENERS ==========

    useEffect(() => {
        if (!examStarted || submitted) return;

        const handleVisibilityChange = () => {
            if (document.hidden) addViolation('tab_switch');
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && examStarted) {

                addViolation('fullscreen_exit');
            }
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            addViolation('right_click');
        };

        const handleCopyPaste = (e: ClipboardEvent) => {
            e.preventDefault();
            addViolation('copy_paste');
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                (e.ctrlKey && ['c', 'v', 'p', 's'].includes(e.key.toLowerCase())) ||
                e.key === 'F12'
            ) {
                e.preventDefault();
                addViolation('copy_paste');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopyPaste);
        document.addEventListener('paste', handleCopyPaste);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopyPaste);
            document.removeEventListener('paste', handleCopyPaste);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [examStarted, submitted, addViolation]);

    // Timer
    useEffect(() => {
        if (!examStarted || submitted) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    alert('Time is up! Your test has been auto-submitted.');
                    handleSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [examStarted, submitted]);

    // ========== HELPER FUNCTIONS ==========

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = (option: string) => {
        setAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: option }));
    };

    const toggleFlag = () => {
        const qId = questions[currentQuestion].id;
        setFlags(prev =>
            prev.includes(qId)
                ? prev.filter(id => id !== qId)
                : [...prev, qId]
        );
    };

    const handleSubmit = async (force = false) => {
        if (!force && !confirm("Are you sure you want to submit the assessment? This action cannot be undone.")) {
            return;
        }

        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { });
        }

        setSubmitting(true);
        try {
            if (!id) return;
            const result = await studentService.submitExam(id, answers);
            setScore(result.score);
            setReviewDetails(result.reviewDetails || []);
            setSubmitted(true);
        } catch (err) {
            console.error('Submission failed', err);
            alert('Failed to submit exam. Please try again or contact support.');
            setSubmitting(false);
        }
    };

    // ========== RENDER STATES ==========

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading Assessment Environment...</p>
                </div>
            </div>
        );
    }

    if (error || !exam) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-500 mb-6">{error || 'Exam not found.'}</p>
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="fixed inset-0 bg-slate-50 overflow-y-auto animate-fade-in z-50">
                <div className="max-w-4xl mx-auto py-12 px-4">
                    {/* Score Card */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl text-center mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Assessment Completed</h2>
                            <div className="my-6">
                                <span className="text-6xl font-black text-brand-600">{score}</span>
                                <span className="text-2xl text-slate-400 font-medium ml-2">/ {questions.length}</span>
                            </div>
                            <button
                                onClick={() => navigate('/student/dashboard')}
                                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>

                    {/* Detailed Review */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Eye className="w-6 h-6 text-brand-600" />
                            <h3 className="text-2xl font-bold text-slate-800">Detailed Review</h3>
                        </div>

                        {questions.map((q, idx) => {
                            const correctDetail = reviewDetails?.find((r: any) => r.id === q.id);
                            const correctAnswer = correctDetail?.correct_answer;
                            const explanation = correctDetail?.explanation;
                            const userAnswer = answers[q.id];
                            const isCorrect = userAnswer === correctAnswer;

                            return (
                                <div key={q.id} className={`p-6 rounded-2xl border ${isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'} shadow-sm bg-white`}>
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {idx + 1}
                                        </div>
                                        <p className="text-lg font-medium text-slate-900">{q.question_text}</p>
                                    </div>

                                    <div className="space-y-3 pl-12">
                                        {q.options.map((opt, optIdx) => {
                                            const isSelected = userAnswer === opt;
                                            const isTheCorrectAnswer = correctAnswer === opt;

                                            let optionClass = "border-slate-200 bg-white text-slate-700";
                                            if (isTheCorrectAnswer) optionClass = "border-green-500 bg-green-50 text-green-900 font-bold";
                                            else if (isSelected && !isCorrect) optionClass = "border-red-500 bg-red-50 text-red-900 font-medium";

                                            return (
                                                <div key={optIdx} className={`flex items-center justify-between p-3 rounded-lg border ${optionClass}`}>
                                                    <span>{opt}</span>
                                                    {isTheCorrectAnswer && <CheckCircle className="w-5 h-5 text-green-600" />}
                                                    {isSelected && !isCorrect && <X className="w-5 h-5 text-red-500" />}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {explanation && (
                                        <div className="mt-4 ml-12 p-4 bg-blue-50 rounded-xl text-sm border border-blue-100 text-blue-800">
                                            <strong>Explanation:</strong> {explanation}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    if (!examStarted) {
        return (
            <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-600 to-purple-600 p-8 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-8 h-8" />
                            <h1 className="text-2xl font-bold">Proctored Assessment</h1>
                        </div>
                        <p className="text-white/80">{exam.title} • {exam.duration} Minutes • {questions.length} Questions</p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5" />
                                STRICT EXAMINATION RULES
                            </h3>
                            <ul className="text-sm text-red-700 space-y-2">
                                <li className="flex items-start gap-2">
                                    <Monitor className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>Exam will run in <strong>fullscreen mode only</strong>. Exiting is a violation.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Eye className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span><strong>Tab switching is monitored</strong>. Changing tabs will be recorded.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <X className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span><strong>Copy, Paste, Right-Click</strong> are disabled.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="text-center pt-4">
                            <button
                                onClick={enterFullscreen}
                                className="px-8 py-4 bg-brand-600 text-white font-bold rounded-xl text-lg hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all hover:scale-105"
                            >
                                I Understand, Start Exam
                            </button>
                            <p className="text-xs text-slate-400 mt-4">By clicking, you agree to the examination terms.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ========== MAIN EXAM UI ==========

    const currentQ = questions[currentQuestion];

    return (
        <div className="fixed inset-0 bg-slate-100 flex flex-col select-none">
            {/* Violation Toast */}
            {showWarning && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                    <div className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-bold">
                        <AlertTriangle className="w-5 h-5" />
                        {warningMessage}
                        <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-sm">
                            {violations.length} / {MAX_VIOLATIONS}
                        </span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        PROCTORED
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 text-lg">{exam.title}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    {violations.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                            <AlertTriangle className="w-4 h-4" />
                            {violations.length} Violation{violations.length > 1 ? 's' : ''}
                        </div>
                    )}
                    <div className={cn(
                        "flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg",
                        timeLeft < 300 ? "text-red-600 bg-red-50 animate-pulse" : "text-slate-700 bg-slate-100"
                    )}>
                        <Clock className="w-5 h-5" />
                        {formatTime(timeLeft)}
                    </div>
                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={submitting}
                        className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Submit Test'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Question Area */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div className="flex items-start justify-between">
                            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                                Question {currentQuestion + 1} of {questions.length}
                            </span>
                            <button
                                onClick={toggleFlag}
                                className={cn(
                                    "flex items-center gap-2 text-sm font-medium transition-colors",
                                    flags.includes(currentQ.id) ? "text-orange-500" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <Flag className={cn("w-4 h-4", flags.includes(currentQ.id) && "fill-current")} />
                                {flags.includes(currentQ.id) ? "Flagged" : "Flag"}
                            </button>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-xl text-slate-900 font-medium leading-relaxed whitespace-pre-wrap">
                                {currentQ.question_text}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {currentQ.options.map((option, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleOptionSelect(option)}
                                    className={cn(
                                        "flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group",
                                        answers[currentQ.id] === option
                                            ? "border-brand-500 bg-brand-50"
                                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors",
                                        answers[currentQ.id] === option
                                            ? "border-brand-500 bg-brand-500"
                                            : "border-slate-300 group-hover:border-slate-400"
                                    )}>
                                        {answers[currentQ.id] === option && (
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-lg",
                                        answers[currentQ.id] === option ? "font-medium text-brand-900" : "text-slate-700"
                                    )}>
                                        {option}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between pt-8">
                            <button
                                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                disabled={currentQuestion === 0}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                                disabled={currentQuestion === questions.length - 1}
                                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next Question
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 mb-4">Question Navigator</h3>
                        <div className="grid grid-cols-5 gap-3">
                            {questions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestion(idx)}
                                    className={cn(
                                        "h-10 w-10 rounded-lg text-sm font-bold flex items-center justify-center relative transition-all",
                                        currentQuestion === idx
                                            ? "bg-slate-900 text-white shadow-md ring-2 ring-slate-900 ring-offset-2"
                                            : answers[q.id]
                                                ? "bg-brand-100 text-brand-700 border border-brand-200"
                                                : flags.includes(q.id)
                                                    ? "bg-orange-50 text-orange-600 border border-orange-200"
                                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                    )}
                                >
                                    {idx + 1}
                                    {flags.includes(q.id) && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 mt-auto bg-slate-50">
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-brand-100 border border-brand-200"></div>
                                <span className="text-slate-600">Answered ({Object.keys(answers).length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-orange-100 border border-orange-200"></div>
                                <span className="text-slate-600">Flagged ({flags.length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-slate-100"></div>
                                <span className="text-slate-600">Unanswered ({questions.length - Object.keys(answers).length})</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
