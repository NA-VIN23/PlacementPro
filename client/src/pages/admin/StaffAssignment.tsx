import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Users, CheckCircle, Edit2 } from 'lucide-react';
import { adminService } from '../../services/api';

export const StaffAssignment: React.FC = () => {
    const [staffList, setStaffList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [selectedStaff, setSelectedStaff] = useState('');
    const [startRegNo, setStartRegNo] = useState('');
    const [endRegNo, setEndRegNo] = useState('');
    const [additionalRegNos, setAdditionalRegNos] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const data = await adminService.getStaffList();
                setStaffList(data);
            } catch (error) {
                console.error("Failed to fetch staff", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStaff) return alert("Please select a staff member");

        setSubmitting(true);
        try {
            await adminService.assignClassAdvisor({
                staffId: selectedStaff,
                // Passing these as Range Assignment now
                batch: 'RANGE',
                section: 'RANGE',
                department: 'RANGE',
                startRegNo,
                endRegNo,
                additionalRegNos
            } as any);
            alert("Staff Assigned to Student Range successfully!");
            // Refresh list
            const data = await adminService.getStaffList();
            setStaffList(data);
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to assign advisor");
        } finally {
            setSubmitting(false);
            // Refresh list
            const data = await adminService.getStaffList();
            setStaffList(data);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader
                title="Staff Assignment"
                description="Assign staff members to students based on Registration Number Range."
            />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Form */}
                <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 max-w-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Staff Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Select Staff Member</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <select
                                    value={selectedStaff}
                                    onChange={(e) => setSelectedStaff(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50 font-medium"
                                    required
                                >
                                    <option value="">-- Choose Staff --</option>
                                    {loading ? (
                                        <option disabled>Loading...</option>
                                    ) : (
                                        staffList.map(staff => (
                                            <option key={staff.id} value={staff.id}>
                                                {staff.name} ({staff.email})
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Start RegNo */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Start Register No.</label>
                                <input
                                    type="text"
                                    value={startRegNo}
                                    onChange={(e) => setStartRegNo(e.target.value)}
                                    placeholder="e.g. 8115U23IT001"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50 font-medium"
                                />
                            </div>

                            {/* End RegNo */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">End Register No.</label>
                                <input
                                    type="text"
                                    value={endRegNo}
                                    onChange={(e) => setEndRegNo(e.target.value)}
                                    placeholder="e.g. 8115U23IT030"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50 font-medium"
                                />
                            </div>
                        </div>

                        {/* Additional Reg Nos */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Additional Reg Nos (Comma Separated)</label>
                            <textarea
                                value={additionalRegNos}
                                onChange={(e) => setAdditionalRegNos(e.target.value)}
                                placeholder="e.g. 8115U23IT301, 8115U23IT303"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50 font-medium h-24 resize-none placeholder:text-slate-300"
                            />
                            <p className="text-xs text-slate-400">Use this for lateral entries or specific students outside the main range.</p>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {submitting ? (
                                    <span>Assigning...</span>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Assign Staff Range
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>

                {/* Current Assignments List */}
                <div className="w-full lg:w-96 bg-slate-50 rounded-3xl p-6 border border-slate-200 h-fit">
                    <h3 className="font-bold text-slate-800 mb-4">Current Assignments</h3>
                    <div className="space-y-3">
                        {loading ? (
                            <p className="text-slate-500 text-sm">Loading...</p>
                        ) : (
                            staffList.filter(s => s.batch && s.batch.startsWith('RANGE:')).map(staff => {
                                // Parse: RANGE:Start:End|Extra1,Extra2
                                const mainSplit = staff.batch.split('|');
                                const rangePart = mainSplit[0];
                                const extrasPart = mainSplit[1] || '';
                                const parts = rangePart.split(':');

                                return (
                                    <div key={staff.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative group hover:border-blue-200 transition-all">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-bold text-slate-800">{staff.name}</div>
                                                <div className="text-xs text-slate-500 mb-2">{staff.department}</div>
                                                <div className="flex flex-col gap-2">
                                                    {(parts[1] && parts[2]) && (
                                                        <div className="flex items-center gap-2 text-xs font-mono bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg w-fit">
                                                            <span>{parts[1]}</span>
                                                            <span>→</span>
                                                            <span>{parts[2]}</span>
                                                        </div>
                                                    )}
                                                    {extrasPart && (
                                                        <div className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded w-fit break-all">
                                                            + {extrasPart.split(',').length} Others: {extrasPart.substring(0, 20)}{extrasPart.length > 20 ? '...' : ''}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedStaff(staff.id);
                                                    setStartRegNo(parts[1] || '');
                                                    setEndRegNo(parts[2] || '');
                                                    setAdditionalRegNos(extrasPart || '');
                                                    // Scroll to top or just focus
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="p-2 bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                title="Edit Assignment"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        {staffList.filter(s => s.batch && s.batch.startsWith('RANGE:')).length === 0 && (
                            <p className="text-sm text-slate-400">No active range assignments.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
