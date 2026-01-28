import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import {
    CheckCircle2, Users,
    Code, Sigma, MessageSquare, Layers, AlertCircle, Save, BookOpen
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useData } from '../../context/DataContext';

type AssessmentStep = 'Configure' | 'Assign' | 'Review';

interface PartConfig {
    id: string;
    name: string;
    type: 'Technical' | 'Aptitude' | 'Coding' | 'Interview';
    icon: React.ElementType;
    color: string;
    questions: number;
    duration: number;
}

export const StaffAssignAssessment: React.FC = () => {
    const navigate = useNavigate();
    const { addAssessment } = useData();
    const [currentStep, setCurrentStep] = useState<AssessmentStep>('Configure');

    // Form State
    const [weekNumber, setWeekNumber] = useState(1);
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [assignedTo, setAssignedTo] = useState('All Students');
    const [attempts, setAttempts] = useState(1);

    // Part Configurations (Fixed for Weekly Assessment)
    const [parts, setParts] = useState<PartConfig[]>([
        { id: 'A', name: 'Part A: Technical', type: 'Technical', icon: Code, color: 'bg-blue-50 text-blue-600 border-blue-200', questions: 15, duration: 20 },
        { id: 'B', name: 'Part B: Aptitude', type: 'Aptitude', icon: Sigma, color: 'bg-purple-50 text-purple-600 border-purple-200', questions: 15, duration: 20 },
        { id: 'C', name: 'Part C: Coding', type: 'Coding', icon: Layers, color: 'bg-orange-50 text-orange-600 border-orange-200', questions: 2, duration: 30 },
        { id: 'D', name: 'Part D: Mock Interview', type: 'Interview', icon: MessageSquare, color: 'bg-green-50 text-green-600 border-green-200', questions: 5, duration: 15 },
    ]);

    const updatePart = (id: string, field: 'questions' | 'duration', value: number) => {
        setParts(parts.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const getTotalDuration = () => parts.reduce((acc, p) => acc + p.duration, 0);
    const getTotalQuestions = () => parts.reduce((acc, p) => acc + p.questions, 0);

    const handlePublish = () => {
        addAssessment({
            title: title || `Week ${weekNumber} - Weekly Assessment`,
            type: 'Technical', // Primary type
            source: 'Manual',
            purpose: 'Evaluation',
            duration: getTotalDuration(),
            questions: getTotalQuestions(),
            difficulty: 'Medium',
            attemptLimit: attempts,
            status: 'Active',
            dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            assignedTo: [{ type: 'Batch', value: assignedTo }]
        });
        alert('Weekly Assessment Published Successfully!');
        navigate('/staff/analysis');
    };

    // Render Steps
    const renderStep = () => {
        switch (currentStep) {
            case 'Configure':
                return (
                    <div className="space-y-8 animate-fade-in">
                        {/* Basic Info */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-brand-600" />
                                Weekly Assessment Details
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Week Number</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white"
                                        value={weekNumber}
                                        onChange={(e) => setWeekNumber(Number(e.target.value))}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(w => (
                                            <option key={w} value={w}>Week {w}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Assessment Title</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200"
                                        placeholder={`Week ${weekNumber} - Placement Assessment`}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
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
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Parts Configuration */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-brand-600" />
                                Assessment Parts (All Included)
                            </h3>

                            <div className="space-y-4">
                                {parts.map((part) => (
                                    <div key={part.id} className={cn("p-4 rounded-xl border flex items-center gap-4", part.color)}>
                                        <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center shrink-0">
                                            <part.icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm">{part.name}</h4>
                                            <p className="text-xs opacity-70">{part.type} Questions</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-center">
                                                <label className="block text-xs font-medium opacity-70 mb-1">Questions</label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={50}
                                                    value={part.questions}
                                                    onChange={(e) => updatePart(part.id, 'questions', Number(e.target.value))}
                                                    className="w-16 px-2 py-1 rounded border border-current/20 bg-white/50 text-center text-sm font-bold"
                                                />
                                            </div>
                                            <div className="text-center">
                                                <label className="block text-xs font-medium opacity-70 mb-1">Duration</label>
                                                <input
                                                    type="number"
                                                    min={5}
                                                    max={120}
                                                    value={part.duration}
                                                    onChange={(e) => updatePart(part.id, 'duration', Number(e.target.value))}
                                                    className="w-16 px-2 py-1 rounded border border-current/20 bg-white/50 text-center text-sm font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="mt-6 flex gap-6 justify-end">
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 font-medium">Total Questions</p>
                                    <p className="text-2xl font-bold text-slate-800">{getTotalQuestions()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 font-medium">Total Duration</p>
                                    <p className="text-2xl font-bold text-slate-800">{getTotalDuration()} mins</p>
                                </div>
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

                        <div className="flex gap-4">
                            <button
                                onClick={() => setCurrentStep('Configure')}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setCurrentStep('Review')}
                                className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700"
                            >
                                Review
                            </button>
                        </div>
                    </div>
                );

            case 'Review':
                return (
                    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6">Assessment Summary</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500">Title</span>
                                    <span className="font-bold text-slate-800">{title || `Week ${weekNumber} - Weekly Assessment`}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500">Week</span>
                                    <span className="font-bold text-slate-800">Week {weekNumber}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500">Total Questions</span>
                                    <span className="font-bold text-slate-800">{getTotalQuestions()}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500">Total Duration</span>
                                    <span className="font-bold text-slate-800">{getTotalDuration()} minutes</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500">Due Date</span>
                                    <span className="font-bold text-slate-800">{dueDate || 'Not Set'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500">Assigned To</span>
                                    <span className="font-bold text-slate-800">{assignedTo}</span>
                                </div>
                                <div className="flex justify-between py-2">
                                    <span className="text-slate-500">Attempts</span>
                                    <span className="font-bold text-slate-800">{attempts}</span>
                                </div>
                            </div>

                            {/* Parts Preview */}
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <h4 className="font-bold text-slate-700 mb-4">Parts Breakdown</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {parts.map(p => (
                                        <div key={p.id} className={cn("p-3 rounded-lg border text-sm", p.color)}>
                                            <div className="flex items-center gap-2">
                                                <p.icon className="w-4 h-4" />
                                                <span className="font-bold">{p.name}</span>
                                            </div>
                                            <p className="text-xs opacity-70 mt-1">{p.questions} Qs • {p.duration} mins</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100">
                            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                            <p className="text-sm text-blue-700">
                                This weekly assessment includes <strong>Mock Interview (Part D)</strong> which will be self-evaluated by students.
                                All parts contribute to the weekly score.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setCurrentStep('Assign')}
                                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                            >
                                Back
                            </button>
                            <button
                                onClick={handlePublish}
                                className="flex-1 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                Publish Weekly Assessment
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader
                title="Weekly Assessment"
                description="Create and assign weekly placement assessments with Technical, Aptitude, Coding & Mock Interview."
            />

            {/* Stepper */}
            <div className="flex items-center justify-center gap-4 mb-8">
                {(['Configure', 'Assign', 'Review'] as AssessmentStep[]).map((step, idx) => {
                    const stepOrder = ['Configure', 'Assign', 'Review'];
                    const isCompleted = stepOrder.indexOf(currentStep) > idx;
                    const isCurrent = currentStep === step;

                    return (
                        <React.Fragment key={step}>
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                                    isCompleted ? "bg-brand-600 text-white" :
                                        isCurrent ? "bg-brand-100 text-brand-700 border-2 border-brand-600" : "bg-slate-100 text-slate-400"
                                )}>
                                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                </div>
                                <span className={cn("text-sm font-medium", isCurrent ? "text-brand-700" : "text-slate-400")}>
                                    {step}
                                </span>
                            </div>
                            {idx < 2 && <div className={cn("w-12 h-0.5", isCompleted ? "bg-brand-600" : "bg-slate-200")} />}
                        </React.Fragment>
                    );
                })}
            </div>

            <div className="max-w-4xl mx-auto">
                {renderStep()}
            </div>
        </div>
    );
};
