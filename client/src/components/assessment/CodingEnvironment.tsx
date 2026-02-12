import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, AlertTriangle, Terminal, Code } from 'lucide-react';
import type { Question } from '../../types';
import CodeEditorPanel from './CodeEditorPanel';
import { studentService } from '../../services/api';

interface CodingEnvironmentProps {
    question: Question;
    currentCode: string;
    onCodeChange: (code: string) => void;
    onRunCode: (lang: string, ver: string, code: string, customInput?: string) => Promise<any>;
}

const LANGUAGES = [
    { name: 'Python', value: 'python', version: '3.10.0' },
    { name: 'JavaScript', value: 'javascript', version: '18.15.0' },
    { name: 'Java', value: 'java', version: '15.0.2' },
    { name: 'C++', value: 'c++', version: '10.2.0' },
];

export const CodingEnvironment: React.FC<CodingEnvironmentProps> = ({
    question,
    currentCode,
    onCodeChange,
    onRunCode
}) => {
    const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
    const [output, setOutput] = useState<any[] | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [activeTab, setActiveTab] = useState<'problem' | 'output'>('problem');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Custom Input State
    const [isCustomInputMode, setIsCustomInputMode] = useState(false);
    const [customInput, setCustomInput] = useState('');
    const [activeCaseTab, setActiveCaseTab] = useState(0);

    // Auto-save Logic (Debounced)
    useEffect(() => {
        const saveTimeout = setTimeout(() => {
            if (currentCode && question.exam_id) {
                studentService.saveCode(question.exam_id, question.id, selectedLang.value, currentCode)
                    .then(() => setLastSaved(new Date()))
                    .catch(err => console.error("Auto-save failed", err));
            }
        }, 2000); // Save after 2 seconds of inactivity

        return () => clearTimeout(saveTimeout);
    }, [currentCode, question.id, question.exam_id, selectedLang.value]);

    const handleRun = async () => {
        setIsRunning(true);
        setActiveTab('output');
        setOutput(null); // Clear previous output
        setActiveCaseTab(0); // Reset case tab

        try {
            // Run Code (Sample Cases OR Custom Input)
            const inputToSend = isCustomInputMode ? customInput : undefined;

            // If Custom Input is empty but mode is enabled, maybe warn? Or just send empty string.

            const result = await onRunCode(selectedLang.value, selectedLang.version, currentCode, inputToSend as any); // Type cast for customInput

            if (result && result.results) {
                setOutput(result.results);
            }
        } catch (err) {
            console.error(err);
            setOutput([{ error: "Execution failed. Please check your code or internet connection.", passed: false, hidden: false }]);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full bg-slate-100 overflow-hidden">
            {/* Left Panel: Problem & Output */}
            <div className="w-full lg:w-1/2 flex flex-col border-r border-slate-200 h-1/2 lg:h-full">
                {/* Tabs */}
                <div className="flex border-b border-slate-200 bg-white shadow-sm z-10">
                    <button
                        onClick={() => setActiveTab('problem')}
                        className={`flex-1 lg:flex-none px-4 lg:px-6 py-3 font-medium text-xs lg:text-sm flex items-center justify-center gap-2 ${activeTab === 'problem' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Code className="w-4 h-4" />
                        Problem
                    </button>
                    <button
                        onClick={() => setActiveTab('output')}
                        className={`flex-1 lg:flex-none px-4 lg:px-6 py-3 font-medium text-xs lg:text-sm flex items-center justify-center gap-2 ${activeTab === 'output' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Terminal className="w-4 h-4" />
                        Output
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-white">
                    {activeTab === 'problem' ? (
                        <div className="space-y-4 lg:space-y-6">
                            <div>
                                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-2">{question.question_text}</h2>
                                {question.function_name && (
                                    <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded text-xs lg:text-sm font-mono text-slate-600 border border-slate-200">
                                        Function: {question.function_name}
                                    </div>
                                )}
                            </div>

                            {/* Input / Output Formats */}
                            {question.input_format && (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <h4 className="font-bold text-slate-700 text-xs lg:text-sm uppercase mb-2">Input Format</h4>
                                    <pre className="whitespace-pre-wrap font-sans text-slate-600 text-xs lg:text-sm">{question.input_format}</pre>
                                </div>
                            )}

                            {question.output_format && (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <h4 className="font-bold text-slate-700 text-xs lg:text-sm uppercase mb-2">Output Format</h4>
                                    <pre className="whitespace-pre-wrap font-sans text-slate-600 text-xs lg:text-sm">{question.output_format}</pre>
                                </div>
                            )}

                            {/* Constraints */}
                            {question.constraints && (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <h4 className="font-bold text-slate-700 text-xs lg:text-sm uppercase mb-2">Constraints</h4>
                                    <pre className="whitespace-pre-wrap font-sans text-slate-600 text-xs lg:text-sm">{question.constraints}</pre>
                                </div>
                            )}

                            {/* Example Test Cases */}
                            {question.test_cases && question.test_cases.filter((tc: any) => !tc.hidden).map((tc: any, idx: number) => (
                                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-xs lg:text-sm">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div>
                                            <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Input</span>
                                            <div className="bg-white p-2 rounded border border-slate-200 text-slate-700 min-h-[40px]">{tc.input}</div>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Expected Output</span>
                                            <div className="bg-white p-2 rounded border border-slate-200 text-slate-700 min-h-[40px]">{tc.output}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                            {!output && !isRunning && (
                                <div className="text-center py-12 text-slate-400 flex-1 flex flex-col items-center justify-center">
                                    <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>Run your code to see output here</p>
                                </div>
                            )}

                            {isRunning && (
                                <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                                    <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-slate-500">Compiling and executing...</p>
                                </div>
                            )}

                            {output && (
                                <div className="flex flex-col h-full">
                                    {/* Test Case Tabs */}
                                    <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-2 mb-4">
                                        {output.map((res: any, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveCaseTab(idx)}
                                                className={`px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg text-xs lg:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${activeCaseTab === idx
                                                    ? (res.passed ? 'bg-green-100 text-green-700 ring-2 ring-green-500 ring-offset-1' : 'bg-red-100 text-red-700 ring-2 ring-red-500 ring-offset-1')
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {res.isCustom ? 'Custom' : `Case ${idx}`}
                                                {res.passed ? <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" /> : <AlertTriangle className="w-3 h-3 lg:w-4 lg:h-4" />}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Active Case Detail */}
                                    {output[activeCaseTab] && (
                                        <div className="flex-1 overflow-y-auto space-y-4 font-mono text-xs lg:text-sm">
                                            <div className={`p-3 lg:p-4 rounded-lg border ${output[activeCaseTab].passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                                <h4 className={`font-bold mb-1 ${output[activeCaseTab].passed ? 'text-green-700' : 'text-red-700'}`}>
                                                    {output[activeCaseTab].isCustom
                                                        ? (output[activeCaseTab].passed ? 'Execution Successful' : 'Execution Failed')
                                                        : (output[activeCaseTab].passed ? 'Success' : 'Wrong Answer')
                                                    }
                                                </h4>
                                                {!output[activeCaseTab].passed && output[activeCaseTab].error && (
                                                    <p className="text-red-600 text-xs whitespace-pre-wrap">{output[activeCaseTab].error}</p>
                                                )}
                                            </div>

                                            <div>
                                                <span className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                                    {output[activeCaseTab].isCustom ? 'Your custom input' : 'Input'}
                                                </span>
                                                <div className="bg-slate-50 p-3 rounded border border-slate-200 text-slate-700 whitespace-pre-wrap min-h-[40px]">
                                                    {output[activeCaseTab].input}
                                                </div>
                                            </div>

                                            <div>
                                                <span className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                                    {output[activeCaseTab].isCustom ? 'Your custom output' : 'Your Output'}
                                                </span>
                                                <div className={`p-3 rounded border whitespace-pre-wrap min-h-[40px] ${output[activeCaseTab].passed ? 'bg-white border-slate-200 text-slate-700' : 'bg-white border-red-200 text-red-700'}`}>
                                                    {output[activeCaseTab].actual}
                                                </div>
                                            </div>

                                            {!output[activeCaseTab].isCustom && (
                                                <div>
                                                    <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Expected Output</span>
                                                    <div className="bg-white p-3 rounded border border-slate-200 text-slate-700 whitespace-pre-wrap min-h-[40px]">
                                                        {output[activeCaseTab].expected}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel: Editor */}
            <div className="w-full lg:w-1/2 flex flex-col bg-[#1e1e1e] h-1/2 lg:h-full">
                {/* Editor Header */}
                <div className="flex items-center justify-between px-2 lg:px-4 py-2 border-b border-white/10 bg-[#252526]">
                    <div className="flex items-center gap-2 lg:gap-4">
                        <select
                            value={selectedLang.value}
                            onChange={(e) => setSelectedLang(LANGUAGES.find(l => l.value === e.target.value) || LANGUAGES[0])}
                            className="bg-[#3c3c3c] text-white text-xs lg:text-sm px-2 lg:px-3 py-1.5 rounded border border-transparent focus:border-brand-500 focus:outline-none max-w-[100px] lg:max-w-none"
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.value} value={lang.value}>{lang.name}</option>
                            ))}
                        </select>
                        {lastSaved && <span className="hidden lg:inline text-xs text-white/40">Saved {lastSaved.toLocaleTimeString()}</span>}
                    </div>

                    <div className="flex items-center gap-2 lg:gap-3">
                        {/* Run Code Button */}
                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className="flex items-center gap-2 px-3 lg:px-4 py-1.5 bg-green-600 text-white text-xs lg:text-sm font-bold rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            <Play className="w-3 h-3 lg:w-4 lg:h-4" />
                            Run
                        </button>
                    </div>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1 overflow-hidden relative">
                    <CodeEditorPanel
                        language={selectedLang.value}
                        code={currentCode}
                        onChange={(val) => onCodeChange(val || '')}
                        theme="vs-dark"
                    />
                </div>

                {/* Custom Input Toggle Area */}
                <div className="border-t border-white/10 bg-[#252526] p-2">
                    <div className="flex items-center gap-2 mb-2 px-2">
                        <input
                            type="checkbox"
                            id="customInput"
                            checked={isCustomInputMode}
                            onChange={(e) => setIsCustomInputMode(e.target.checked)}
                            className="rounded border-slate-600 bg-[#3c3c3c] text-brand-600 focus:ring-offset-[#252526]"
                        />
                        <label htmlFor="customInput" className="text-xs lg:text-sm text-slate-300 cursor-pointer select-none">Test with Custom Input</label>
                    </div>

                    {isCustomInputMode && (
                        <div className="h-24 lg:h-32 px-2 pb-2 animate-fade-in">
                            <textarea
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                placeholder="Enter custom input here..."
                                className="w-full h-full bg-[#1e1e1e] text-slate-300 font-mono text-xs lg:text-sm p-3 rounded border border-slate-700 focus:border-brand-500 focus:outline-none resize-none"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
