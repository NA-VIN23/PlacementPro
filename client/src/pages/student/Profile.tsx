import React, { useState } from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, Download, Edit2, Calendar, Award, X, Save, User, Building, BookOpen, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

interface ProfileData {
    name: string;
    email: string;
    phone: string;
    location: string;
    bio: string;
    department: string;
    batch: string;
    rollNumber: string;
    linkedin: string;
    github: string;
    skills: string[];
}

export const StudentProfile: React.FC = () => {
    const { user } = useAuth();

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Profile Data State
    const [profileData, setProfileData] = useState<ProfileData>({
        name: user?.name || 'Rahul Kumar',
        email: user?.email || 'rahul@college.edu',
        phone: '+91 98765 43210',
        location: 'Mumbai, India',
        bio: 'Aspiring Software Engineer with a strong foundation in Java and Web Technologies. Passionate about solving complex problems and building user-centric applications. Currently looking for Full Stack Developer roles.',
        department: 'Computer Science Engineering',
        batch: '2024',
        rollNumber: (user as any)?.rollNumber || 'CS2024001',
        linkedin: 'linkedin.com/in/rahulkumar',
        github: 'github.com/rahulkumar',
        skills: ['Java', 'Python', 'React', 'SQL', 'Data Structures', 'Communication', 'Problem Solving']
    });

    const [newSkill, setNewSkill] = useState('');

    // Handle Input Change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    // Add Skill
    const addSkill = () => {
        if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
            setProfileData({ ...profileData, skills: [...profileData.skills, newSkill.trim()] });
            setNewSkill('');
        }
    };

    // Remove Skill
    const removeSkill = (skill: string) => {
        setProfileData({ ...profileData, skills: profileData.skills.filter(s => s !== skill) });
    };

    // Save Profile
    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            setIsEditing(false);
            alert('Profile updated successfully!');
        }, 1000);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Profile Header */}
            <div className="relative group">
                <div className="h-48 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=2929&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                </div>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/20 flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Edit Cover
                    </button>
                </div>

                <div className="relative px-8 pb-4 flex flex-col md:flex-row items-end -mt-12 gap-6">
                    <div className="w-32 h-32 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden relative group/avatar">
                        <img
                            src={`https://ui-avatars.com/api/?name=${profileData.name}&background=0D8ABC&color=fff&size=128`}
                            alt={profileData.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    <div className="flex-1 text-slate-900 pb-2">
                        {isEditing ? (
                            <input
                                type="text"
                                name="name"
                                value={profileData.name}
                                onChange={handleChange}
                                className="text-3xl font-bold bg-white border border-slate-200 rounded-lg px-3 py-1 w-full max-w-md"
                            />
                        ) : (
                            <h1 className="text-3xl font-bold">{profileData.name}</h1>
                        )}
                        <p className="text-slate-500 font-medium">{profileData.department} • Class of {profileData.batch}</p>
                    </div>

                    <div className="flex gap-3 pb-2">
                        <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Resume
                        </button>
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
                    {/* Contact Info */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <h3 className="font-bold text-slate-800 text-lg">Contact Information</h3>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-600">
                                <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={profileData.email}
                                        onChange={handleChange}
                                        className="flex-1 text-sm px-3 py-1.5 border border-slate-200 rounded-lg"
                                    />
                                ) : (
                                    <span className="text-sm">{profileData.email}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={handleChange}
                                        className="flex-1 text-sm px-3 py-1.5 border border-slate-200 rounded-lg"
                                    />
                                ) : (
                                    <span className="text-sm">{profileData.phone}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="location"
                                        value={profileData.location}
                                        onChange={handleChange}
                                        className="flex-1 text-sm px-3 py-1.5 border border-slate-200 rounded-lg"
                                    />
                                ) : (
                                    <span className="text-sm">{profileData.location}</span>
                                )}
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
                                    <a href={`https://${profileData.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                    <a href={`https://${profileData.github}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 transition-colors">
                                        <Github className="w-5 h-5" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Academic Info */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
                        <h3 className="font-bold text-slate-800 text-lg">Academic Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-slate-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400 font-medium">Department</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="department"
                                            value={profileData.department}
                                            onChange={handleChange}
                                            className="w-full text-sm px-3 py-1.5 border border-slate-200 rounded-lg mt-1"
                                        />
                                    ) : (
                                        <p className="text-sm text-slate-700 font-medium">{profileData.department}</p>
                                    )}
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
                                    {isEditing ? (
                                        <select
                                            name="batch"
                                            value={profileData.batch}
                                            onChange={(e) => setProfileData({ ...profileData, batch: e.target.value })}
                                            className="w-full text-sm px-3 py-1.5 border border-slate-200 rounded-lg mt-1 bg-white"
                                        >
                                            <option>2023</option>
                                            <option>2024</option>
                                            <option>2025</option>
                                            <option>2026</option>
                                        </select>
                                    ) : (
                                        <p className="text-sm text-slate-700 font-medium">Class of {profileData.batch}</p>
                                    )}
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
                                {profileData.bio}
                            </p>
                        )}
                    </div>

                    {/* Education */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 text-lg mb-6">Education</h3>
                        <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                            {[
                                { degree: "B.Tech in Computer Science", school: "Institute of Technology", year: "2020 - 2024", score: "CGPA: 8.5/10" },
                                { degree: "Higher Secondary (12th)", school: "City Public School", year: "2018 - 2020", score: "92%" },
                            ].map((edu, i) => (
                                <div key={i} className="relative pl-8">
                                    <div className="absolute left-0 top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white bg-brand-500 shadow-sm"></div>
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
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Certifications */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 text-lg mb-4">Certifications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800 text-sm">AWS Certified Cloud Practitioner</h5>
                                    <p className="text-xs text-slate-500 mt-1">Amazon Web Services • Issued Dec 2023</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 flex items-start gap-4">
                                <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center shrink-0">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <h5 className="font-bold text-slate-800 text-sm">Java Programming Masterclass</h5>
                                    <p className="text-xs text-slate-500 mt-1">Udemy • Issued Aug 2023</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
