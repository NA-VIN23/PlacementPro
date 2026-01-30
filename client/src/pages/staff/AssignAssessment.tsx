import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Plus, Trash2, Save, Clock, Calendar, HelpCircle, FileText } from 'lucide-react';
import { staffService } from '../../services/api';

interface QuestionDraft {
    question_text: string;
    options: string[];
    correct_answer: string;
    explanation: string;
}

export const StaffAssignAssessment: React.FC = () => {
    const navigate = useNavigate();

    // Exam Details
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(60);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    // Questions State
    const [questions, setQuestions] = useState<QuestionDraft[]>([]);
    const [currentQ, setCurrentQ] = useState<QuestionDraft>({
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: '',
        explanation: ''
    });

    const handleOptionChange = (idx: number, val: string) => {
        const newOptions = [...currentQ.options];
        newOptions[idx] = val;
        setCurrentQ({ ...currentQ, options: newOptions });
    };

    const addQuestion = () => {
        if (!currentQ.question_text || !currentQ.correct_answer) {
            alert('Please fill question text and select a correct answer');
            return;
        }
        setQuestions([...questions, currentQ]);
        setCurrentQ({
            question_text: '',
            options: ['', '', '', ''],
            correct_answer: '',
            explanation: ''
        });
    };

    const removeQuestion = (idx: number) => {
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    const handlePublish = async () => {
        if (!title || !startTime || !endTime || questions.length === 0) {
            alert('Please fill all exam details and add at least one question.');
            return;
        }

        try {
            await staffService.createExam({
                title,
                duration,
                start_time: new Date(startTime).toISOString(),
                end_time: new Date(endTime).toISOString(),
                questions
            });
            alert('Exam Created Successfully!');
            navigate('/staff/dashboard');
        } catch (error) {
            console.error('Failed to create exam', error);
            alert('Failed to publish exam.');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            <PageHeader
                title="Create New Assessment"
                description="Configure exam details and add questions."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Exam Configuration */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-brand-600" />
                            Exam Details
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200"
                                placeholder="e.g. Java Placement Test"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Minutes)</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={e => setDuration(Number(e.target.value))}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handlePublish}
                        className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        Publish Exam
                    </button>
                </div>

                {/* Right Column: Question Builder */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Builder Form */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-t-4 border-t-brand-500">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Add New Question
                        </h3>

                        <div className="space-y-4">
                            <textarea
                                value={currentQ.question_text}
                                onChange={e => setCurrentQ({ ...currentQ, question_text: e.target.value })}
                                placeholder="Enter question text here..."
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 min-h-[100px]"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQ.options.map((opt, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <input
                                            type="text"
                                            value={opt}
                                            onChange={e => handleOptionChange(idx, e.target.value)}
                                            placeholder={`Option ${idx + 1}`}
                                            className="flex-1 px-3 py-2 rounded-lg border border-slate-200"
                                        />
                                        <input
                                            type="radio"
                                            name="correct"
                                            checked={currentQ.correct_answer === opt && opt !== ''}
                                            onChange={() => setCurrentQ({ ...currentQ, correct_answer: opt })}
                                            className="w-4 h-4 text-brand-600"
                                            title="Mark as correct"
                                        />
                                    </div>
                                ))}
                            </div>

                            <input
                                type="text"
                                value={currentQ.explanation}
                                onChange={e => setCurrentQ({ ...currentQ, explanation: e.target.value })}
                                placeholder="Explanation (Optional)"
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm"
                            />

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={addQuestion}
                                    className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    Add Question
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Question List */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-slate-400" />
                            Added Questions ({questions.length})
                        </h3>

                        {questions.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                                No questions added yet.
                            </div>
                        ) : (
                            questions.map((q, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-brand-200 transition-colors group relative">
                                    <div className="pr-8">
                                        <p className="font-medium text-slate-900 mb-2">
                                            <span className="font-bold text-slate-400 mr-2">{idx + 1}.</span>
                                            {q.question_text}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {q.options.map((opt, i) => (
                                                <div key={i} className={`px-2 py-1 rounded ${opt === q.correct_answer ? 'bg-green-50 text-green-700 font-medium' : 'text-slate-500'}`}>
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeQuestion(idx)}
                                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
