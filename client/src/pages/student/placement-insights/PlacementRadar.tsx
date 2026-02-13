import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    MapPin,
    Clock,
    CheckCircle,
    Briefcase,
    ChevronLeft
} from 'lucide-react';
import { placementInsightsService } from '../../../services/placementInsightsService';

export const PlacementRadar: React.FC = () => {
    const navigate = useNavigate();
    const [drives, setDrives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await placementInsightsService.getUpcomingDrives();
                setDrives(data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <button
                    onClick={() => navigate('/student/placement-insights')}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-all hover:text-blue-600"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Upcoming Placement Drives</h1>
                    <p className="text-slate-500 text-sm">Stay ahead of the schedule. Don't miss any opportunity.</p>
                </div>
            </div>

            <div className="space-y-6">
                {drives.map((drive: any) => (
                    <div key={drive.id} className="relative bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                        {/* Status Stripe */}
                        <div className={`absolute top-0 left-0 w-2 h-full ${drive.status === 'Upcoming' ? 'bg-green-500' : 'bg-yellow-500'
                            }`}></div>

                        <div className="p-6 pl-8 flex flex-col md:flex-row items-center gap-6">
                            {/* Company Info */}
                            <div className="flex-1 flex items-center gap-6 w-full">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-lg shadow-inner">
                                    {drive.company.substring(0, 2)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {drive.company}
                                    </h3>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        <span className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                                            <Briefcase className="w-4 h-4 text-slate-400" />
                                            {drive.role}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-sm text-slate-600 font-medium">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            {drive.type}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Eligibility & Date */}
                            <div className="flex flex-col items-end gap-1 w-full md:w-auto text-right md:text-right border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 mt-4 md:mt-0">
                                <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    {new Date(drive.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1 bg-slate-50 px-2 py-1 rounded">
                                    <Clock className="w-3 h-3" />
                                    {drive.eligibility}
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="w-full md:w-auto mt-4 md:mt-0">
                                <button onClick={() => navigate(`/student/placement-insights/eligibility/${drive.id}`)} className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 flex items-center justify-center gap-2">
                                    Check Eligibility
                                    <CheckCircle className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
