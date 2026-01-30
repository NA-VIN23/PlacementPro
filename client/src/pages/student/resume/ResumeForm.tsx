import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface ResumeFormProps {
    data: any;
    onChange: (data: any) => void;
    onGenerate: () => void;
    loading: boolean;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({ data, onChange, onGenerate, loading }) => {

    const updateField = (field: string, value: any) => {
        onChange({ ...data, [field]: value });
    };

    // Education Handlers
    const addEducation = () => {
        const newEdu = { degree: '', college: '', cgpa: '' };
        updateField('education', [...data.education, newEdu]);
    };

    const updateEducation = (index: number, field: string, value: string) => {
        const newEdu = [...data.education];
        newEdu[index] = { ...newEdu[index], [field]: value };
        updateField('education', newEdu);
    };

    const removeEducation = (index: number) => {
        const newEdu = data.education.filter((_: any, i: number) => i !== index);
        updateField('education', newEdu);
    };

    // Project Handlers
    const addProject = () => {
        const newProj = { title: '', description: '', technologies: '' };
        updateField('projects', [...data.projects, newProj]);
    };

    const updateProject = (index: number, field: string, value: string) => {
        const newProj = [...data.projects];
        newProj[index] = { ...newProj[index], [field]: value };
        updateField('projects', newProj);
    };

    const removeProject = (index: number) => {
        const newProj = data.projects.filter((_: any, i: number) => i !== index);
        updateField('projects', newProj);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Basic Info */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">1</span>
                    Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text" placeholder="Full Name"
                        value={data.fullName}
                        onChange={e => updateField('fullName', e.target.value)}
                        className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none w-full"
                    />
                    <input
                        type="email" placeholder="Email"
                        value={data.email}
                        onChange={e => updateField('email', e.target.value)}
                        className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none w-full"
                    />
                    <input
                        type="text" placeholder="Phone"
                        value={data.phone}
                        onChange={e => updateField('phone', e.target.value)}
                        className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none w-full"
                    />
                    <input
                        type="text" placeholder="LinkedIn URL (Optional)"
                        value={data.linkedin}
                        onChange={e => updateField('linkedin', e.target.value)}
                        className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none w-full"
                    />
                    <div className="md:col-span-2">
                        <input
                            type="text" placeholder="GitHub URL (Optional)"
                            value={data.github}
                            onChange={e => updateField('github', e.target.value)}
                            className="p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Education */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center text-sm">2</span>
                        Education
                    </h3>
                    <button onClick={addEducation} className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>

                <div className="space-y-4">
                    {data.education.map((edu: any, index: number) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                            <button
                                onClick={() => removeEducation(index)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
                                <input
                                    type="text" placeholder="Degree (e.g. B.Tech CSE)"
                                    value={edu.degree}
                                    onChange={e => updateEducation(index, 'degree', e.target.value)}
                                    className="p-3 bg-white border border-slate-200 rounded-lg outline-none w-full"
                                />
                                <input
                                    type="text" placeholder="College Name"
                                    value={edu.college}
                                    onChange={e => updateEducation(index, 'college', e.target.value)}
                                    className="p-3 bg-white border border-slate-200 rounded-lg outline-none w-full"
                                />
                                <input
                                    type="text" placeholder="CGPA / Percentage"
                                    value={edu.cgpa}
                                    onChange={e => updateEducation(index, 'cgpa', e.target.value)}
                                    className="p-3 bg-white border border-slate-200 rounded-lg outline-none w-full"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">3</span>
                    Skills
                </h3>
                <textarea
                    placeholder="Enter skills separated by commas (e.g. React, Node.js, Python, SQL, AWS)"
                    value={data.skills}
                    onChange={e => updateField('skills', e.target.value)}
                    className="p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none w-full h-32 resize-none"
                />
                <p className="text-xs text-slate-400 mt-2">Tip: Include technical keywords relevant to your target role.</p>
            </div>

            {/* Projects */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm">4</span>
                        Projects
                    </h3>
                    <button onClick={addProject} className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>

                <div className="space-y-6">
                    {data.projects.map((proj: any, index: number) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                            <button
                                onClick={() => removeProject(index)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <div className="space-y-4 pr-8">
                                <input
                                    type="text" placeholder="Project Title"
                                    value={proj.title}
                                    onChange={e => updateProject(index, 'title', e.target.value)}
                                    className="p-3 bg-white border border-slate-200 rounded-lg outline-none w-full font-bold text-slate-700"
                                />
                                <input
                                    type="text" placeholder="Technologies Used (e.g. React, Firebase)"
                                    value={proj.technologies}
                                    onChange={e => updateProject(index, 'technologies', e.target.value)}
                                    className="p-3 bg-white border border-slate-200 rounded-lg outline-none w-full"
                                />
                                <textarea
                                    placeholder="Brief Description (Describe what you built and your role)"
                                    value={proj.description}
                                    onChange={e => updateProject(index, 'description', e.target.value)}
                                    className="p-3 bg-white border border-slate-200 rounded-lg outline-none w-full h-24 resize-none"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={onGenerate}
                disabled={loading}
                className={`w-full py-4 text-lg font-bold text-white rounded-xl shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-3
                    ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-brand-500/25'}
                `}
            >
                {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing & Generating...
                    </>
                ) : (
                    'Generate Resume & Check Score'
                )}
            </button>
        </div>
    );
};
