import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentService } from '../../services/api';
import { CheckCircle2, XCircle, Clock, Trophy, AlertTriangle, ChevronDown, ChevronUp, ArrowLeft, Terminal } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AnalysisData {
    exam: any;
    submission: any;
    questions: any[];
}

export const AssessmentResult: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedQ, setExpandedQ] = useState<string | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                if (!id) return;
                const result = await studentService.getExamAnalysis(id);
                setData(result);
            } catch (err: any) {
                console.error("Failed to load results:", err);
                setError(err.response?.data?.message || 'Failed to load results.');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto mt-12 p-8 bg-white rounded-3xl border border-red-100 text-center shadow-lg">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
                <p className="text-slate-600 mb-6">{error}</p>
                <button
                    onClick={() => navigate('/student/assessment')}
                    className="px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                    Back to Assessments
                </button>
            </div>
        );
    }

    if (!data) return null;

    const { exam, submission, questions } = data;
    const answers = submission.answers || {};
    const totalScore = parseFloat(submission.score.toFixed(2));
    const maxScore = questions.reduce((acc: number, q: any) => acc + (q.marks || (q.question_type === 'CODING' ? 5 : 1)), 0);
    const percentage = Math.round((totalScore / maxScore) * 100);

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
            <button
                onClick={() => navigate('/student/assessment')}
                className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors gap-2 font-medium"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Assessments
            </button>

            <div className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <div className="md:col-span-2">
                        <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold mb-3 border border-white/10">
                            Assessment Result
                        </div>
                        <h1 className="text-3xl font-bold mb-2">{exam.title}</h1>
                        <div className="flex items-center gap-4 text-blue-100 text-sm">
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {exam.duration} mins</span>
                            <span>•</span>
                            <span>{questions.length} Questions</span>
                            <span>•</span>
                            <span>Submitted on {new Date(submission.submitted_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-6 text-center backdrop-blur-sm border border-white/10">
                        <p className="text-sm font-medium text-blue-100 mb-1">Total Score</p>
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-5xl font-bold">{totalScore}</span>
                            <span className="text-xl text-blue-200">/ {maxScore}</span>
                        </div>
                        <div className="mt-2 text-xs font-bold px-2 py-1 bg-white/20 rounded-lg inline-block">
                            {percentage}% Accuracy
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-indigo-600" />
                    Detailed Analysis
                </h2>

                {questions.map((q: any, idx: number) => {
                    const ans = answers[q.id];
                    const isCoding = q.question_type === 'CODING';
                    const marks = q.marks || (isCoding ? 5 : 1);

                    let earnedScore = 0;
                    let isCorrect = false;

                    if (isCoding) {
                        earnedScore = ans?.score || 0;
                        isCorrect = earnedScore === marks;
                    } else {
                        // MCQ
                        earnedScore = (ans === q.correct_answer) ? marks : 0;
                        isCorrect = earnedScore === marks;
                    }

                    const isExpanded = expandedQ === q.id;

                    return (
                        <div key={q.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all hover:shadow-md">
                            <div
                                className="p-6 cursor-pointer flex items-start gap-4"
                                onClick={() => setExpandedQ(isExpanded ? null : q.id)}
                            >
                                <div className={cn(
                                    "mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm",
                                    isCorrect ? "bg-green-100 text-green-700" : earnedScore > 0 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                )}>
                                    {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : earnedScore > 0 ? <AlertTriangle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-slate-800 text-lg">Question {idx + 1}</h3>
                                        <div className="flex items-center gap-2 text-sm font-bold">
                                            <span className={isCorrect ? "text-green-600" : earnedScore > 0 ? "text-yellow-600" : "text-red-600"}>
                                                {earnedScore} / {marks} Marks
                                            </span>
                                            {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                        </div>
                                    </div>
                                    <div className="prose prose-slate max-w-none text-slate-600">
                                        <p>{q.question_text}</p>
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                                    {isCoding ? (
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="font-bold text-xs uppercase text-slate-500 mb-2 flex items-center gap-1">
                                                    <Terminal className="w-4 h-4" /> Your Code ({ans?.language || 'text'})
                                                </h4>
                                                <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl text-sm font-mono overflow-x-auto">
                                                    <code>{ans?.code || '// No code submitted'}</code>
                                                </pre>
                                            </div>

                                            {ans?.feedback && (
                                                <div>
                                                    <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">Test Case Results</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {(ans.feedback || []).map((fb: any, i: number) => (
                                                            <div key={i} className={cn(
                                                                "p-3 rounded-xl border text-sm flex items-center justify-between",
                                                                fb.status === 'Passed' ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
                                                            )}>
                                                                <span className="font-bold">Test Case {i + 1}</span>
                                                                <span className="flex items-center gap-1 font-bold">
                                                                    {fb.status === 'Passed' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                                    {fb.status}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-white border border-slate-200 rounded-xl">
                                                <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">Your Answer</h4>
                                                <p className={cn(
                                                    "font-medium",
                                                    ans === q.correct_answer ? "text-green-600" : "text-red-600"
                                                )}>{ans || 'Not Answered'}</p>
                                            </div>
                                            <div className="p-4 bg-white border border-slate-200 rounded-xl">
                                                <h4 className="font-bold text-xs uppercase text-slate-400 mb-2">Correct Answer</h4>
                                                <p className="font-medium text-green-600">{q.correct_answer}</p>
                                            </div>
                                            {q.explanation && (
                                                <div className="col-span-1 md:col-span-2 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-sm">
                                                    <span className="font-bold mr-2">Explanation:</span>
                                                    {q.explanation}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}


            </div>
        </div>
    );
};
