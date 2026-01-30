import React, { useState, useEffect } from 'react';
import { Mail, Linkedin, Github, Edit2, Calendar, Award, X, Save, User, BookOpen, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

interface Education {
    degree: string;
    school: string;
    year: string;
    score: string;
}

interface Certification {
    title: string;
    issuer: string; // Used as 'year' in the bullet point request "Title and which year"
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
}

export const StudentProfile: React.FC = () => {
    const { user } = useAuth();

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Results Data State
    const [results, setResults] = useState<any[]>([]);

    // Profile Data State
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
        certifications: []
    });

    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        // Load persisted data for this user
        // Load persisted data for this user
        if (user?.id) {
            const savedProfile = localStorage.getItem(`student_profile_${user.id}`);
            const parsed = savedProfile ? JSON.parse(savedProfile) : {};

            setProfileData(prev => ({
                ...prev,
                ...parsed,
                // Ensure core fields are always from Auth Context/DB
                name: user.name || prev.name,
                email: user.email || prev.email,
                department: (user as any)?.department || prev.department,
                batch: (user as any)?.batch || prev.batch,
                rollNumber: (user as any)?.registration_number || prev.rollNumber,
            }));
        }

        const fetchResults = async () => {
            try {
                const { studentService } = await import('../../services/api');
                const data = await studentService.getStudentResults();
                setResults(data);
            } catch (error) {
                console.error("Failed to fetch results", error);
            }
        };
        fetchResults();
    }, [user]);

    // Handle Input Change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    // Skills Management
    const addSkill = () => {
        if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
            setProfileData({ ...profileData, skills: [...profileData.skills, newSkill.trim()] });
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setProfileData({ ...profileData, skills: profileData.skills.filter(s => s !== skill) });
    };

    // Education Management
    const addEducation = () => {
        setProfileData({
            ...profileData,
            education: [...profileData.education, { degree: '', school: '', year: '', score: '' }]
        });
    };

    const updateEducation = (index: number, field: keyof Education, value: string) => {
        const updatedEdu = [...profileData.education];
        updatedEdu[index] = { ...updatedEdu[index], [field]: value };
        setProfileData({ ...profileData, education: updatedEdu });
    };

    const removeEducation = (index: number) => {
        setProfileData({
            ...profileData,
            education: profileData.education.filter((_, i) => i !== index)
        });
    };

    // Certification Management
    const addCertification = () => {
        setProfileData({
            ...profileData,
            certifications: [...profileData.certifications, { title: '', issuer: '' }]
        });
    };

    const updateCertification = (index: number, field: keyof Certification, value: string) => {
        const updatedCert = [...profileData.certifications];
        updatedCert[index] = { ...updatedCert[index], [field]: value };
        setProfileData({ ...profileData, certifications: updatedCert });
    };

    const removeCertification = (index: number) => {
        setProfileData({
            ...profileData,
            certifications: profileData.certifications.filter((_, i) => i !== index)
        });
    };

    // Save Profile
    const handleSave = () => {
        setIsSaving(true);
        // Persist to localStorage
        if (user?.id) {
            localStorage.setItem(`student_profile_${user.id}`, JSON.stringify({
                bio: profileData.bio,
                linkedin: profileData.linkedin,
                github: profileData.github,
                skills: profileData.skills,
                education: profileData.education,
                certifications: profileData.certifications
            }));
        }

        setTimeout(() => {
            setIsSaving(false);
            setIsEditing(false);
        }, 800);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Profile Header */}
            <div className="relative group">
                <div className="h-48 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2929&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                </div>

                <div className="relative px-8 pb-4 flex flex-col md:flex-row items-end -mt-12 gap-6">
                    <div className="w-32 h-32 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden relative group/avatar">
                        <img
                            src={`https://ui-avatars.com/api/?name=${profileData.name}&background=0D8ABC&color=fff&size=128`}
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
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-sm shadow-green-500/30 flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 shadow-sm shadow-brand-500/30 flex items-center gap-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info & Stats */}
                <div className="space-y-6">
                    {/* Contact Info (Read Only: Email) & Socials */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
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
                                        <input
                                            type="text"
                                            name="linkedin"
                                            value={profileData.linkedin}
                                            onChange={handleChange}
                                            placeholder="LinkedIn URL"
                                            className="flex-1 text-sm px-3 py-1.5 border border-slate-200 rounded-lg"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Github className="w-4 h-4 text-slate-800" />
                                        <input
                                            type="text"
                                            name="github"
                                            value={profileData.github}
                                            onChange={handleChange}
                                            placeholder="GitHub URL"
                                            className="flex-1 text-sm px-3 py-1.5 border border-slate-200 rounded-lg"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-4">
                                    {profileData.linkedin && (
                                        <a href={`https://${profileData.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                            <Linkedin className="w-5 h-5" />
                                        </a>
                                    )}
                                    {profileData.github && (
                                        <a href={`https://${profileData.github}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 transition-colors">
                                            <Github className="w-5 h-5" />
                                        </a>
                                    )}
                                    {!profileData.linkedin && !profileData.github && <p className="text-sm text-slate-400">No links added.</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Academic Info (Read Only) */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <h3 className="font-bold text-slate-800 text-lg">Academic Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-slate-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 font-medium">Department</p>
                                    <p className="text-sm text-slate-700 font-medium">{profileData.department}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-slate-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 font-medium">Roll Number</p>
                                    <p className="text-sm text-slate-700 font-mono font-medium">{profileData.rollNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 font-medium">Batch</p>
                                    <p className="text-sm text-slate-700 font-medium">{profileData.batch}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 text-lg mb-4">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {profileData.skills.map(skill => (
                                <span
                                    key={skill}
                                    className={cn(
                                        "px-3 py-1 bg-slate-50 text-slate-600 text-sm font-medium rounded-md border border-slate-100 flex items-center gap-1",
                                        isEditing && "pr-1.5"
                                    )}
                                >
                                    {skill}
                                    {isEditing && (
                                        <button onClick={() => removeSkill(skill)} className="ml-1 p-0.5 hover:bg-red-100 rounded text-red-500">
                                            <X className="w-3 h-3" />
                                        </button>
                                    )}
                                </span>
                            ))}
                        </div>
                        {isEditing && (
                            <div className="mt-4 flex gap-2">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                                    placeholder="Add skill..."
                                    className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-lg"
                                />
                                <button onClick={addSkill} className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700">
                                    Add
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* About */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 text-lg mb-3">About Me</h3>
                        {isEditing ? (
                            <textarea
                                name="bio"
                                value={profileData.bio}
                                onChange={handleChange}
                                rows={4}
                                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg"
                                placeholder="Write something about yourself..."
                            />
                        ) : (
                            <p className="text-slate-600 leading-relaxed text-sm">
                                {profileData.bio || "No bio added yet."}
                            </p>
                        )}
                    </div>

                    {/* Recent Performance / Results */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 text-lg mb-6">Recent Performance</h3>
                        {results.length > 0 ? (
                            <div className="space-y-4">
                                {results.slice(0, 3).map((res, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <div>
                                            <h4 className="font-bold text-slate-800">{res.exams?.title || 'Unknown Exam'}</h4>
                                            <p className="text-xs text-slate-500">Submitted on {new Date(res.submitted_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-sm font-bold",
                                                res.score >= 4 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {res.score} / {res.total || 5}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 italic text-sm">No exam results available yet.</p>
                        )}
                    </div>

                    {/* Education */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 text-lg">Education</h3>
                            {isEditing && (
                                <button onClick={addEducation} className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1">
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            )}
                        </div>

                        <div className="space-y-6 relative ml-2 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                            {profileData.education.map((edu, i) => (
                                <div key={i} className="relative pl-8">
                                    <div className="absolute left-0 top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white bg-brand-500 shadow-sm"></div>
                                    {isEditing ? (
                                        <div className="grid grid-cols-1 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                            <input
                                                placeholder="Degree"
                                                value={edu.degree}
                                                onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                                                className="text-sm font-bold bg-transparent border-b border-slate-300 focus:border-brand-500 outline-none w-full"
                                            />
                                            <input
                                                placeholder="School/University"
                                                value={edu.school}
                                                onChange={(e) => updateEducation(i, 'school', e.target.value)}
                                                className="text-xs text-slate-600 bg-transparent border-b border-slate-300 focus:border-brand-500 outline-none w-full"
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    placeholder="Year (e.g. 2020-2024)"
                                                    value={edu.year}
                                                    onChange={(e) => updateEducation(i, 'year', e.target.value)}
                                                    className="text-xs bg-transparent border-b border-slate-300 focus:border-brand-500 outline-none w-1/2"
                                                />
                                                <input
                                                    placeholder="Score (e.g. 90%)"
                                                    value={edu.score}
                                                    onChange={(e) => updateEducation(i, 'score', e.target.value)}
                                                    className="text-xs bg-transparent border-b border-slate-300 focus:border-brand-500 outline-none w-1/2"
                                                />
                                            </div>
                                            <button onClick={() => removeEducation(i)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-1">
                                                <Trash2 className="w-3 h-3" /> Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <h4 className="font-bold text-slate-800">{edu.degree}</h4>
                                            <p className="text-slate-600 text-sm">{edu.school}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {edu.year}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Award className="w-3 h-3" />
                                                    {edu.score}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Certifications - Bullet Points */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 text-lg">Certifications</h3>
                            {isEditing && (
                                <button onClick={addCertification} className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1">
                                    <Plus className="w-4 h-4" /> Add
                                </button>
                            )}
                        </div>

                        <ul className="list-disc list-inside space-y-2">
                            {profileData.certifications.map((cert, i) => (
                                <li key={i} className="text-sm text-slate-700">
                                    {isEditing ? (
                                        <div className="inline-flex flex-col gap-1 align-top ml-2 w-full max-w-md bg-slate-50 p-2 rounded border border-slate-200">
                                            <input
                                                placeholder="Certification Title"
                                                value={cert.title}
                                                onChange={(e) => updateCertification(i, 'title', e.target.value)}
                                                className="font-medium bg-transparent border-b border-slate-300 outline-none"
                                            />
                                            <input
                                                placeholder="Year / Issuer"
                                                value={cert.issuer}
                                                onChange={(e) => updateCertification(i, 'issuer', e.target.value)}
                                                className="text-xs text-slate-500 bg-transparent border-b border-slate-300 outline-none"
                                            />
                                            <button onClick={() => removeCertification(i)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mt-1 w-fit">
                                                <Trash2 className="w-3 h-3" /> Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <span>
                                            <span className="font-medium">{cert.title}</span>
                                            <span className="text-slate-500"> - {cert.issuer}</span>
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                        {!isEditing && profileData.certifications.length === 0 && (
                            <p className="text-slate-500 text-sm italic">No certifications added.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
