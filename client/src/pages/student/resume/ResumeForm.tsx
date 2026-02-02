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

    // Experience Handlers
    const addExperience = () => {
        const newExp = { company: '', role: '', duration: '', description: '' };
        updateField('experience', [...(data.experience || []), newExp]);
    };
    const updateExperience = (index: number, field: string, value: string) => {
        const newExp = [...(data.experience || [])];
        newExp[index] = { ...newExp[index], [field]: value };
        updateField('experience', newExp);
    };
    const removeExperience = (index: number) => {
        const newExp = data.experience.filter((_: any, i: number) => i !== index);
        updateField('experience', newExp);
    };

    // Certification Handlers
    const addCertification = () => {
        updateField('certifications', [...(data.certifications || []), { name: '', organization: '', year: '', url: '' }]);
    };
    const updateCertification = (index: number, field: string, value: string) => {
        const newCert = [...(data.certifications || [])];
        newCert[index] = { ...newCert[index], [field]: value };
        updateField('certifications', newCert);
    };
    const removeCertification = (index: number) => {
        updateField('certifications', data.certifications.filter((_: any, i: number) => i !== index));
    };

    // Achievement Handlers (String Array)
    const addAchievement = () => {
        updateField('achievements', [...(data.achievements || []), '']);
    };
    const updateAchievement = (index: number, value: string) => {
        const newAch = [...(data.achievements || [])];
        newAch[index] = value;
        updateField('achievements', newAch);
    };
    const removeAchievement = (index: number) => {
        updateField('achievements', data.achievements.filter((_: any, i: number) => i !== index));
    };

    // Languages Handlers
    const addLanguage = () => {
        updateField('languages', [...(data.languages || []), { language: '', proficiency: 'Intermediate' }]);
    };
    const updateLanguage = (index: number, field: string, value: string) => {
        const newLang = [...(data.languages || [])];
        newLang[index] = { ...newLang[index], [field]: value };
        updateField('languages', newLang);
    };
    const removeLanguage = (index: number) => {
        updateField('languages', data.languages.filter((_: any, i: number) => i !== index));
    };

    // Co-Curricular Handlers (String Array)
    const addCoCurricular = () => {
        updateField('coCurricularActivities', [...(data.coCurricularActivities || []), '']);
    };
    const updateCoCurricular = (index: number, value: string) => {
        const newCo = [...(data.coCurricularActivities || [])];
        newCo[index] = value;
        updateField('coCurricularActivities', newCo);
    };
    const removeCoCurricular = (index: number) => {
        updateField('coCurricularActivities', data.coCurricularActivities.filter((_: any, i: number) => i !== index));
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

            {/* Work Experience */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center text-sm">5</span>
                        Work Experience / Internships (Optional)
                    </h3>
                    <button onClick={addExperience} className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>
                <div className="space-y-6">
                    {(data.experience || []).map((exp: any, index: number) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                            <button onClick={() => removeExperience(index)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5" /></button>
                            <div className="space-y-4 pr-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" placeholder="Company / Organization" value={exp.company} onChange={e => updateExperience(index, 'company', e.target.value)} className="p-3 bg-white border border-slate-200 rounded-lg outline-none w-full font-bold" />
                                    <input type="text" placeholder="Role (e.g. SDE Intern)" value={exp.role} onChange={e => updateExperience(index, 'role', e.target.value)} className="p-3 bg-white border border-slate-200 rounded-lg outline-none w-full" />
                                </div>
                                <input type="text" placeholder="Duration (e.g. Jan 2024 - Present)" value={exp.duration} onChange={e => updateExperience(index, 'duration', e.target.value)} className="p-3 bg-white border border-slate-200 rounded-lg outline-none w-full" />
                                <textarea placeholder="Responsibilities & Achievements" value={exp.description} onChange={e => updateExperience(index, 'description', e.target.value)} className="p-3 bg-white border border-slate-200 rounded-lg outline-none w-full h-24 resize-none" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Additional Details (Objective, Photo, etc) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center text-sm">6</span>
                    Additional Details (Optional)
                </h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Profile Photo URL</label>
                        <input type="text" placeholder="https://..." value={data.profilePhoto || ''} onChange={e => updateField('profilePhoto', e.target.value)} className="p-3 border border-slate-200 rounded-xl outline-none w-full" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Career Objective</label>
                        <textarea placeholder="Briefly describe your career goals..." value={data.objective || ''} onChange={e => updateField('objective', e.target.value)} className="p-3 border border-slate-200 rounded-xl outline-none w-full h-24 resize-none" />
                    </div>
                </div>
            </div>

            {/* Checkbox-style Lists & Misc */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Certifications */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-800">Certifications</h4>
                        <button onClick={addCertification} className="text-xs font-bold text-brand-600"><Plus className="w-3 h-3 inline" /> Add</button>
                    </div>
                    <div className="space-y-3">
                        {(data.certifications || []).map((cert: any, i: number) => (
                            <div key={i} className="flex gap-2">
                                <div className="space-y-2 flex-1">
                                    <input type="text" placeholder="Name" value={cert.name} onChange={e => updateCertification(i, 'name', e.target.value)} className="p-2 border rounded-lg w-full text-sm" />
                                    <input type="text" placeholder="Org" value={cert.organization} onChange={e => updateCertification(i, 'organization', e.target.value)} className="p-2 border rounded-lg w-full text-sm" />
                                </div>
                                <button onClick={() => removeCertification(i)} className="text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Achievements */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-800">Achievements</h4>
                        <button onClick={addAchievement} className="text-xs font-bold text-brand-600"><Plus className="w-3 h-3 inline" /> Add</button>
                    </div>
                    <div className="space-y-2">
                        {(data.achievements || []).map((ach: string, i: number) => (
                            <div key={i} className="flex gap-2">
                                <input type="text" placeholder="Achievement..." value={ach} onChange={e => updateAchievement(i, e.target.value)} className="p-2 border rounded-lg w-full text-sm" />
                                <button onClick={() => removeAchievement(i)} className="text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Technical Tools */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-2">Technical Tools</h4>
                    <textarea placeholder="Git, Docker, Postman..." value={data.technicalTools || ''} onChange={e => updateField('technicalTools', e.target.value)} className="p-3 border rounded-lg w-full h-24 text-sm" />
                </div>
                {/* Soft Skills */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-800 mb-2">Soft Skills</h4>
                    <textarea placeholder="Communication, Leadership..." value={data.softSkills || ''} onChange={e => updateField('softSkills', e.target.value)} className="p-3 border rounded-lg w-full h-24 text-sm" />
                </div>

                {/* Languages */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-800">Languages</h4>
                        <button onClick={addLanguage} className="text-xs font-bold text-brand-600"><Plus className="w-3 h-3 inline" /> Add</button>
                    </div>
                    <div className="space-y-2">
                        {(data.languages || []).map((l: any, i: number) => (
                            <div key={i} className="flex gap-2">
                                <input type="text" placeholder="Language" value={l.language} onChange={e => updateLanguage(i, 'language', e.target.value)} className="p-2 border rounded-lg flex-1 text-sm" />
                                <select value={l.proficiency} onChange={e => updateLanguage(i, 'proficiency', e.target.value)} className="p-2 border rounded-lg text-sm bg-white">
                                    <option>Basic</option>
                                    <option>Intermediate</option>
                                    <option>Fluent</option>
                                    <option>Native</option>
                                </select>
                                <button onClick={() => removeLanguage(i)} className="text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Extra-Curricular */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-800">Extra-Curricular</h4>
                        <button onClick={addCoCurricular} className="text-xs font-bold text-brand-600"><Plus className="w-3 h-3 inline" /> Add</button>
                    </div>
                    <div className="space-y-2">
                        {(data.coCurricularActivities || []).map((act: string, i: number) => (
                            <div key={i} className="flex gap-2">
                                <input type="text" placeholder="Activity..." value={act} onChange={e => updateCoCurricular(i, e.target.value)} className="p-2 border rounded-lg w-full text-sm" />
                                <button onClick={() => removeCoCurricular(i)} className="text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
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
