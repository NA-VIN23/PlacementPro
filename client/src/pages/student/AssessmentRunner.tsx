import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle, Shield, Eye, Monitor, X } from 'lucide-react';
import { cn } from '../../utils/cn';

type ViolationType = 'tab_switch' | 'fullscreen_exit' | 'copy_paste' | 'right_click';

interface Violation {
    type: ViolationType;
    timestamp: Date;
}

export const AssessmentRunner: React.FC = () => {
    const navigate = useNavigate();

    // Core Assessment State
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [flags, setFlags] = useState<number[]>([]);

    // Proctoring State
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [violations, setViolations] = useState<Violation[]>([]);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [examStarted, setExamStarted] = useState(false);
    const MAX_VIOLATIONS = 3;

    // Questions Data
    const questions = [
        {
            id: 1,
            text: "What is the output of the following Java snippet?\n\nint x = 5;\nSystem.out.println(x++ + ++x);",
            options: ["10", "11", "12", "13"],
            type: "mcq"
        },
        {
            id: 2,
            text: "Which of the following is NOT a principle of Object-Oriented Programming?",
            options: ["Encapsulation", "Polymorphism", "Compilation", "Inheritance"],
            type: "mcq"
        },
        {
            id: 3,
            text: "In React, which hook is used to perform side effects in functional components?",
            options: ["useState", "useEffect", "useContext", "useReducer"],
            type: "mcq"
        },
        {
            id: 4,
            text: "What is the time complexity of searching in a balanced Binary Search Tree (BST)?",
            options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
            type: "mcq"
        },
        {
            id: 5,
            text: "Which SQL command is used to remove all records from a table but keep the structure?",
            options: ["DROP", "DELETE", "TRUNCATE", "REMOVE"],
            type: "mcq"
        }
    ];

    // ========== PROCTORING FUNCTIONS ==========

    const addViolation = useCallback((type: ViolationType) => {
        const newViolation: Violation = { type, timestamp: new Date() };
        setViolations(prev => {
            const updated = [...prev, newViolation];
            if (updated.length >= MAX_VIOLATIONS) {
                // Auto-submit on max violations
                alert('EXAM TERMINATED: Maximum violations exceeded. Your test has been auto-submitted.');
                navigate('/student/assessment');
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
    }, [navigate]);

    // Fullscreen Management
    const enterFullscreen = async () => {
        try {
            await document.documentElement.requestFullscreen();
            setIsFullscreen(true);
            setExamStarted(true);
        } catch (err) {
            console.error('Fullscreen failed:', err);
        }
    };

    // ========== PROCTORING EVENT LISTENERS ==========

    useEffect(() => {
        if (!examStarted) return;

        // Visibility Change (Tab Switch Detection)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                addViolation('tab_switch');
            }
        };

        // Fullscreen Change Detection
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && examStarted) {
                setIsFullscreen(false);
                addViolation('fullscreen_exit');
            }
        };

        // Disable Right Click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
            addViolation('right_click');
        };

        // Disable Copy/Paste
        const handleCopyPaste = (e: ClipboardEvent) => {
            e.preventDefault();
            addViolation('copy_paste');
        };

        // Disable keyboard shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            // Block Ctrl+C, Ctrl+V, Ctrl+P, F12, etc.
            if (
                (e.ctrlKey && ['c', 'v', 'p', 'u', 's'].includes(e.key.toLowerCase())) ||
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I')
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
    }, [examStarted, addViolation]);

    // Timer
    useEffect(() => {
        if (!examStarted) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    alert('Time is up! Your test has been auto-submitted.');
                    navigate('/student/assessment');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [examStarted, navigate]);

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
        setFlags(prev =>
            prev.includes(questions[currentQuestion].id)
                ? prev.filter(id => id !== questions[currentQuestion].id)
                : [...prev, questions[currentQuestion].id]
        );
    };

    const handleSubmit = () => {
        if (confirm("Are you sure you want to submit the assessment? This action cannot be undone.")) {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
            navigate('/student/assessment');
        }
    };

    // ========== PRE-EXAM SCREEN ==========

    if (!examStarted) {
        return (
            <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-600 to-purple-600 p-8 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-8 h-8" />
                            <h1 className="text-2xl font-bold">Proctored Assessment</h1>
                        </div>
                        <p className="text-white/80">Technical Assessment CA-1 • 45 Minutes • 5 Questions</p>
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
                                    <span>Exam will run in <strong>fullscreen mode only</strong>. Exiting fullscreen is a violation.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Eye className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span><strong>Tab switching is monitored</strong>. Changing tabs will be recorded as a violation.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <X className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span><strong>Copy, Paste, Right-Click</strong> are disabled during assessment.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <p className="text-amber-800 text-sm font-medium">
                                🚨 After <strong>{MAX_VIOLATIONS} violations</strong>, your exam will be <strong>automatically terminated and submitted</strong>.
                            </p>
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

    return (
        <div className="fixed inset-0 bg-slate-100 flex flex-col select-none">
            {/* Violation Warning Toast */}
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
                        <h2 className="font-bold text-slate-800 text-lg">Technical Assessment CA-1</h2>
                        <p className="text-xs text-slate-500">Section 1: Core Concepts</p>
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
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors"
                    >
                        Submit Test
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
                                    flags.includes(questions[currentQuestion].id)
                                        ? "text-orange-500"
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <Flag className={cn("w-4 h-4", flags.includes(questions[currentQuestion].id) && "fill-current")} />
                                {flags.includes(questions[currentQuestion].id) ? "Flagged" : "Flag"}
                            </button>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-xl text-slate-900 font-medium leading-relaxed whitespace-pre-wrap">
                                {questions[currentQuestion].text}
                            </p>
                        </div>

                        <div className="space-y-4">
                            {questions[currentQuestion].options.map((option, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleOptionSelect(option)}
                                    className={cn(
                                        "flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group",
                                        answers[questions[currentQuestion].id] === option
                                            ? "border-brand-500 bg-brand-50"
                                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                    )}
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors",
                                        answers[questions[currentQuestion].id] === option
                                            ? "border-brand-500 bg-brand-500"
                                            : "border-slate-300 group-hover:border-slate-400"
                                    )}>
                                        {answers[questions[currentQuestion].id] === option && (
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-lg",
                                        answers[questions[currentQuestion].id] === option ? "font-medium text-brand-900" : "text-slate-700"
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
