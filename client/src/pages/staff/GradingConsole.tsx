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
        <div className="space-y-6 lg:h-[calc(100vh-theme(spacing.32))] flex flex-col animate-fade-in pb-20 lg:pb-0">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-2">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                            Grading: {submission.test}
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">Pending</span>
                        </h1>
                        <p className="text-sm text-slate-500">Student: <span className="font-semibold text-slate-700">{submission.student}</span> • Submitted {submission.submittedAt}</p>
                    </div>
                </div>
                <div className="lg:ml-auto flex gap-3 w-full lg:w-auto">
                    <button className="flex-1 lg:flex-none px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 flex justify-center items-center gap-2 transition-colors">
                        <Download className="w-4 h-4" /> <span className="lg:inline">Download</span>
                    </button>
                    <button
                        onClick={handlePublish}
                        className="flex-1 lg:flex-none px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex justify-center items-center gap-2 transition-all hover:scale-105"
                    >
                        <Save className="w-4 h-4" /> Publish
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col-reverse lg:grid lg:grid-cols-3 gap-6 overflow-visible lg:overflow-hidden">
                {/* Left: Questions & Answers */}
                <div className="lg:col-span-2 overflow-visible lg:overflow-y-auto lg:pr-2 space-y-6">
                    {submission.questions.map((q, idx) => (
                        <div key={q.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 lg:p-6 overflow-hidden relative">
                            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4 gap-2">
                                <h3 className="font-bold text-slate-800 text-base lg:text-lg">Q{idx + 1}. {q.title}</h3>
                                <span className="self-start text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200 shrink-0">Max Score: {q.maxScore}</span>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Student Answer</h4>
                                <div className="p-4 bg-slate-50 rounded-2xl text-slate-700 leading-relaxed border border-slate-100 font-medium text-sm">
                                    {q.studentAnswer}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                    AI Insight
                                </h4>
                                <div className="p-4 bg-blue-50 rounded-2xl text-blue-800 text-sm leading-relaxed border border-blue-100 flex gap-3">
                                    <div className="mt-0.5"><CheckCircle2 className="w-4 h-4 text-blue-600" /></div>
                                    {q.aiAnalysis}
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row lg:items-center justify-between pt-4 border-t border-slate-100 gap-4">
                                <div className="text-sm font-medium text-slate-500">
                                    Suggested Score: <span className="text-slate-900 font-bold">{q.autoScore}</span>/{q.maxScore}
                                </div>
                                <div className="flex items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
                                    <label className="text-sm font-bold text-slate-700">Your Score:</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={q.maxScore}
                                        defaultValue={q.autoScore}
                                        onChange={(e) => handleGradeChange(q.id, parseInt(e.target.value))}
                                        className="w-20 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right: Summary & Feedback */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:sticky lg:top-0">
                        <h3 className="font-bold text-slate-800 mb-4">Overall Feedback</h3>
                        <textarea
                            className="w-full h-32 lg:h-40 p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm resize-none"
                            placeholder="Enter overall feedback for the student..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        ></textarea>

                        <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-600">Total Score</span>
                                <span className="text-2xl font-bold text-blue-600">12<span className="text-slate-400 text-base font-normal">/15</span></span>
                            </div>
                            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 w-[80%] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
