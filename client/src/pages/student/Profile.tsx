import React, { useState, useEffect } from 'react';
import { Mail, Linkedin, Github, Edit2, Calendar, Award, X, Save, User, BookOpen, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';
import DotGrid from '../../components/DotGrid';

interface Education {
    degree: string;
    school: string;
    year: string;
    score: string;
}

interface Certification {
    title: string;
    issuer: string;
}

interface Internship {
    role: string;
    company: string;
    duration: string;
    description: string;
}

interface Project {
    title: string;
    description: string;
    techStack: string;
    link?: string;
}

interface ProfileData {
    name: string;
    email: string;
    bio: string;
    department: string;
    batch: string;
    rollNumber: string;
    linkedin: string;
    github: string;
    skills: string[];
    education: Education[];
    certifications: Certification[];
    internships: Internship[];
    projects: Project[];
}

export const StudentProfile: React.FC = () => {
    const { user } = useAuth();
    const { success, error } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [profileData, setProfileData] = useState<ProfileData>({
        name: user?.name || '',
        email: user?.email || '',
        bio: '',
        department: (user as any)?.department || '',
        batch: (user as any)?.batch || '',
        rollNumber: (user as any)?.registration_number || '',
        linkedin: '',
        github: '',
        skills: [],
        education: [],
        certifications: [],
        internships: [],
        projects: []
    });

    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            if (user?.id) {
                try {
                    const profile = await studentService.getProfile();

                    setProfileData(prev => ({
                        ...prev,
                        ...profile,
                        // Ensure core identity comes from Auth Context
                        name: user.name || prev.name,
                        email: user.email || prev.email,
                        department: (user as any)?.department || prev.department,
                        batch: (user as any)?.batch || prev.batch,
                        rollNumber: (user as any)?.registration_number || prev.rollNumber,
                    }));
                } catch (error) {
                    console.error("Failed to fetch profile", error);
                    // Fallback to local storage if API fails initially? Or just log.
                }
            }
        };
        loadProfile();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const addSkill = () => {
        if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
            setProfileData({ ...profileData, skills: [...profileData.skills, newSkill.trim()] });
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setProfileData({ ...profileData, skills: profileData.skills.filter(s => s !== skill) });
    };

    // Generic Add/Remove/Update helpers
    const addItem = <T,>(field: keyof ProfileData, initialItem: T) => {
        setProfileData({ ...profileData, [field]: [...(profileData[field] as T[]), initialItem] });
    };

    const updateItem = <T,>(field: keyof ProfileData, index: number, subField: keyof T, value: string) => {
        const list = [...(profileData[field] as T[])];
        list[index] = { ...list[index], [subField]: value };
        setProfileData({ ...profileData, [field]: list });
    };

    const removeItem = (field: keyof ProfileData, index: number) => {
        setProfileData({
            ...profileData,
            [field]: (profileData[field] as any[]).filter((_, i) => i !== index)
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await studentService.updateProfile({
                bio: profileData.bio,
                linkedin: profileData.linkedin,
                github: profileData.github,
                skills: profileData.skills,
                internships: profileData.internships,
                projects: profileData.projects,
                education: profileData.education,
                certifications: profileData.certifications
            });
            success("Profile updated successfully!");
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to save profile", err);
            error("Failed to save profile changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Profile Header */}
            <div className="relative group">
                <div className="h-40 bg-slate-900 rounded-3xl overflow-hidden relative shadow-md">
                    <DotGrid
                        dotSize={4}
                        gap={20}
                        baseColor="#334155" // slate-700
                        activeColor="#60a5fa" // blue-400
                        proximity={120}
                        shockRadius={250}
                        shockStrength={5}
                        resistance={750}
                        returnDuration={1.5}
                        className="opacity-80"
                    />
                </div>

                <div className="relative px-8 pb-4 flex flex-col md:flex-row items-end -mt-12 gap-6">
                    <div className="w-32 h-32 rounded-3xl border-4 border-white bg-white shadow-lg overflow-hidden relative group/avatar">
                        <img
                            src={`https://ui-avatars.com/api/?name=${profileData.name}&background=4f46e5&color=fff&size=128`}
                            alt={profileData.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex-1 text-slate-900 pb-2">
                        <h1 className="text-3xl font-bold">{profileData.name}</h1>
                        <p className="text-slate-500 font-medium">
                            {profileData.department} • {profileData.batch}
                        </p>
                    </div>

                    <div className="flex gap-3 pb-2">
                        {isEditing ? (
                            <>
                                <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-2xl hover:bg-slate-200 flex items-center gap-2">
                                    <X className="w-4 h-4" /> Cancel
                                </button>
                                <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-green-600 text-white font-medium rounded-2xl hover:bg-green-700 shadow-sm shadow-green-500/30 flex items-center gap-2 disabled:opacity-50">
                                    <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-2xl hover:bg-blue-700 shadow-sm shadow-blue-500/30 flex items-center gap-2">
                                <Edit2 className="w-4 h-4" /> Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <h3 className="font-bold text-slate-800 text-lg">Contact Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-600">
                                <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                                <span className="text-sm">{profileData.email}</span>
                            </div>
                        </div>
                        <hr className="border-slate-100" />
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Social Links</label>
                            {isEditing ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Linkedin className="w-4 h-4 text-blue-600" />
                                        <input name="linkedin" value={profileData.linkedin} onChange={handleChange} placeholder="LinkedIn URL" className="flex-1 text-sm px-3 py-1.5 border border-slate-200 rounded-xl" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Github className="w-4 h-4 text-slate-800" />
                                        <input name="github" value={profileData.github} onChange={handleChange} placeholder="GitHub URL" className="flex-1 text-sm px-3 py-1.5 border border-slate-200 rounded-xl" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-4">
                                    {(profileData.linkedin || profileData.github) ? (
                                        <>
                                            {profileData.linkedin && <a href={`https://${profileData.linkedin}`} target="_blank" className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"><Linkedin className="w-5 h-5" /></a>}
                                            {profileData.github && <a href={`https://${profileData.github}`} target="_blank" className="p-2 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200"><Github className="w-5 h-5" /></a>}
                                        </>
                                    ) : <p className="text-sm text-slate-400">No links added.</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Academic Info */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <h3 className="font-bold text-slate-800 text-lg">Academic Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-slate-400" />
                                <div><p className="text-xs text-slate-400 font-medium">Department</p><p className="text-sm text-slate-700 font-medium">{profileData.department}</p></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-slate-400" />
                                <div><p className="text-xs text-slate-400 font-medium">Roll Number</p><p className="text-sm text-slate-700 font-mono font-medium">{profileData.rollNumber}</p></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                <div><p className="text-xs text-slate-400 font-medium">Batch</p><p className="text-sm text-slate-700 font-medium">{profileData.batch}</p></div>
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 text-lg mb-4">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {profileData.skills.map(skill => (
                                <span key={skill} className={cn("px-3 py-1 bg-slate-50 text-slate-600 text-sm font-medium rounded-full border border-slate-100 flex items-center gap-1", isEditing && "pr-1.5")}>
                                    {skill}
                                    {isEditing && <button onClick={() => removeSkill(skill)} className="ml-1 p-0.5 hover:bg-red-100 rounded-full text-red-500"><X className="w-3 h-3" /></button>}
                                </span>
                            ))}
                        </div>
                        {isEditing && (
                            <div className="mt-4 flex gap-2">
                                <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSkill()} placeholder="Add skill..." className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-xl" />
                                <button onClick={addSkill} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl">Add</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* About */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 text-lg mb-3">About Me</h3>
                        {isEditing ? (
                            <textarea name="bio" value={profileData.bio} onChange={handleChange} rows={4} className="w-full text-sm px-3 py-2 border border-slate-200 rounded-xl" placeholder="Write something about yourself..." />
                        ) : <p className="text-slate-600 leading-relaxed text-sm">{profileData.bio || "No bio added yet."}</p>}
                    </div>

                    {/* Internships */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                Internships
                            </h3>
                            {isEditing && <button onClick={() => addItem('internships', { role: '', company: '', duration: '', description: '' })} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>}
                        </div>
                        <div className="space-y-6">
                            {profileData.internships.map((intern, i) => (
                                <div key={i} className="group relative pl-4 border-l-2 border-slate-100 hover:border-blue-200 transition-colors">
                                    {isEditing ? (
                                        <div className="grid grid-cols-1 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                            <input placeholder="Role / Position" value={intern.role} onChange={(e) => updateItem('internships', i, 'role', e.target.value)} className="font-bold bg-transparent border-b border-slate-300 w-full" />
                                            <input placeholder="Company Name" value={intern.company} onChange={(e) => updateItem('internships', i, 'company', e.target.value)} className="text-sm bg-transparent border-b border-slate-300 w-full" />
                                            <input placeholder="Duration (e.g. Summer 2024)" value={intern.duration} onChange={(e) => updateItem('internships', i, 'duration', e.target.value)} className="text-xs bg-transparent border-b border-slate-300 w-full" />
                                            <textarea placeholder="Description of work..." value={intern.description} onChange={(e) => updateItem('internships', i, 'description', e.target.value)} className="text-sm bg-transparent border border-slate-300 w-full p-2 rounded" rows={2} />
                                            <button onClick={() => removeItem('internships', i)} className="text-xs text-red-500 flex items-center gap-1 mt-1"><Trash2 className="w-3 h-3" /> Remove</button>
                                        </div>
                                    ) : (
                                        <>
                                            <h4 className="font-bold text-slate-800">{intern.role}</h4>
                                            <div className="flex justify-between text-sm text-slate-600 mb-1">
                                                <span>{intern.company}</span>
                                                <span className="text-slate-400 text-xs">{intern.duration}</span>
                                            </div>
                                            <p className="text-sm text-slate-500 leading-snug">{intern.description}</p>
                                        </>
                                    )}
                                </div>
                            ))}
                            {!isEditing && profileData.internships.length === 0 && <p className="text-slate-500 italic text-sm">No internships added.</p>}
                        </div>
                    </div>

                    {/* Projects */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                Projects
                            </h3>
                            {isEditing && <button onClick={() => addItem('projects', { title: '', description: '', techStack: '', link: '' })} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {profileData.projects.map((proj, i) => (
                                <div key={i} className="border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-shadow bg-slate-50/50">
                                    {isEditing ? (
                                        <div className="flex flex-col gap-2">
                                            <input placeholder="Project Title" value={proj.title} onChange={(e) => updateItem('projects', i, 'title', e.target.value)} className="font-bold bg-transparent border-b border-slate-300 w-full" />
                                            <textarea placeholder="Description" value={proj.description} onChange={(e) => updateItem('projects', i, 'description', e.target.value)} className="text-sm bg-transparent border border-slate-300 w-full p-1 rounded" rows={2} />
                                            <input placeholder="Tech Stack (comma sep)" value={proj.techStack} onChange={(e) => updateItem('projects', i, 'techStack', e.target.value)} className="text-xs bg-transparent border-b border-slate-300 w-full" />
                                            <input placeholder="Link (Optional)" value={proj.link} onChange={(e) => updateItem('projects', i, 'link', e.target.value)} className="text-xs bg-transparent border-b border-slate-300 w-full" />
                                            <button onClick={() => removeItem('projects', i)} className="text-xs text-red-500 flex items-center gap-1 mt-1"><Trash2 className="w-3 h-3" /> Remove</button>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-800 line-clamp-1" title={proj.title}>{proj.title}</h4>
                                                {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs shrink-0 bg-blue-50 px-2 py-0.5 rounded-full">View</a>}
                                            </div>
                                            <p className="text-sm text-slate-600 mb-3 flex-1 line-clamp-3" title={proj.description}>{proj.description}</p>
                                            <div className="flex flex-wrap gap-1 mt-auto">
                                                {(proj.techStack || '').split(',').map((tech, idx) => (
                                                    <span key={idx} className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">{tech.trim()}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {!isEditing && profileData.projects.length === 0 && <p className="text-slate-500 italic text-sm text-center py-4">No projects added yet.</p>}
                    </div>

                    {/* Education */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 text-lg">Education</h3>
                            {isEditing && <button onClick={() => addItem('education', { degree: '', school: '', year: '', score: '' })} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>}
                        </div>

                        <div className="space-y-6 relative ml-2 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                            {profileData.education.map((edu, i) => (
                                <div key={i} className="relative pl-8">
                                    <div className="absolute left-0 top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white bg-blue-500 shadow-sm"></div>
                                    {isEditing ? (
                                        <div className="grid grid-cols-1 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                            <input placeholder="Degree" value={edu.degree} onChange={(e) => updateItem('education', i, 'degree', e.target.value)} className="text-sm font-bold bg-transparent border-b border-slate-300 w-full" />
                                            <input placeholder="School/University" value={edu.school} onChange={(e) => updateItem('education', i, 'school', e.target.value)} className="text-xs text-slate-600 bg-transparent border-b border-slate-300 w-full" />
                                            <div className="flex gap-2">
                                                <input placeholder="Year" value={edu.year} onChange={(e) => updateItem('education', i, 'year', e.target.value)} className="text-xs bg-transparent border-b border-slate-300 w-1/2" />
                                                <input placeholder="Score" value={edu.score} onChange={(e) => updateItem('education', i, 'score', e.target.value)} className="text-xs bg-transparent border-b border-slate-300 w-1/2" />
                                            </div>
                                            <button onClick={() => removeItem('education', i)} className="text-xs text-red-500 flex items-center gap-1 mt-1"><Trash2 className="w-3 h-3" /> Remove</button>
                                        </div>
                                    ) : (
                                        <>
                                            <h4 className="font-bold text-slate-800">{edu.degree}</h4>
                                            <p className="text-slate-600 text-sm">{edu.school}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {edu.year}</span>
                                                <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {edu.score}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Certifications */}
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 text-lg">Certifications</h3>
                            {isEditing && <button onClick={() => addItem('certifications', { title: '', issuer: '' })} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>}
                        </div>
                        <ul className="list-disc list-inside space-y-2">
                            {profileData.certifications.map((cert, i) => (
                                <li key={i} className="text-sm text-slate-700">
                                    {isEditing ? (
                                        <div className="inline-flex flex-col gap-1 align-top ml-2 w-full max-w-md bg-slate-50 p-2 rounded-xl border border-slate-200">
                                            <input placeholder="Certification Title" value={cert.title} onChange={(e) => updateItem('certifications', i, 'title', e.target.value)} className="font-medium bg-transparent border-b border-slate-300" />
                                            <input placeholder="Year / Issuer" value={cert.issuer} onChange={(e) => updateItem('certifications', i, 'issuer', e.target.value)} className="text-xs text-slate-500 bg-transparent border-b border-slate-300" />
                                            <button onClick={() => removeItem('certifications', i)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-1 w-fit"><Trash2 className="w-3 h-3" /> Remove</button>
                                        </div>
                                    ) : (
                                        <span><span className="font-medium">{cert.title}</span><span className="text-slate-500"> - {cert.issuer}</span></span>
                                    )}
                                </li>
                            ))}
                        </ul>
                        {!isEditing && profileData.certifications.length === 0 && <p className="text-slate-500 text-sm italic">No certifications added.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};
