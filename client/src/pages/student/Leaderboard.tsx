import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Trophy, Search, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const StudentLeaderboard: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get('/leaderboard');
                const data = response.data.map((item: any) => ({
                    ...item,
                    isUser: item.id === currentUser?.id
                }));
                setLeaderboardData(data);
            } catch (err) {
                console.error('Failed to fetch leaderboard:', err);
            }
        };

        fetchLeaderboard();
    }, [currentUser]);

    const filteredLeaderboard = leaderboardData.filter(user =>
        user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const first = leaderboardData[0] || { name: '-', score: 0, avatar: '?', rank: 1, batch: '' };
    const second = leaderboardData[1] || { name: '-', score: 0, avatar: '?', rank: 2, batch: '' };
    const third = leaderboardData[2] || { name: '-', score: 0, avatar: '?', rank: 3, batch: '' };

    return (
        <div className="space-y-8 animate-fade-in">
            <PageHeader
                title="Global Leaderboard"
                description="See where you stand among your peers and compete for the top spot."
            />

            {/* Top 3 Podium */}
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 pb-8 border-b border-slate-100">
                {/* 2nd Place */}
                <div className="flex flex-col items-center order-2 md:order-1">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-slate-200 shadow-xl overflow-hidden bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500">
                            {second.avatar}
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm flex items-center gap-1">
                            <span className="text-xs">#</span>2
                        </div>
                    </div>
                    <div className="text-center mt-5">
                        <h3 className="font-bold text-slate-800">{second.name}</h3>
                        <p className="text-blue-600 font-bold text-sm">{second.score} pts</p>
                    </div>
                    <div className="h-24 w-24 bg-gradient-to-t from-slate-100 to-transparent mt-4 rounded-t-3xl"></div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center order-1 md:order-2 z-10">
                    <div className="relative">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce">
                            <Trophy className="w-10 h-10 fill-current drop-shadow-lg" />
                        </div>
                        <div className="w-28 h-28 rounded-full border-4 border-yellow-400 shadow-2xl overflow-hidden bg-yellow-50 flex items-center justify-center text-3xl font-bold text-yellow-700">
                            {first.avatar}
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-lg font-bold shadow-lg flex items-center gap-1">
                            <span className="text-sm">#</span>1
                        </div>
                    </div>
                    <div className="text-center mt-8">
                        <h3 className="font-bold text-slate-900 text-lg">{first.name}</h3>
                        <p className="text-yellow-600 font-bold text-base">{first.score} pts</p>
                    </div>
                    <div className="h-32 w-32 bg-gradient-to-t from-yellow-50 to-transparent mt-4 rounded-t-[2.5rem]"></div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center order-3 md:order-3">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-orange-200 shadow-xl overflow-hidden bg-orange-50 flex items-center justify-center text-xl font-bold text-orange-700">
                            {third.avatar}
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-bold shadow-sm flex items-center gap-1">
                            <span className="text-xs">#</span>3
                        </div>
                    </div>
                    <div className="text-center mt-5">
                        <h3 className="font-bold text-slate-800">{third.name}</h3>
                        <p className="text-blue-600 font-bold text-sm">{third.score} pts</p>
                    </div>
                    <div className="h-20 w-24 bg-gradient-to-t from-orange-50 to-transparent mt-4 rounded-t-3xl"></div>
                </div>
            </div>

            {/* List View */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-end gap-4">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search student..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm bg-slate-50 focus:bg-white transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Rank</th>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Tests</th>
                            <th className="px-6 py-4">Streak</th>
                            <th className="px-6 py-4 text-right">Score</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredLeaderboard.map((user) => (
                            <tr key={user.rank} className={cn(
                                "hover:bg-slate-50 transition-colors",
                                user.isUser ? "bg-blue-50/50 hover:bg-blue-50" : ""
                            )}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "w-6 h-6 flex items-center justify-center font-bold rounded text-xs",
                                            user.rank <= 3 ? "text-white" : "text-slate-500 bg-slate-100",
                                            user.rank === 1 ? "bg-yellow-400" :
                                                user.rank === 2 ? "bg-slate-400" :
                                                    user.rank === 3 ? "bg-orange-400" : ""
                                        )}>
                                            {user.rank}
                                        </span>
                                        {user.trend === "up" && <ArrowUp className="w-3 h-3 text-emerald-500" />}
                                        {user.trend === "down" && <ArrowDown className="w-3 h-3 text-red-500" />}
                                        {user.trend === "same" && <div className="w-3 h-1 bg-slate-300 rounded-full" />}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                            {user.avatar}
                                        </div>
                                        <div>
                                            <p className={cn("font-bold text-sm", user.isUser ? "text-blue-700" : "text-slate-700")}>
                                                {user.name} {user.isUser && "(You)"}
                                            </p>
                                            <p className="text-xs text-slate-400">Batch {user.batch}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                    {user.tests}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1 text-orange-500 text-sm font-bold">
                                        <div className="p-1 bg-orange-100 rounded">
                                            <TrendingUp className="w-3 h-3" />
                                        </div>
                                        {user.streak} days
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="font-bold text-slate-800">{user.score}</span>
                                </td>
                            </tr>
                        ))}
                        {filteredLeaderboard.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-slate-400 text-sm">
                                    No students found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
