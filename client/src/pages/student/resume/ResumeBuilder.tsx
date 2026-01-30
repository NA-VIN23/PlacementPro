import React, { useState } from 'react';
import { ResumeForm } from './ResumeForm';
import { ResumePreview } from './ResumePreview';
import { FileText, ChevronRight } from 'lucide-react';
import { api } from '../../../services/api';

export const ResumeBuilder: React.FC = () => {
    const [step, setStep] = useState<'form' | 'preview'>('form');
    const [loading, setLoading] = useState(false);

    // Resume Data State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        linkedin: '',
        github: '',
        education: [{ degree: '', college: '', cgpa: '' }],
        skills: '',
        projects: [{ title: '', description: '', technologies: '' }],
        experience: []
    });

    // Template State
    const [selectedTemplate, setSelectedTemplate] = useState('classic');

    // Result State
    const [result, setResult] = useState<{
        resumeId: string;
        resumeHtml: string;
        score: number;
        suggestions: string[];
    } | null>(null);

    const handleGenerate = async (templateOverride?: string) => {
        setLoading(true);
        const tmpl = typeof templateOverride === 'string' ? templateOverride : selectedTemplate;

        try {
            // POST /api/resume/generate
            const response = await api.post('/resume/generate', { ...formData, template: tmpl });
            setResult(response.data);
            if (typeof templateOverride === 'string') setSelectedTemplate(tmpl);
            setStep('preview');
        } catch (error) {
            console.error("Error generating resume:", error);
            alert("Failed to generate resume. Please check your inputs.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <span>Student</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-slate-900">Resume Builder</span>
            </div>

            <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-gradient-to-br from-brand-600 to-indigo-600 rounded-2xl text-white shadow-xl shadow-brand-500/20">
                    <FileText className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Resume Builder (ATS)</h1>
                    <p className="text-slate-500 mt-1 text-lg">Create an ATS-optimized resume in seconds. Get scored and improved.</p>
                </div>
            </div>

            {step === 'form' ? (
                <ResumeForm
                    data={formData}
                    onChange={setFormData}
                    onGenerate={handleGenerate}
                    loading={loading}
                />
            ) : (
                <ResumePreview
                    resumeId={result?.resumeId || ''}
                    score={result?.score || 0}
                    suggestions={result?.suggestions || []}
                    resumeHtml={result?.resumeHtml || ''}
                    onEdit={() => setStep('form')}
                    selectedTemplate={selectedTemplate}
                    onTemplateChange={(tmpl) => handleGenerate(tmpl)}
                />
            )}
        </div>
    );
};
