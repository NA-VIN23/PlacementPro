import React from 'react';
import { Download, Star, AlertTriangle, CheckCircle, RefreshCw, LayoutTemplate } from 'lucide-react';

interface ResumePreviewProps {
    resumeId: string;
    score: number;
    suggestions: string[];
    resumeHtml: string;
    onEdit: () => void;
    selectedTemplate: string;
    onTemplateChange: (template: string) => void;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
    resumeId,
    score,
    suggestions,
    resumeHtml,
    onEdit,
    selectedTemplate,
    onTemplateChange
}) => {

    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const templates = [
        { id: 'classic', label: 'Classic ATS', desc: 'Standard & Clean' },
        { id: 'modern', label: 'Modern ATS', desc: 'Uppercase Headers' },
        { id: 'compact', label: 'Compact ATS', desc: 'Dense Layout' }
    ];

    const handleDownload = async () => {
        try {
            // Trigger download via window.open
            window.open(`${API_BASE_URL}/resume/download?id=${resumeId}`, '_blank');
        } catch (error) {
            console.error('Download failed', error);
            alert('Failed to download resume');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in text-slate-900">
            {/* Score Card */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <div className="text-center md:text-left">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">ATS Compatibility Score</p>
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <span className={`text-6xl font-black ${score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                                {score}
                            </span>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-slate-300">/100</span>
                                {score >= 80 && (
                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full flex items-center gap-1 w-max">
                                        <Star className="w-3 h-3 fill-current" /> Excellent
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-indigo-500" />
                            AI Analysis & Suggestions
                        </h4>
                        <div className="bg-slate-50 rounded-xl p-4 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                            {suggestions.length > 0 ? (
                                suggestions.map((s, i) => (
                                    <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></div>
                                        {s}
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                                    <CheckCircle className="w-5 h-5" /> No critical issues found!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Template Selector */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <LayoutTemplate className="w-5 h-5 text-indigo-600" />
                    Select Resume Template
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {templates.map(t => (
                        <button
                            key={t.id}
                            onClick={() => onTemplateChange(t.id)}
                            className={`p-4 rounded-xl border text-left transition-all ${selectedTemplate === t.id ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'}`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className={`font-bold ${selectedTemplate === t.id ? 'text-indigo-700' : 'text-slate-700'}`}>{t.label}</span>
                                {selectedTemplate === t.id && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
                            </div>
                            <p className="text-xs text-slate-500">{t.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-4">
                <button
                    onClick={onEdit}
                    className="flex-1 py-3 px-6 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" />
                    Edit Details
                </button>
                <button
                    onClick={handleDownload}
                    className="flex-[2] py-3 px-6 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    Download PDF
                </button>
            </div>

            {/* Resume Preview */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                    <p className="font-bold text-slate-500 text-sm">Preview ({selectedTemplate})</p>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                    </div>
                </div>
                <div className="p-8 md:p-16 overflow-x-auto bg-slate-50">
                    <div
                        className="bg-white shadow-sm border border-slate-200 mx-auto max-w-[210mm] min-h-[297mm] p-[15mm] text-slate-900 resume-content text-left"
                        dangerouslySetInnerHTML={{ __html: resumeHtml }}
                    />
                </div>
            </div>
        </div>
    );
};
