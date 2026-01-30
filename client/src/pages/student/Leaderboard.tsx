import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Trophy, Search, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export const StudentLeaderboard: React.FC = () => {
    const [period, setPeriod] = useState('Weekly');
    const [searchTerm, setSearchTerm] = useState('');

    const leaderboardData = [
        { rank: 1, name: "Sarah Jenkins", batch: "2024", score: 2850, tests: 42, streak: 12, trend: "up", avatar: "SJ" },
        { rank: 2, name: "Michael Ross", batch: "2024", score: 2720, tests: 38, streak: 8, trend: "up", avatar: "MR" },
        { rank: 3, name: "Jessica T.", batch: "2025", score: 2680, tests: 35, streak: 15, trend: "down", avatar: "JT" },
        { rank: 4, name: "David Chen", batch: "2024", score: 2540, tests: 31, streak: 5, trend: "same", avatar: "DC" },
        { rank: 5, name: "Rahul Kumar", batch: "2024", score: 2450, tests: 30, streak: 5, trend: "up", avatar: "RK", isUser: true },
        { rank: 6, name: "Priya S.", batch: "2025", score: 2300, tests: 28, streak: 3, trend: "down", avatar: "PS" },
    ];

    const filteredLeaderboard = leaderboardData.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                            {leaderboardData[1].avatar}
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-bold shadow-sm flex items-center gap-1">
                            <span className="text-xs">#</span>2
                        </div>
                    </div>
                    <div className="text-center mt-5">
                        <h3 className="font-bold text-slate-800">{leaderboardData[1].name}</h3>
                        <p className="text-brand-600 font-bold text-sm">{leaderboardData[1].score} pts</p>
                    </div>
                    <div className="h-24 w-24 bg-gradient-to-t from-slate-100 to-transparent mt-4 rounded-t-xl"></div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center order-1 md:order-2 z-10">
                    <div className="relative">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce">
                            <Trophy className="w-10 h-10 fill-current drop-shadow-lg" />
                        </div>
                        <div className="w-28 h-28 rounded-full border-4 border-yellow-400 shadow-2xl overflow-hidden bg-yellow-50 flex items-center justify-center text-3xl font-bold text-yellow-700">
                            {leaderboardData[0].avatar}
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-lg font-bold shadow-lg flex items-center gap-1">
                            <span className="text-sm">#</span>1
                        </div>
                    </div>
                    <div className="text-center mt-8">
                        <h3 className="font-bold text-slate-900 text-lg">{leaderboardData[0].name}</h3>
                        <p className="text-yellow-600 font-bold text-base">{leaderboardData[0].score} pts</p>
                    </div>
                    <div className="h-32 w-32 bg-gradient-to-t from-yellow-50 to-transparent mt-4 rounded-t-2xl"></div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center order-3 md:order-3">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-orange-200 shadow-xl overflow-hidden bg-orange-50 flex items-center justify-center text-xl font-bold text-orange-700">
                            {leaderboardData[2].avatar}
                        </div>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-bold shadow-sm flex items-center gap-1">
                            <span className="text-xs">#</span>3
                        </div>
                    </div>
                    <div className="text-center mt-5">
                        <h3 className="font-bold text-slate-800">{leaderboardData[2].name}</h3>
                        <p className="text-brand-600 font-bold text-sm">{leaderboardData[2].score} pts</p>
                    </div>
                    <div className="h-20 w-24 bg-gradient-to-t from-orange-50 to-transparent mt-4 rounded-t-xl"></div>
                </div>
            </div>

            {/* List View */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex bg-slate-100/50 p-1 rounded-lg border border-slate-200/50">
                        {['Weekly', 'Monthly', 'All Time'].map(p => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                    period === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search student..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm bg-slate-50 focus:bg-white transition-colors"
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
                                user.isUser ? "bg-brand-50/50 hover:bg-brand-50" : ""
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
                                            <p className={cn("font-bold text-sm", user.isUser ? "text-brand-700" : "text-slate-700")}>
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
                    </tbody>
                </table>
            </div>
        </div>
    );
};
