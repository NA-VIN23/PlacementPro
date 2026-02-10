import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Briefcase,
    Calendar,
    Users,
    ArrowRight,
    ChevronLeft
} from 'lucide-react';
import { placementInsightsService } from '../../../services/placementInsightsService';

export const CompanyHistory: React.FC = () => {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const data = await placementInsightsService.getCompanies();
                setCompanies(data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                <button
                    onClick={() => navigate('/student/placement-insights')}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-all hover:text-blue-600"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Company Directory</h1>
                    <p className="text-slate-500 text-sm">Explore past recruitment history and preparation strategies.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
                {/* Filters Sidebar (Fixed Width) */}
                <div className="w-full lg:w-72 bg-white rounded-2xl border border-slate-200 p-6 flex-shrink-0 lg:h-full overflow-y-auto">
                    <div className="flex items-center gap-2 mb-6">
                        <Filter className="w-5 h-5 text-blue-600" />
                        <h2 className="font-bold text-slate-900">Filters</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Search</label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Company name..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Company Type</label>
                            <div className="space-y-2">
                                {['Product', 'Service', 'Startup', 'MNC'].map(type => (
                                    <label key={type} className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
                                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                        {type}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Roles</label>
                            <div className="space-y-2">
                                {['SDE', 'Data Analyst', 'Frontend', 'Backend'].map(role => (
                                    <label key={role} className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer hover:text-slate-900">
                                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                        {role}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Cards Grid */}
                <div className="flex-1 overflow-y-auto pb-8 pr-2">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-slate-900">Company Directory</h1>
                        <p className="text-slate-500 text-sm">Showing {filteredCompanies.length} companies</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredCompanies.map(company => (
                            <div key={company.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all group relative overflow-hidden">
                                {/* Accents */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>

                                <div className="flex items-start justify-between mb-4 relative z-10 w-full">
                                    <div className="flex items-center gap-4">
                                        <img src={company.logo} alt={company.name} className="w-14 h-14 rounded-xl object-cover border border-slate-100 bg-white shadow-sm" />
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg leading-tight">{company.name}</h3>
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded-md tracking-wide">
                                                {company.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Last Visit</p>
                                            <p className="text-sm font-semibold text-slate-800">{Math.max(...company.yearsVisited)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                                            <Users className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Placed</p>
                                            <p className="text-sm font-semibold text-slate-800">{company.placedCount}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 col-span-2">
                                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                            <Briefcase className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">Roles</p>
                                            <p className="text-sm font-semibold text-slate-800 truncate">{company.roles.join(', ')}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/student/placement-insights/company/${company.id}`)}
                                    className="w-full py-3 bg-slate-50 text-slate-700 font-bold text-sm rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 group-hover:shadow"
                                >
                                    View History & Prep
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
