import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Plus, Trash2, Save, Clock, HelpCircle, FileText, Upload, CheckCircle } from 'lucide-react';
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
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractionStatus, setExtractionStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

    // Questions State
    const [questions, setQuestions] = useState<QuestionDraft[]>([]);
    const [currentQ, setCurrentQ] = useState<QuestionDraft>({
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: '',
        explanation: '',
        section: 'Part A',
        question_type: 'MCQ',
        code_template: '',
        constraints: '',
        test_cases: []
    });

    // FIX 1: Auto Calculate Duration
    useEffect(() => {
        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            const diffMs = end.getTime() - start.getTime();
            if (diffMs > 0) {
                setDuration(Math.floor(diffMs / 60000));
            }
        }
    }, [startTime, endTime]);

    // Handle PDF Upload and Extraction
    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPdfFile(file);
            setIsExtracting(true);
            setExtractionStatus('IDLE');

            try {
                const data = await staffService.extractPdf(file);

                // Populate Fields
                if (data.title && data.title !== 'Extracted Assessment') setTitle(data.title);
                if (data.duration && !startTime && !endTime) setDuration(data.duration); // Only if not auto-calculated
                if (data.questions && data.questions.length > 0) {
                    setQuestions(data.questions);
                }

                setExtractionStatus('SUCCESS');
            } catch (error) {
                console.error("PDF Extraction Error", error);
                setExtractionStatus('ERROR');
                alert('Failed to parse PDF content. Please check format.');
            } finally {
                setIsExtracting(false);
            }
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

        setQuestions([...questions, currentQ]);
        setCurrentQ({
            question_text: '',
            options: ['', '', '', ''],
            correct_answer: '',
            explanation: '',
            section: currentQ.section,
            question_type: examType === 'WEEKLY' && currentQ.section === 'Part C' ? 'CODING' : 'MCQ',
            code_template: '',
            constraints: '',
            test_cases: []
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

        try {
            await staffService.createExam({
                title: finalTitle,
                duration,
                start_time: new Date(startTime).toISOString(),
                end_time: new Date(endTime).toISOString(),
                questions: questions, // Send extracted or manual questions
                type: examType,
                mode: mode,
                pdf_url: pdfFile ? `uploaded:${pdfFile.name}` : undefined // Mock URL for now as requested by constraint
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
                description="Configure exam details, choose mode, and add content."
            />

            {/* Mode Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* FIX 3: Independent Daily/Weekly Logic */}
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 mb-2 uppercase">Assessment Type</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setExamType('DAILY')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${examType === 'DAILY' ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                            Daily Assessment
                        </button>
                        <button
                            onClick={() => setExamType('WEEKLY')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${examType === 'WEEKLY' ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                            Weekly Assessment
                        </button>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-500 mb-2 uppercase">Creation Mode</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setMode('MANUAL')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${mode === 'MANUAL' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                            <FileText className="inline w-4 h-4 mr-2" />
                            Manual
                        </button>
                        <button
                            onClick={() => setMode('PDF')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${mode === 'PDF' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
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
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-brand-600" />
                            Exam Details
                        </h3>

                        {/* Title - ReadOnly in PDF mode if extracted? Optional, allow edit. */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200"
                                placeholder={`e.g. ${examType === 'WEEKLY' ? 'Weekly' : 'Daily'} Assessment - Topic`}
                            />
                        </div>

                        {/* FIX 1: Read-Only Duration */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Duration (Minutes)
                                <span className="text-xs text-slate-400 ml-2">(Auto-calculated)</span>
                            </label>
                            <input
                                type="number"
                                value={duration}
                                readOnly
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handlePublish}
                        disabled={mode === 'PDF' && extractionStatus !== 'SUCCESS'}
                        className={`w-full py-3 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 ${mode === 'PDF' && extractionStatus !== 'SUCCESS' ? 'bg-slate-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20'}`}
                    >
                        <Save className="w-5 h-5" />
                        Publish Exam
                    </button>
                </div>

                {/* Right Column: Content */}
                <div className="lg:col-span-2 space-y-6">
                    {mode === 'PDF' ? (
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-2">
                                <Upload className="w-10 h-10" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-slate-800">Upload Assessment PDF</h3>
                                <p className="text-slate-500 max-w-md mx-auto">
                                    Upload your exam PDF. We will automatically extract questions, options, and details.
                                </p>
                            </div>

                            <div className="w-full max-w-md relative">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handlePdfUpload}
                                    className="block w-full text-sm text-slate-500
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-full file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-indigo-50 file:text-indigo-700
                                      hover:file:bg-indigo-100 cursor-pointer border border-dashed border-slate-300 rounded-lg p-4"
                                />
                            </div>

                            {/* Extraction Status */}
                            {isExtracting && (
                                <div className="text-brand-600 animate-pulse font-medium">
                                    Extracting content from PDF...
                                </div>
                            )}

                            {extractionStatus === 'SUCCESS' && (
                                <div className="w-full bg-green-50 border border-green-200 rounded-xl p-4 text-left">
                                    <h4 className="flex items-center gap-2 font-bold text-green-800 mb-2">
                                        <CheckCircle className="w-5 h-5" />
                                        Extraction Successful
                                    </h4>
                                    <ul className="text-sm text-green-700 space-y-1">
                                        <li>• <strong>Title:</strong> {title}</li>
                                        <li>• <strong>Questions Found:</strong> {questions.length}</li>
                                        <li>• <strong>Duration:</strong> {duration} mins</li>
                                    </ul>
                                </div>
                            )}

                            {/* Preview Extracted Questions */}
                            {questions.length > 0 && (
                                <div className="w-full text-left mt-6 border-t pt-6">
                                    <h4 className="font-bold text-slate-700 mb-4">Preview Extracted Content</h4>
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                        {questions.map((q, idx) => (
                                            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                <p className="font-medium text-slate-800 text-sm mb-2">
                                                    <span className="text-indigo-600 mr-2">Q{idx + 1}.</span>
                                                    {q.question_text}
                                                </p>
                                                {q.options && q.options.length > 0 && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {q.options.map((opt, i) => (
                                                            <div key={i} className={`text-xs px-2 py-1 rounded ${opt === q.correct_answer ? 'bg-green-100 text-green-800 font-bold border border-green-200' : 'bg-white text-slate-500 border border-slate-200'}`}>
                                                                {opt}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {q.correct_answer && (
                                                    <p className="text-xs text-green-600 font-medium mt-2">Correct Answer: {q.correct_answer}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Manual Mode - Builder */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-t-4 border-t-brand-500">
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
                                                {['MCQ', 'CODING', 'TEXT'].map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => setCurrentQ({ ...currentQ, question_type: type as any })}
                                                        className={`px-3 py-1 rounded-md text-sm font-medium border ${currentQ.question_type === type ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}
                                                    >
                                                        {type === 'TEXT' ? 'Interview/Text' : type}
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
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200"
                                            >
                                                <option value="Part A">Part A - Technical (MCQ)</option>
                                                <option value="Part B">Part B - Aptitude (MCQ)</option>
                                                <option value="Part C">Part C - Coding</option>
                                                <option value="Part D">Part D - Mock Interview</option>
                                            </select>
                                        </div>
                                    )}

                                    <textarea
                                        value={currentQ.question_text}
                                        onChange={e => setCurrentQ({ ...currentQ, question_text: e.target.value })}
                                        placeholder="Enter question text here..."
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 min-h-[100px]"
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
                                                        className="flex-1 px-3 py-2 rounded-lg border border-slate-200"
                                                    />
                                                    <input
                                                        type="radio"
                                                        name="correct_option_selector"
                                                        checked={currentQ.correct_answer === opt && opt !== ''}
                                                        onChange={() => setCurrentQ({ ...currentQ, correct_answer: opt })}
                                                        disabled={!opt}
                                                        className="w-4 h-4 text-brand-600 cursor-pointer"
                                                        title="Mark as correct"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Coding UI */}
                                    {currentQ.question_type === 'CODING' && (
                                        <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Constraints</label>
                                                <textarea
                                                    value={currentQ.constraints || ''}
                                                    onChange={e => setCurrentQ({ ...currentQ, constraints: e.target.value })}
                                                    placeholder="e.g. 1 <= N <= 1000"
                                                    className="w-full px-3 py-2 rounded-md border border-slate-200 text-sm h-20"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-2">Test Cases</label>
                                                {/* Test Case List */}
                                                {(currentQ.test_cases || []).map((tc, i) => (
                                                    <div key={i} className="flex gap-2 mb-2 items-start">
                                                        <div className="flex-1 space-y-1">
                                                            <input
                                                                placeholder="Input"
                                                                value={tc.input}
                                                                onChange={e => {
                                                                    const cases = [...(currentQ.test_cases || [])];
                                                                    cases[i].input = e.target.value;
                                                                    setCurrentQ({ ...currentQ, test_cases: cases });
                                                                }}
                                                                className="w-full px-2 py-1 text-sm border rounded"
                                                            />
                                                            <input
                                                                placeholder="Output"
                                                                value={tc.output}
                                                                onChange={e => {
                                                                    const cases = [...(currentQ.test_cases || [])];
                                                                    cases[i].output = e.target.value;
                                                                    setCurrentQ({ ...currentQ, test_cases: cases });
                                                                }}
                                                                className="w-full px-2 py-1 text-sm border rounded"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col items-center pt-2">
                                                            <label className="text-xs text-slate-500 mb-1">Hidden</label>
                                                            <input
                                                                type="checkbox"
                                                                checked={tc.hidden}
                                                                onChange={e => {
                                                                    const cases = [...(currentQ.test_cases || [])];
                                                                    cases[i].hidden = e.target.checked;
                                                                    setCurrentQ({ ...currentQ, test_cases: cases });
                                                                }}
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const cases = (currentQ.test_cases || []).filter((_, idx) => idx !== i);
                                                                setCurrentQ({ ...currentQ, test_cases: cases });
                                                            }}
                                                            className="text-red-400 hover:text-red-500 p-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        const cases = [...(currentQ.test_cases || []), { input: '', output: '', hidden: false }];
                                                        setCurrentQ({ ...currentQ, test_cases: cases });
                                                    }}
                                                    className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3" /> Add Test Case
                                                </button>
                                            </div>
                                        </div>
                                    )}

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
                                            {/* Show Section Badge */}
                                            {q.section && examType === 'WEEKLY' && (
                                                <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded mb-2 font-bold uppercase mr-2">
                                                    {q.section}
                                                </span>
                                            )}
                                            {/* Show Type Badge */}
                                            {q.question_type && q.question_type !== 'MCQ' && (
                                                <span className={`inline-block text-xs px-2 py-1 rounded mb-2 font-bold uppercase mr-2 ${q.question_type === 'CODING' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
