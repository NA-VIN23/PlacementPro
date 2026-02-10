import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle, Shield, Eye, Monitor, X, CheckCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { studentService } from '../../services/api';
import type { Exam, Question } from '../../types';
import { CodingEnvironment } from '../../components/assessment/CodingEnvironment';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

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

    // Core Assessment State
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [flags, setFlags] = useState<string[]>([]);

    // Alert/Modal State
    const { error: toastError } = useToast();
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showTerminationModal, setShowTerminationModal] = useState(false);
    const [terminationReason, setTerminationReason] = useState('');

    // Proctoring State

    const [violations, setViolations] = useState<Violation[]>([]);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [examStarted, setExamStarted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
                setTerminationReason('Assessment terminated due to excessive violations.');
                setShowTerminationModal(true);
                // Delay submit slightly to show modal, or handle in modal effect
                handleSubmit(true, true);
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

        const handleDragDrop = (e: DragEvent) => {
            e.preventDefault();
            addViolation('copy_paste'); // Treat as copy/paste violation
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopyPaste);
        document.addEventListener('paste', handleCopyPaste);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('dragstart', handleDragDrop);
        document.addEventListener('drop', handleDragDrop);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopyPaste);
            document.removeEventListener('paste', handleCopyPaste);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('dragstart', handleDragDrop);
            document.removeEventListener('drop', handleDragDrop);
        };
    }, [examStarted, submitted, addViolation]);

    // Timer
    useEffect(() => {
        if (!examStarted || submitted) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setTerminationReason('Time is up! Submitting your assessment...');
                    setShowTerminationModal(true);
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

    const handleSubmit = async (force = false, terminated = false) => {
        if (!force) {
            setShowSubmitModal(true);
            return;
        }

        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => { });
        }

        setSubmitting(true);
        try {
            if (!id) return;
            await studentService.submitExam(id, answers, terminated, violations);

            setSubmitted(true);
        } catch (err) {
            console.error('Submission failed', err);
            toastError('Failed to submit exam. Please try again or contact support.');
            setSubmitting(false);
        }
    };

    // ========== RENDER STATES ==========

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading Assessment Environment...</p>
                </div>
            </div>
        );
    }

    if (error || !exam) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-500 mb-6">{error || 'Exam not found.'}</p>
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
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
                <div className="max-w-xl mx-auto py-12 px-4 h-full flex flex-col justify-center">
                    {/* Success Message Card */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl text-center mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Assessment Submitted</h2>
                            <p className="text-slate-500 mb-8 text-lg">
                                Your responses have been successfully recorded.
                                <br />
                                <span className="font-semibold text-slate-700 mt-2 block">
                                    Results will be available after {new Date(exam.end_time).toLocaleString()}.
                                </span>
                            </p>

                            <button
                                onClick={() => navigate('/student/assessment')}
                                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
                            >
                                Return to Assessment Center
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!examStarted) {
        return (
            <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
                <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-8 h-8" />
                            <h1 className="text-2xl font-bold">Proctored Assessment</h1>
                        </div>
                        <p className="text-white/80">{exam.title} • {exam.duration} Minutes • {questions.length} Questions</p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
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
                                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl text-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
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

    // ========== MAIN EXAM UI ==========

    const currentQ = questions[currentQuestion];

    return (
        <div className="fixed inset-0 bg-slate-100 flex flex-col select-none">
            {/* Submit Confirmation Modal */}
            <Modal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} title="Submit Assessment">
                <div className="space-y-4">
                    <p className="text-slate-600">
                        Are you sure you want to submit? You cannot change your answers after submission.
                        {Object.keys(answers).length < questions.length && (
                            <span className="block mt-2 text-orange-600 font-bold">
                                You have answered {Object.keys(answers).length} out of {questions.length} questions.
                            </span>
                        )}
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setShowSubmitModal(false)}
                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => { setShowSubmitModal(false); handleSubmit(true); }}
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                        >
                            Confirm Submit
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Termination Modal */}
            <Modal isOpen={showTerminationModal} preventClose={true} showCloseButton={false} title="Assessment Ended">
                <div className="text-center space-y-4 py-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-lg font-bold text-slate-800">{terminationReason}</p>
                    <p className="text-slate-500 text-sm">Please wait while we finalize your submission...</p>
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                </div>
            </Modal>

            {/* Violation Toast */}
            {showWarning && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce w-[90%] max-w-sm">
                    <div className="bg-red-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <div className="flex-1 text-xs">{warningMessage}</div>
                        <span className="shrink-0 px-2 py-0.5 bg-white/20 rounded-lg text-xs">
                            {violations.length}/{MAX_VIOLATIONS}
                        </span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between shadow-sm shrink-0 z-20">
                <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    </button>

                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold shrink-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        PROCTORED
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-bold text-slate-800 text-sm md:text-lg truncate">{exam.title}</h2>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-6">
                    {violations.length > 0 && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                            <AlertTriangle className="w-4 h-4" />
                            {violations.length} Violation{violations.length > 1 ? 's' : ''}
                        </div>
                    )}
                    <div className={cn(
                        "flex items-center gap-2 font-mono text-sm md:text-xl font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-xl",
                        timeLeft < 300 ? "text-red-600 bg-red-50 animate-pulse" : "text-slate-700 bg-slate-100"
                    )}>
                        <Clock className="w-4 h-4 md:w-5 md:h-5" />
                        {formatTime(timeLeft)}
                    </div>
                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={submitting}
                        className="px-4 py-1.5 md:px-6 md:py-2 bg-blue-600 text-white font-bold text-xs md:text-sm rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                        {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden relative">
                {/* Question Area */}
                <div className="flex-1 overflow-y-auto bg-slate-50/50 w-full">
                    {/* Render Coding Environment if CODING type */}
                    {questions[currentQuestion].question_type === 'CODING' ? (
                        <CodingEnvironment
                            question={questions[currentQuestion]}
                            currentCode={answers[questions[currentQuestion].id] || questions[currentQuestion].code_template || ''}
                            onCodeChange={(code) => setAnswers(prev => ({ ...prev, [questions[currentQuestion].id]: code }))}
                            onRunCode={(lang, ver, code) => studentService.runCode(lang, ver, code, questions[currentQuestion].id)}
                        />
                    ) : (
                        // Standard MCQ / Text UI
                        <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-4 md:space-y-8 pb-20 md:pb-8">
                            <div className="flex items-start justify-between">
                                <span className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">
                                    Question {currentQuestion + 1} of {questions.length}
                                </span>
                                <button
                                    onClick={toggleFlag}
                                    className={cn(
                                        "flex items-center gap-2 text-xs md:text-sm font-medium transition-colors",
                                        flags.includes(currentQ.id) ? "text-orange-500" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    <Flag className={cn("w-4 h-4", flags.includes(currentQ.id) && "fill-current")} />
                                    {flags.includes(currentQ.id) ? "Flagged" : "Flag"}
                                </button>
                            </div>

                            <div className="bg-white p-4 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                                <p className="text-base md:text-xl text-slate-900 font-medium leading-relaxed whitespace-pre-wrap">
                                    {currentQ.question_text}
                                </p>
                            </div>

                            {/* Render Options for MCQ */}
                            {(!currentQ.question_type || currentQ.question_type === 'MCQ') && (
                                <div className="space-y-3 md:space-y-4">
                                    {currentQ.options.map((option, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleOptionSelect(option)}
                                            className={cn(
                                                "flex items-center p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group touch-manipulation",
                                                answers[currentQ.id] === option
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center mr-3 md:mr-4 shrink-0 transition-colors",
                                                answers[currentQ.id] === option
                                                    ? "border-blue-500 bg-blue-500"
                                                    : "border-slate-300 group-hover:border-slate-400"
                                            )}>
                                                {answers[currentQ.id] === option && (
                                                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white" />
                                                )}
                                            </div>
                                            <span className={cn(
                                                "text-sm md:text-lg",
                                                answers[currentQ.id] === option ? "font-medium text-blue-900" : "text-slate-700"
                                            )}>
                                                {option}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Render Text Area for Interview/Text Questions */}
                            {currentQ.question_type === 'TEXT' && (
                                <textarea
                                    value={answers[currentQ.id] || ''}
                                    onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                                    placeholder="Type your answer here..."
                                    className="w-full h-48 p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-base md:text-lg"
                                />
                            )}

                            <div className="flex justify-between pt-4 md:pt-8 gap-4">
                                <button
                                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                    disabled={currentQuestion === 0}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                                    disabled={currentQuestion === questions.length - 1}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
                                >
                                    Next
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Sidebar Overlay */}
                {mobileMenuOpen && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
                )}

                {/* Sidebar */}
                <div className={cn(
                    "w-72 bg-white border-l border-slate-200 flex flex-col absolute lg:static top-0 right-0 h-full z-40 transition-transform duration-300 shadow-2xl lg:shadow-none",
                    mobileMenuOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
                )}>
                    <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">Question Navigator</h3>
                        <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-1 text-slate-400 hover:bg-slate-50 rounded">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 md:gap-3">
                            {questions.map((q, idx) => (
                                <button
                                    key={q.id}
                                    onClick={() => {
                                        setCurrentQuestion(idx);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={cn(
                                        "h-10 w-10 rounded-xl text-sm font-bold flex items-center justify-center relative transition-all",
                                        currentQuestion === idx
                                            ? "bg-slate-900 text-white shadow-md ring-2 ring-slate-900 ring-offset-2"
                                            : answers[q.id]
                                                ? "bg-blue-100 text-blue-700 border border-blue-200"
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

                    <div className="p-4 md:p-6 mt-auto bg-slate-50 safebar-pb">
                        <div className="space-y-3 text-xs md:text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
                                <span className="text-slate-600">Answered ({Object.keys(answers).length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-orange-100 border border-orange-200"></div>
                                <span className="text-slate-600">Flagged ({flags.length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-slate-100"></div>
                                <span className="text-slate-600">Action Needed ({questions.length - Object.keys(answers).length})</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
