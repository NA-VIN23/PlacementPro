import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Briefcase,
    TrendingUp,
    FileText,
    CheckCircle,
    XCircle,
    MessageSquare,
    AlertTriangle
} from 'lucide-react';
import { placementInsightsService } from '../../../services/placementInsightsService';

export const CompanyDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'topics' | 'strategy' | 'insights'>('topics');

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            try {
                const data = await placementInsightsService.getCompanyDetail(id);
                setCompany(data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, [id]);

    if (loading) return <div className="p-8">Loading...</div>;
    if (!company) return <div className="p-8">Company not found.</div>;

    return (
        <div className="animate-fade-in max-w-5xl mx-auto pb-12">
            <button
                onClick={() => navigate('/student/placement-insights/history')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to History
            </button>

            {/* Header */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <img src={company.logo} alt={company.name} className="w-20 h-20 rounded-2xl shadow-md bg-white p-1" />
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-slate-900">{company.name}</h1>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded-full">{company.type}</span>
                        </div>
                        <p className="text-slate-500 mt-2 max-w-2xl">{company.description}</p>

                        <div className="flex flex-wrap gap-6 mt-6">
                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                <Briefcase className="w-4 h-4 text-purple-600" />
                                {company.roles.join(', ')}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                <TrendingUp className="w-4 h-4 text-green-600" />
                                {company.avgPackage} Avg Package
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                {company.visitFrequency} Visit Priority
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Recruitment Pattern - Horizontal */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Recruitment Pattern
                    </h3>
                    <div className="flex items-start gap-0 overflow-x-auto pb-2">
                        {company.recruitmentPattern && company.recruitmentPattern.map((step: any, idx: number) => (
                            <div key={idx} className="flex items-start flex-shrink-0">
                                <div className="flex flex-col items-center text-center min-w-[140px] px-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                                        {idx + 1}
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm mt-3">{step.stage}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{step.type} • {step.duration}</p>
                                    <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold ${step.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                        step.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {step.difficulty}
                                    </span>
                                </div>
                                {idx < company.recruitmentPattern.length - 1 && (
                                    <div className="flex items-center mt-3 flex-shrink-0">
                                        <div className="w-8 h-0.5 bg-blue-200"></div>
                                        <div className="w-2 h-2 border-t-2 border-r-2 border-blue-300 transform rotate-45 -ml-1.5"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Prep Vault: Topics / Strategy / Insights */}
                <div>
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[250px] flex flex-col">
                        <div className="flex border-b border-slate-100">
                            {(['topics', 'strategy', 'insights'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wide transition-colors ${activeTab === tab ? 'bg-slate-50 text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="p-8 flex-1 bg-slate-50/50">
                            {activeTab === 'topics' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                                        <h4 className="font-bold text-green-800 flex items-center gap-2 mb-3">
                                            <CheckCircle className="w-5 h-5" /> Must Focus Topics
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {company.focusTopics.map((t: string) => (
                                                <span key={t} className="px-3 py-1.5 bg-white border border-green-200 text-green-700 text-sm font-medium rounded-lg shadow-sm">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                                        <h4 className="font-bold text-red-800 flex items-center gap-2 mb-3">
                                            <XCircle className="w-5 h-5" /> Avoid / Low Priority
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {company.avoidTopics.map((t: string) => (
                                                <span key={t} className="px-3 py-1.5 bg-white border border-red-200 text-red-700 text-sm font-medium rounded-lg shadow-sm">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            )}

                            {activeTab === 'strategy' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                        <h4 className="font-bold text-slate-900 mb-4 text-lg">Ideal Prep Strategy</h4>
                                        <ul className="space-y-4">
                                            <li className="flex gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center">1</span>
                                                <p className="text-slate-600 text-sm leading-relaxed">Focus on <b>{company.focusTopics[0]}</b> as it is asked in 90% of interviews.</p>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center">2</span>
                                                <p className="text-slate-600 text-sm leading-relaxed">Practice <b>{company.recruitmentPattern[0].type}</b> daily for at least 1 week before the drive.</p>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center">3</span>
                                                <p className="text-slate-600 text-sm leading-relaxed">Mock Interviews specifically for {company.roles[0]} role are highly recommended.</p>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 flex gap-4">
                                        <AlertTriangle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                        <div>
                                            <h5 className="font-bold text-blue-900 text-sm mb-1">Pro Tip</h5>
                                            <p className="text-blue-800 text-xs leading-relaxed">
                                                This company values {company.type === 'Startup' ? 'problem solving and agility' : 'consistency and fundamentals'}. Tailor your resume accordingly.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'insights' && (
                                <div className="space-y-6 animate-fade-in">
                                    <h4 className="font-bold text-slate-900 mb-2">Student Experiences</h4>
                                    <div className="grid gap-4">
                                        {company.insights.map((insight: string, i: number) => (
                                            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative">
                                                <MessageSquare className="w-6 h-6 text-slate-200 absolute top-4 right-4" />
                                                <p className="text-slate-600 text-sm italic font-medium">"{insight}"</p>
                                                <div className="mt-4 flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                                                    <span className="text-xs font-bold text-slate-400">Placed Student, 2024</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
