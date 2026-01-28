import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Search, Clock, HelpCircle, BarChart, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useData } from '../../context/DataContext';

export const StudentAssessment: React.FC = () => {
    const navigate = useNavigate();
    const { assessments } = useData();
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAssessments = assessments.filter(a => {
        const matchesCategory = filter === 'All' ? true : a.category === filter;
        const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader
                title="Assessment Center"
                description="Take technical and aptitude tests to evaluate your readiness."
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/20 rounded-xl">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold bg-black/20 px-2 py-1 rounded-lg">All Time</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold mb-1">12</h3>
                        <p className="text-indigo-100 font-medium">Completed Tests</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <BarChart className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+5%</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-800 mb-1">78%</h3>
                        <p className="text-slate-500 font-medium">Average Score</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">Urgent</span>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-slate-800 mb-1">{assessments.filter(a => a.status === 'Pending').length}</h3>
                        <p className="text-slate-500 font-medium">Pending Assessments</p>
                    </div>
                </div>
            </div>

            {/* Assessment List */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        {['All', 'Technical', 'Aptitude'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                    filter === cat ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search assessments..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAssessments.map((assessment) => (
                        <div key={assessment.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold",
                                        assessment.category === 'Technical' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                                    )}>
                                        {assessment.category}
                                    </span>
                                    {assessment.status === 'Pending' && (
                                        <span className="flex h-3 w-3 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                    {assessment.title}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {assessment.duration} mins
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <HelpCircle className="w-4 h-4" />
                                        {assessment.questions} Qs
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/student/assessment/${assessment.id}`)}
                                    className="w-full py-3 rounded-xl border-2 border-slate-100 font-bold text-slate-600 group-hover:border-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    Start Assessment
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
