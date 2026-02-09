import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Modal } from '../../components/ui/Modal';
import { Plus, Trash2, Save, Clock, HelpCircle, FileText, Upload } from 'lucide-react';
import axios from 'axios';
import { staffService } from '../../services/api';

interface QuestionDraft {
    question_text: string;
    options: string[];
    correct_answer: string;
    explanation: string;
    section?: string;
    question_type?: 'MCQ' | 'CODING' | 'TEXT';
    code_template?: string;
    constraints?: string;
    test_cases?: { input: string; output: string; hidden: boolean }[];
    function_name?: string;
    marks?: number;
    input_format?: string;
    output_format?: string;
}

export const StaffAssignAssessment: React.FC = () => {
    const navigate = useNavigate();

    // Mode Selection
    const [examType, setExamType] = useState<'DAILY' | 'WEEKLY'>('DAILY');
    const [mode, setMode] = useState<'MANUAL' | 'PDF'>('MANUAL');

    // Exam Details
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(60);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    // PDF State
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [extractionStatus, setExtractionStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');

    // Questions State
    const [questions, setQuestions] = useState<QuestionDraft[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [currentQ, setCurrentQ] = useState<QuestionDraft>({
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: '',
        explanation: '',
        section: 'Part A',
        question_type: 'MCQ',
        code_template: '',
        constraints: '',
        test_cases: [],
        marks: 1
    });

    // Handle PDF Upload and Extraction
    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPdfFile(file);
        setExtractionStatus('LOADING');

        const formData = new FormData();
        formData.append('pdf', file);

        // Check if env var already has /api
        const baseUrl = import.meta.env.VITE_API_URL || '';
        const endpoint = baseUrl.endsWith('/api') ? '/assessment/parse-pdf' : '/api/assessment/parse-pdf';
        const apiUrl = `${baseUrl}${endpoint}`;
        console.log("Hitting API Endpoint:", apiUrl);

        try {
            const token = localStorage.getItem('placement_token');
            console.log("Frontend Token used:", token ? token.substring(0, 20) + '...' : 'NULL');
            const response = await axios.post(apiUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            const { title, startTime, endTime, duration, questions: parsedQuestions } = response.data;

            // Auto-populate Metadata
            if (title) setTitle(title);
            if (duration) setDuration(duration);

            // Handle Dates (Expecting ISO URLs from backend)
            if (startTime) {
                const s = new Date(startTime);
                s.setMinutes(s.getMinutes() - s.getTimezoneOffset());
                setStartTime(s.toISOString().slice(0, 16));
            }
            if (endTime) {
                const e = new Date(endTime);
                e.setMinutes(e.getMinutes() - e.getTimezoneOffset());
                setEndTime(e.toISOString().slice(0, 16));
            }

            // Map parsed questions to UI structure
            const mappedQuestions = parsedQuestions.map((q: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                question_text: q.question_text,
                options: q.options || [],
                correct_answer: q.correct_answer || '',
                explanation: q.explanation || '',
                section: q.type === 'CODING' ? 'Part C' : 'Part A', // Default sections
                marks: q.type === 'MCQ' ? 1 : (q.marks || 10), // Enforce 1 for MCQ, allow PDF to specify coding marks
                // Coding specific
                input_format: q.input_format || '',
                output_format: q.output_format || '',
                constraints: q.constraints || '',
                test_cases: q.testcases?.map((tc: any) => ({
                    input: tc.input,
                    output: tc.output,
                    hidden: !tc.public // Invert public to hidden
                })) || []
            }));

            setQuestions(mappedQuestions);
            setExtractionStatus('SUCCESS');

            // Alert user of strict success
            alert(`Successfully parsed strict PDF.\nQuestions: ${mappedQuestions.length}`);

        } catch (error: any) {
            console.error("PDF Extraction Error", error);
            setExtractionStatus('ERROR');
            const msg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to parse PDF content.';
            alert(`Parsing Failed:\n${msg}`);
        } finally {
            e.target.value = '';
        }
    };

    const handleOptionChange = (idx: number, val: string) => {
        const newOptions = [...currentQ.options];
        const wasCorrect = currentQ.correct_answer === newOptions[idx];

        newOptions[idx] = val;

        // If changing the correct answer's text, update correct_answer too
        if (wasCorrect) {
            setCurrentQ({ ...currentQ, options: newOptions, correct_answer: val });
        } else {
            setCurrentQ({ ...currentQ, options: newOptions });
        }
    };

    const addQuestion = () => {
        // Validation for Manual Mode
        const isMCQ = currentQ.question_type === 'MCQ';

        if (!currentQ.question_text) {
            alert('Please enter question text');
            return;
        }

        if (isMCQ && !currentQ.correct_answer) {
            alert('Please select a correct answer');
            return;
        }

        // Explicitly set marks based on type
        const finalQuestion: QuestionDraft = {
            ...currentQ,
            marks: isMCQ ? 1 : (currentQ.marks || 10) // Fixed 1 for MCQ, User Input for Coding (default 10)
        };

        setQuestions([...questions, finalQuestion]);
        setCurrentQ({
            question_text: '',
            options: ['', '', '', ''],
            correct_answer: '',
            explanation: '',
            section: currentQ.section,
            question_type: examType === 'WEEKLY' && currentQ.section === 'Part C' ? 'CODING' : 'MCQ',
            code_template: '',
            constraints: '',
            test_cases: [],
            marks: 1 // Reset to default
        });
    };

    const removeQuestion = (idx: number) => {
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    const handlePublish = async () => {
        if (!startTime || !endTime) {
            alert('Please select Exam Start and End times.');
            return;
        }

        // Title validation
        const finalTitle = title || (pdfFile ? `Assessment: ${pdfFile.name}` : `New ${examType} Exam`);

        // Final Validation handled by backend or soft check
        if (mode === 'MANUAL' && questions.length === 0) {
            alert('Please add at least one question.');
            return;
        }
        if (mode === 'PDF' && extractionStatus !== 'SUCCESS') {
            alert('Please upload and extract a valid PDF.');
            return;
        }

        setIsPublishing(true);

        try {
            await staffService.createExam({
                title: finalTitle,
                duration,
                start_time: new Date(startTime).toISOString(),
                end_time: new Date(endTime).toISOString(),
                questions: questions, // Send extracted or manual questions
                type: examType,
                mode: mode,
                pdf_url: pdfFile ? `uploaded:${pdfFile.name}` : undefined
            });
            setIsPublishing(false);
            setShowSuccessModal(true);
            // navigate('/staff/dashboard'); // Moved to modal action
        } catch (error) {
            setIsPublishing(false);
            console.error('Failed to create exam', error);
            alert('Failed to publish exam.');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            <PageHeader
                title="Create New Assessment"
                description="Configure exam details, choose mode, and add content."
            />

            {/* Mode Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 mb-2 uppercase">Assessment Type</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setExamType('DAILY')}
                            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${examType === 'DAILY' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                            Daily Assessment
                        </button>
                        <button
                            onClick={() => setExamType('WEEKLY')}
                            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${examType === 'WEEKLY' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                            Weekly Assessment
                        </button>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 mb-2 uppercase">Creation Mode</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setMode('MANUAL')}
                            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${mode === 'MANUAL' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                            <FileText className="inline w-4 h-4 mr-2" />
                            Manual
                        </button>
                        <button
                            onClick={() => setMode('PDF')}
                            className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${mode === 'PDF' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                            <Upload className="inline w-4 h-4 mr-2" />
                            PDF Upload
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Exam Configuration */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            Exam Details
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                placeholder={`e.g. ${examType === 'WEEKLY' ? 'Weekly' : 'Daily'} Assessment - Topic`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Duration (Minutes)
                            </label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handlePublish}
                        disabled={mode === 'PDF' && extractionStatus !== 'SUCCESS'}
                        className={`w-full py-3 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 ${mode === 'PDF' && extractionStatus !== 'SUCCESS' ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'}`}
                    >
                        <Save className="w-5 h-5" />
                        Publish Exam
                    </button>
                </div>

                {/* Right Column: Content */}
                <div className="lg:col-span-2 space-y-6">
                    {mode === 'PDF' ? (
                        <>
                            {/* PDF Mode Content */}
                            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-slate-800">Upload Assessment PDF</h3>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handlePdfUpload}
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-dashed border-slate-300 rounded-xl p-4"
                                    />
                                </div>
                            </div>

                            {/* Show Questions if Extracted */}
                            {questions.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <HelpCircle className="w-5 h-5 text-slate-400" />
                                        Extracted Questions ({questions.length})
                                    </h3>
                                    {questions.map((q, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-200 transition-colors group relative shadow-sm">
                                            {q.section && examType === 'WEEKLY' && (
                                                <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded mb-2 font-bold uppercase mr-2">
                                                    {q.section}
                                                </span>
                                            )}
                                            {q.question_type && q.question_type !== 'MCQ' && (
                                                <span className={`inline-block text-xs px-2 py-1 rounded-lg mb-2 font-bold uppercase mr-2 ${q.question_type === 'CODING' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {q.question_type}
                                                </span>
                                            )}
                                            <div className="pr-8">
                                                <p className="font-medium text-slate-900 mb-2">
                                                    <span className="font-bold text-slate-400 mr-2">{idx + 1}.</span>
                                                    {q.question_text}
                                                </p>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    {q.options.filter((o: string) => o).map((opt: string, i: number) => (
                                                        <div key={i} className={`px-2 py-1 rounded-lg ${opt === q.correct_answer ? 'bg-green-50 text-green-700 font-medium' : 'text-slate-500'}`}>
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                                {q.marks && (
                                                    <div className="mt-2 text-xs text-slate-500 font-bold">Marks: {q.marks}</div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeQuestion(idx)}
                                                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Manual Mode - Builder */}
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-t-4 border-t-blue-500">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Add New Question
                                </h3>

                                <div className="space-y-4">
                                    {/* Question Type Selector (For Daily) */}
                                    {examType === 'DAILY' && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Question Type</label>
                                            <div className="flex gap-2">
                                                {['MCQ', 'CODING'].map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => setCurrentQ({ ...currentQ, question_type: type as any })}
                                                        className={`px-3 py-1 rounded-xl text-sm font-medium border ${currentQ.question_type === type ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Weekly Section Auto-Selector Logic */}
                                    {examType === 'WEEKLY' && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                                            <select
                                                value={currentQ.section}
                                                onChange={(e) => {
                                                    const sec = e.target.value;
                                                    let type: any = 'MCQ';
                                                    if (sec === 'Part C') type = 'CODING';
                                                    if (sec === 'Part D') type = 'TEXT';
                                                    setCurrentQ({ ...currentQ, section: sec, question_type: type });
                                                }}
                                                className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                                            >
                                                <option value="Part A">Part A - Technical (MCQ)</option>
                                                <option value="Part B">Part B - Aptitude (MCQ)</option>
                                                <option value="Part C">Part C - Coding</option>
                                            </select>
                                        </div>
                                    )}

                                    <textarea
                                        value={currentQ.question_text}
                                        onChange={e => setCurrentQ({ ...currentQ, question_text: e.target.value })}
                                        placeholder="Enter question text here..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />

                                    {/* MCQ UI */}
                                    {currentQ.question_type === 'MCQ' && (
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
                                                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                                                    />
                                                    <input
                                                        type="radio"
                                                        name="correct_option_selector"
                                                        checked={currentQ.correct_answer === opt && opt !== ''}
                                                        onChange={() => setCurrentQ({ ...currentQ, correct_answer: opt })}
                                                        disabled={!opt}
                                                        className="w-4 h-4 text-blue-600 cursor-pointer"
                                                        title="Mark as correct"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Coding UI */}
                                    {currentQ.question_type === 'CODING' && (
                                        <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Marks for this Question</label>
                                                <input
                                                    type="number"
                                                    value={currentQ.marks || ''}
                                                    onChange={e => setCurrentQ({ ...currentQ, marks: parseInt(e.target.value) || 0 })}
                                                    placeholder="e.g. 10"
                                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20"
                                                />
                                            </div>

                                            {/* Input/Output Format Fields */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Input Format</label>
                                                    <textarea
                                                        value={currentQ.input_format || ''}
                                                        onChange={e => setCurrentQ({ ...currentQ, input_format: e.target.value })}
                                                        placeholder="e.g. The first line contains an integer N."
                                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm h-24 outline-none focus:ring-2 focus:ring-blue-500/20"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Output Format</label>
                                                    <textarea
                                                        value={currentQ.output_format || ''}
                                                        onChange={e => setCurrentQ({ ...currentQ, output_format: e.target.value })}
                                                        placeholder="e.g. Print the sum of the array."
                                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm h-24 outline-none focus:ring-2 focus:ring-blue-500/20"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Constraints</label>
                                                <textarea
                                                    value={currentQ.constraints || ''}
                                                    onChange={e => setCurrentQ({ ...currentQ, constraints: e.target.value })}
                                                    placeholder="e.g. 1 <= N <= 1000"
                                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm h-20 outline-none focus:ring-2 focus:ring-blue-500/20"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Test Cases (Public & Hidden)</label>
                                                <p className="text-xs text-slate-500 mb-2">Use <strong>Public</strong> cases for Sample Inputs visible to students. Use <strong>Hidden</strong> cases for grading.</p>
                                                {(currentQ.test_cases || []).map((tc, i) => (
                                                    <div key={i} className="flex flex-col md:flex-row gap-2 mb-3 items-start p-3 bg-white rounded-xl border border-slate-200 md:border-none md:bg-transparent md:p-0">
                                                        <div className="flex-1 space-y-2 w-full">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                <div>
                                                                    <label className="block text-xs font-bold text-slate-400 mb-1">Input</label>
                                                                    <textarea
                                                                        placeholder="Input (Multiline supported)"
                                                                        value={tc.input}
                                                                        onChange={e => {
                                                                            const cases = [...(currentQ.test_cases || [])];
                                                                            cases[i].input = e.target.value;
                                                                            setCurrentQ({ ...currentQ, test_cases: cases });
                                                                        }}
                                                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono h-20 resize-none"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-slate-400 mb-1">Expected Output</label>
                                                                    <textarea
                                                                        placeholder="Output"
                                                                        value={tc.output}
                                                                        onChange={e => {
                                                                            const cases = [...(currentQ.test_cases || [])];
                                                                            cases[i].output = e.target.value;
                                                                            setCurrentQ({ ...currentQ, test_cases: cases });
                                                                        }}
                                                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono h-20 resize-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between w-full md:w-auto gap-4 pt-6">
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={tc.hidden}
                                                                    onChange={e => {
                                                                        const cases = [...(currentQ.test_cases || [])];
                                                                        cases[i].hidden = e.target.checked;
                                                                        setCurrentQ({ ...currentQ, test_cases: cases });
                                                                    }}
                                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                                />
                                                                <span className="text-sm font-medium text-slate-600">Hidden</span>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    const cases = (currentQ.test_cases || []).filter((_, idx) => idx !== i);
                                                                    setCurrentQ({ ...currentQ, test_cases: cases });
                                                                }}
                                                                className="text-red-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Remove Test Case"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        const cases = [...(currentQ.test_cases || []), { input: '', output: '', hidden: false }];
                                                        setCurrentQ({ ...currentQ, test_cases: cases });
                                                    }}
                                                    className="text-sm text-indigo-600 font-bold hover:text-indigo-700 flex items-center gap-1 mt-2 px-2 py-1 hover:bg-indigo-50 rounded transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" /> Add Test Case
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <input
                                        type="text"
                                        value={currentQ.explanation}
                                        onChange={e => setCurrentQ({ ...currentQ, explanation: e.target.value })}
                                        placeholder="Explanation (Optional)"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                    />

                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={addQuestion}
                                            className="px-6 py-2 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
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
                                    <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400">
                                        No questions added yet.
                                    </div>
                                ) : (
                                    questions.map((q, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-200 transition-colors group relative shadow-sm">
                                            {q.section && examType === 'WEEKLY' && (
                                                <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded mb-2 font-bold uppercase mr-2">
                                                    {q.section}
                                                </span>
                                            )}
                                            {q.question_type && q.question_type !== 'MCQ' && (
                                                <span className={`inline-block text-xs px-2 py-1 rounded-lg mb-2 font-bold uppercase mr-2 ${q.question_type === 'CODING' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {q.question_type}
                                                </span>
                                            )}
                                            <div className="pr-8">
                                                <p className="font-medium text-slate-900 mb-2">
                                                    <span className="font-bold text-slate-400 mr-2">{idx + 1}.</span>
                                                    {q.question_text}
                                                </p>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    {q.options.filter((o: string) => o).map((opt: string, i: number) => (
                                                        <div key={i} className={`px-2 py-1 rounded-lg ${opt === q.correct_answer ? 'bg-green-50 text-green-700 font-medium' : 'text-slate-500'}`}>
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                                {q.marks && (
                                                    <div className="mt-2 text-xs text-slate-500 font-bold">Marks: {q.marks}</div>
                                                )}
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

                                {questions.length > 0 && (
                                    <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center shadow-lg">
                                        <span className="font-bold">Total Marks</span>
                                        <span className="text-xl font-bold bg-white/20 px-4 py-1 rounded-lg">
                                            {questions.reduce((sum, q) => sum + (q.marks || 0), 0)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            {/* Success Modal */}
            <Modal
                isOpen={showSuccessModal}
                title="Assessment Published!"
                onClose={() => navigate('/staff/dashboard')}
                preventClose={true} // Force user to click button
            >
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-slate-600">
                        Your assessment <strong>{title}</strong> has been successfully created and assigned to the selected batch.
                    </p>
                    <div className="pt-4 w-full">
                        <button
                            onClick={() => navigate('/staff/dashboard')}
                            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </Modal>
            {/* Loading Modal */}
            <Modal
                isOpen={isPublishing}
                title=""
                showCloseButton={false}
                preventClose={true}
                className="max-w-sm"
            >
                <div className="flex flex-col items-center justify-center p-8 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    <p className="text-slate-600 font-medium animate-pulse">Submitting Assessment...</p>
                </div>
            </Modal>
        </div>
    );
};
