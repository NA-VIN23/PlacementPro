import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import {
    CheckCircle2, ChevronRight, BookOpen, Clock, Users, FileText, Upload,
    Wand2, Trash2, Plus, BrainCircuit, Code, Sigma, AlertCircle, Save
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useData } from '../../context/DataContext';

type AssessmentStep = 'Type' | 'Source' | 'Parameters' | 'Assign';
type QuestionType = 'Technical' | 'Aptitude' | 'Logical' | 'Coding';
type SourceType = 'Manual' | 'QuestionBank' | 'AI_PDF';

export const StaffAssignAssessment: React.FC = () => {
    const navigate = useNavigate();
    const { addAssessment } = useData();
    const [currentStep, setCurrentStep] = useState<AssessmentStep>('Type');

    // Form State
    const [type, setType] = useState<QuestionType>('Technical');
    const [source, setSource] = useState<SourceType>('Manual');
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(60);
    const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
    const [attempts, setAttempts] = useState(1);
    const [dueDate, setDueDate] = useState('');
    const [assignedTo, setAssignedTo] = useState('All');

    // Mock Questions State
    const [questions, setQuestions] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Step 1: Assessment Types
    const assessmentTypes = [
        { id: 'Technical', icon: BookOpen, desc: 'Subject knowledge (Java, Python, etc.)', color: 'bg-blue-50 text-blue-600' },
        { id: 'Aptitude', icon: Sigma, desc: 'Numerical and reasoning ability', color: 'bg-emerald-50 text-emerald-600' },
        { id: 'Logical', icon: BrainCircuit, desc: 'Problem solving and logic', color: 'bg-purple-50 text-purple-600' },
        { id: 'Coding', icon: Code, desc: 'Programming challenges', color: 'bg-orange-50 text-orange-600' },
    ];

    const handlePdfUpload = () => {
        setIsGenerating(true);
        // Simulate AI Processing
        setTimeout(() => {
            setIsGenerating(false);
            setQuestions([
                { id: 1, text: "Explain the concept of Polymorphism in Java.", type: 'mcq', options: ['A', 'B', 'C', 'D'], answer: 'A' },
                { id: 2, text: "What is the time complexity of QuickSort?", type: 'mcq', options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], answer: 'B' },
                { id: 3, text: "Difference between Interface and Abstract Class?", type: 'mcq', options: ['A', 'B', 'C', 'D'], answer: 'C' },
            ]);
        }, 2000);
    };

    const handlePublish = () => {
        addAssessment({
            title: title || `${type} Assessment`,
            type: type,
            source: source,
            purpose: 'Evaluation',
            duration: duration,
            questions: questions.length,
            difficulty: difficulty,
            attemptLimit: attempts,
            status: 'Active',
            dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            assignedTo: [{ type: 'Batch', value: assignedTo }]
        });
        navigate('/staff/analysis');
    };

    // Render Steps
    const renderStep = () => {
        switch (currentStep) {
            case 'Type':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                        {assessmentTypes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => { setType(t.id as any); setCurrentStep('Source'); }}
                                className={cn(
                                    "p-6 rounded-2xl border-2 text-left transition-all hover:scale-[1.02]",
                                    type === t.id ? "border-brand-500 bg-brand-50/30" : "border-slate-100 bg-white hover:border-slate-200"
                                )}
                            >
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", t.color)}>
                                    <t.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{t.id} Assessment</h3>
                                <p className="text-slate-500 text-sm mt-1">{t.desc}</p>
                            </button>
                        ))}
                    </div>
                );

            case 'Source':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setSource('Manual')}
                                className={cn("p-4 rounded-xl border-2 font-bold text-center", source === 'Manual' ? "border-brand-500 text-brand-700 bg-brand-50" : "border-slate-200")}
                            >
                                Manual Entry
                            </button>
                            <button
                                onClick={() => setSource('AI_PDF')}
                                className={cn("p-4 rounded-xl border-2 font-bold text-center", source === 'AI_PDF' ? "border-brand-500 text-brand-700 bg-brand-50" : "border-slate-200")}
                            >
                                AI Question Generator (PDF)
                            </button>
                        </div>

                        {source === 'AI_PDF' ? (
                            <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={handlePdfUpload}>
                                {isGenerating ? (
                                    <div className="flex flex-col items-center">
                                        <Wand2 className="w-12 h-12 text-brand-600 animate-spin mb-4" />
                                        <h3 className="text-lg font-bold text-slate-800">Analyze PDF & Generating Questions...</h3>
                                        <p className="text-slate-500">Extracting topics, difficulty analysis, and answer key generation.</p>
                                    </div>
                                ) : (
                                    questions.length > 0 ? (
                                        <div className="flex flex-col items-center">
                                            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                                            <h3 className="text-lg font-bold text-slate-800">questions generated successfully!</h3>
                                            <p className="text-slate-500">30 questions extracted from "Java_Notes.pdf"</p>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setCurrentStep('Parameters'); }}
                                                className="mt-6 px-6 py-2 bg-brand-600 text-white rounded-lg font-bold"
                                            >
                                                Proceed to Settings
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center pointer-events-none">
                                            <Upload className="w-12 h-12 text-slate-400 mb-4" />
                                            <h3 className="text-lg font-bold text-slate-800">Click to Upload Study Material (PDF)</h3>
                                            <p className="text-slate-500">AI will automatically create placement-standard questions.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <div className="bg-slate-50 p-8 rounded-2xl text-center">
                                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-600 font-medium">Manual Question Editor will be shown after settings.</p>
                                <button onClick={() => setCurrentStep('Parameters')} className="mt-4 text-brand-600 font-bold hover:underline">Skip to Parameters</button>
                            </div>
                        )}
                    </div>
                );

            case 'Parameters':
                return (
                    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Assessment Title</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200"
                                    placeholder={`e.g. ${type} Evaluation - Batch 2024`}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Duration (mins)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200"
                                        value={duration}
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Attempt Limit</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white"
                                        value={attempts}
                                        onChange={(e) => setAttempts(Number(e.target.value))}
                                    >
                                        <option value={1}>1 Attempt (Strict)</option>
                                        <option value={2}>2 Attempts</option>
                                        <option value={3}>3 Attempts</option>
                                        <option value={99}>Unlimited (Practice)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                                <div className="flex gap-2">
                                    {['Easy', 'Medium', 'Hard'].map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDifficulty(d as any)}
                                            className={cn(
                                                "flex-1 py-2 rounded-lg border text-sm font-medium transition-colors",
                                                difficulty === d ? "bg-slate-800 text-white border-slate-800" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => setCurrentStep('Assign')}
                            className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/30"
                        >
                            Continue to Assignment
                        </button>
                    </div>
                );

            case 'Assign':
                return (
                    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-brand-600" />
                                Assign To
                            </h3>

                            <div className="space-y-3">
                                {['All Students', 'Batch 2024', 'Batch 2025', 'CSE Department', 'ECE Department'].map((group) => (
                                    <label key={group} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                                        <div className={cn(
                                            "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                            assignedTo === group ? "border-brand-600 bg-brand-600" : "border-slate-300"
                                        )}>
                                            {assignedTo === group && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <input
                                            type="radio"
                                            name="assign"
                                            className="hidden"
                                            checked={assignedTo === group}
                                            onChange={() => setAssignedTo(group)}
                                        />
                                        <span className="font-medium text-slate-700">{group}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100">
                            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                            <p className="text-sm text-blue-700">
                                This assessment will be visible to <strong>{assignedTo}</strong> immediately after publishing.
                                Students will receive a notification.
                            </p>
                        </div>

                        <button
                            onClick={handlePublish}
                            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            Publish Assessment
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader
                title="Assessment Workflow"
                description="Create, structure, and assign placement assessments."
            />

            {/* Stepper */}
            <div className="flex items-center justify-between relative max-w-3xl mx-auto mb-12">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
                {['Type', 'Source', 'Parameters', 'Assign'].map((step, idx) => {
                    const isCompleted = ['Type', 'Source', 'Parameters', 'Assign'].indexOf(currentStep) > idx;
                    const isCurrent = currentStep === step;

                    return (
                        <div key={step} className="flex flex-col items-center gap-2 bg-[#fafafa] px-2">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-4",
                                isCompleted ? "bg-brand-600 text-white border-brand-600" :
                                    isCurrent ? "bg-white text-brand-600 border-brand-600" : "bg-white text-slate-400 border-slate-200"
                            )}>
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                            </div>
                            <span className={cn("text-xs font-bold uppercase tracking-wider", isCurrent ? "text-brand-700" : "text-slate-400")}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="max-w-4xl mx-auto">
                {renderStep()}
            </div>
        </div>
    );
};
