import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Download, Save } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const StaffGradingConsole: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // submissionId
    const { gradeSubmission } = useData();

    // Mock existing submission data fetching strategy
    // In a real app, useData would typically expose submissions directly or via a hook.
    // For now, we will use local state initialized from context or mock if not found.

    const [grades, setGrades] = useState<Record<number, number>>({});
    const [feedback, setFeedback] = useState("");

    const submission = {
        student: "Rahul Kumar",
        test: "Java Advanced Concepts",
        submittedAt: "Jan 28, 2024 • 10:30 AM",
        questions: [
            {
                id: 1,
                title: "Explain the difference between HashMap and HashTable in Java.",
                type: "subjective",
                maxScore: 10,
                studentAnswer: "HashMap is non-synchronized and allows one null key and multiple null values. HashTable is synchronized and does not allow any null key or value. HashMap is generally preferred for non-threaded applications as it is faster.",
                aiAnalysis: "Key points covered. Mentioned synchronization and null handling correctly. Good answer.",
                autoScore: 9
            },
            {
                id: 2,
                title: "What is the purpose of the 'volatile' keyword?",
                type: "subjective",
                maxScore: 5,
                studentAnswer: "The volatile keyword is used to indicate that a variable's value will be modified by different threads.",
                aiAnalysis: "Partial answer. Should also mention visibility guarantee and prevention of instruction reordering.",
                autoScore: 3
            }
        ]
    };

    const handleGradeChange = (qId: number, score: number) => {
        setGrades(prev => ({ ...prev, [qId]: score }));
    };

    const handlePublish = () => {
        // Calculate total score
        const totalScore = Object.values(grades).reduce((a, b) => a + b, 0) || 12; // 12 is default partial sum from mock

        if (id) {
            gradeSubmission(id, totalScore);
        } else {
            console.warn("No submission ID found, simulating grading action.");
        }

        alert("Grades published successfully!");
        navigate('/staff/analysis');
    };

    return (
        <div className="space-y-6 h-[calc(100vh-theme(spacing.32))] flex flex-col animate-fade-in">
            <div className="flex items-center gap-4 mb-2">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        Grading: {submission.test}
                        <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">Pending</span>
                    </h1>
                    <p className="text-sm text-slate-500">Student: <span className="font-semibold text-slate-700">{submission.student}</span> • Submitted {submission.submittedAt}</p>
                </div>
                <div className="ml-auto flex gap-3">
                    <button className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-50 flex items-center gap-2">
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <button
                        onClick={handlePublish}
                        className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 shadow-lg shadow-brand-500/20 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" /> Publish Results
                    </button>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden">
                {/* Left: Questions & Answers */}
                <div className="col-span-2 overflow-y-auto pr-2 space-y-6">
                    {submission.questions.map((q, idx) => (
                        <div key={q.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold text-slate-800 text-lg">Q{idx + 1}. {q.title}</h3>
                                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">Max Score: {q.maxScore}</span>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Student Answer</h4>
                                <div className="p-4 bg-slate-50 rounded-xl text-slate-700 leading-relaxed border border-slate-100 font-medium">
                                    {q.studentAnswer}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
                                    AI Insight
                                </h4>
                                <div className="p-4 bg-indigo-50 rounded-xl text-indigo-800 text-sm leading-relaxed border border-indigo-100 flex gap-3">
                                    <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-indigo-600" /></div>
                                    {q.aiAnalysis}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div className="text-sm font-medium text-slate-500">
                                    Suggested Score: <span className="text-slate-900 font-bold">{q.autoScore}</span>/{q.maxScore}
                                </div>
                                <div className="flex items-center gap-3">
                                    <label className="text-sm font-bold text-slate-700">Your Score:</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={q.maxScore}
                                        defaultValue={q.autoScore}
                                        onChange={(e) => handleGradeChange(q.id, parseInt(e.target.value))}
                                        className="w-20 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold text-center"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right: Summary & Feedback */}
                <div className="col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-0">
                        <h3 className="font-bold text-slate-800 mb-4">Overall Feedback</h3>
                        <textarea
                            className="w-full h-40 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm resize-none"
                            placeholder="Enter overall feedback for the student..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        ></textarea>

                        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-600">Total Score</span>
                                <span className="text-2xl font-bold text-brand-600">12<span className="text-slate-400 text-base font-normal">/15</span></span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-600 w-[80%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
