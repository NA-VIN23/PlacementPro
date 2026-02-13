import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronLeft,
    GraduationCap,
    BarChart3,
    Code2,
    ClipboardList
} from 'lucide-react';

// KaarTech eligibility data
const ELIGIBILITY_DATA: Record<string, {
    company: string;
    academic: { degrees: string[]; branches: string[] };
    marks: { requirement: string; arrears: string };
    skills: string[];
    selectionProcess: string[];
}> = {
    d1: {
        company: 'Kaar Technologies (KaarTech)',
        academic: {
            degrees: ['BE / BTech', 'ME / MTech', 'MCA', 'BSc (IT or Computer Science)'],
            branches: [
                'Computer Science Engineering',
                'Information Technology',
                'Electronics and Communication Engineering',
                'Electrical and Electronics Engineering (sometimes)'
            ]
        },
        marks: {
            requirement: '80% or above in 10th, 12th, and UG',
            arrears: 'No active arrears (backlogs). Some drives allow one or two history of arrears, but not always.'
        },
        skills: [
            'Basic programming knowledge (C, Java, or Python)',
            'Database basics (SQL)',
            'Good communication skills',
            'Understanding of software development concepts',
            'Interest in ERP / SAP technologies'
        ],
        selectionProcess: [
            'Aptitude test',
            'Technical test or coding round',
            'Technical interview',
            'HR interview'
        ]
    }
};

export const EligibilityDetail: React.FC = () => {
    const navigate = useNavigate();
    const { driveId } = useParams();
    const data = ELIGIBILITY_DATA[driveId || ''];

    if (!data) return <div className="p-8 text-red-500">Eligibility info not found.</div>;

    return (
        <div className="animate-fade-in max-w-4xl mx-auto pb-12">
            {/* Back Button */}
            <div className="flex items-center gap-3 mb-8">
                <button
                    onClick={() => navigate('/student/placement-insights/radar')}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-all hover:text-blue-600"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Eligibility Criteria</h1>
                    <p className="text-slate-500 text-sm">{data.company}</p>
                </div>
            </div>

            <div className="space-y-6">

                {/* Academic Eligibility */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        Academic Eligibility
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-600 mb-2">Eligible Degrees</p>
                            <div className="flex flex-wrap gap-2">
                                {data.academic.degrees.map((d) => (
                                    <span key={d} className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium rounded-lg">
                                        {d}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-600 mb-2">Branches Allowed</p>
                            <div className="flex flex-wrap gap-2">
                                {data.academic.branches.map((b) => (
                                    <span key={b} className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-medium rounded-lg">
                                        {b}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Marks Requirement */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                        Marks Requirement
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-slate-700 font-medium">{data.marks.requirement}</p>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                            <p className="text-sm text-slate-700 font-medium">{data.marks.arrears}</p>
                        </div>
                    </div>
                </div>

                {/* Skills Requirement */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-purple-600" />
                        Skills Requirement
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {data.skills.map((skill) => (
                            <div key={skill} className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                                <p className="text-sm text-slate-700 font-medium">{skill}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selection Process */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-orange-600" />
                        Selection Process
                    </h3>
                    <div className="flex items-start gap-0 overflow-x-auto pb-2">
                        {data.selectionProcess.map((step, idx) => (
                            <div key={step} className="flex items-start flex-shrink-0">
                                <div className="flex flex-col items-center text-center min-w-[140px] px-2">
                                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold text-sm flex items-center justify-center shadow-md">
                                        {idx + 1}
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm mt-3">{step}</h4>
                                </div>
                                {idx < data.selectionProcess.length - 1 && (
                                    <div className="flex items-center mt-3 flex-shrink-0">
                                        <div className="w-8 h-0.5 bg-orange-200"></div>
                                        <div className="w-2 h-2 border-t-2 border-r-2 border-orange-300 transform rotate-45 -ml-1.5"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
