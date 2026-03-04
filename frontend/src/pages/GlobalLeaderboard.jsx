import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getGlobalLeaderboard } from "../services/api";

const GlobalLeaderboard = () => {
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getGlobalLeaderboard();
            setLeaderboard(data.leaderboard || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load global arena rankings.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full font-bold uppercase tracking-wider text-xs">Scanning Arena...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto flex justify-between items-end mb-16">
                <div>
                    <h1 className="text-6xl font-black tracking-tighter mb-4">GLOBAL<br /><span className="text-gray-500 italic">INFLUENCE</span></h1>
                    <p className="text-gray-400 font-medium">The top builders across all missions in the Real Devs Arena.</p>
                </div>
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-sm font-bold border border-white/20 hover:border-white/50 px-8 py-3 rounded-full transition-all uppercase tracking-widest"
                >
                    BACK TO ARENA
                </button>
            </div>

            <div className="max-w-7xl mx-auto">
                {error ? (
                    <div className="bg-red-500/10 border border-red-500/20 p-12 rounded-3xl text-center">
                        <div className="text-4xl mb-4">🚫</div>
                        <h2 className="text-xl font-black text-red-500 uppercase tracking-widest mb-4">LINK FAILED</h2>
                        <p className="text-gray-400 font-medium mb-8 max-w-md mx-auto">{error}</p>
                        <button
                            onClick={fetchLeaderboard}
                            className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-200 transition-all"
                        >
                            RE-SYNC
                        </button>
                    </div>
                ) : (
                    <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-white/5">
                        <table className="w-full text-left border-collapse">
                            <thead className="border-b border-white/5 bg-white/5">
                                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                    <th className="px-10 py-6">Rank</th>
                                    <th className="px-10 py-6">Builder</th>
                                    <th className="px-10 py-6">Email</th>
                                    <th className="px-10 py-6">Badges Earned</th>
                                    <th className="px-10 py-6">Challenges</th>
                                    <th className="px-10 py-6 text-right">Total Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.length > 0 ? leaderboard.map((entry, idx) => (
                                    <tr
                                        key={entry.user_id}
                                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-10 py-10 font-black text-3xl">
                                            #{idx + 1}
                                        </td>
                                        <td className="px-10 py-10">
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <div className="text-xl font-bold tracking-tight">{entry.name}</div>
                                                    {entry.github_profile && (
                                                        <a
                                                            href={entry.github_profile}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] text-blue-500 font-black uppercase tracking-widest hover:underline"
                                                        >
                                                            GITHUB PROFILE
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-10">
                                            <div className="text-sm font-medium text-gray-400">{entry.email}</div>
                                        </td>
                                        <td className="px-10 py-10">
                                            <div className="flex flex-wrap gap-2">
                                                {entry.badges["GOAT Dev"] > 0 && (
                                                    <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-[9px] font-black text-yellow-500 uppercase tracking-widest">
                                                        GOAT x{entry.badges["GOAT Dev"]}
                                                    </div>
                                                )}
                                                {entry.badges["Hacker Dev"] > 0 && (
                                                    <div className="px-3 py-1 bg-gray-300/10 border border-gray-300/20 rounded-full text-[9px] font-black text-gray-300 uppercase tracking-widest">
                                                        HACKER x{entry.badges["Hacker Dev"]}
                                                    </div>
                                                )}
                                                {entry.badges["Shipper Dev"] > 0 && (
                                                    <div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-[9px] font-black text-orange-500 uppercase tracking-widest">
                                                        SHIPPER x{entry.badges["Shipper Dev"]}
                                                    </div>
                                                )}
                                                {entry.badges["Active Dev"] > 0 && (
                                                    <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-black text-blue-500 uppercase tracking-widest">
                                                        ACTIVE x{entry.badges["Active Dev"]}
                                                    </div>
                                                )}
                                                {Object.values(entry.badges).every(v => v === 0) && (
                                                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">NO BADGES YET</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-10">
                                            <div className="text-xl font-bold text-gray-300">{entry.completed_challenges}</div>
                                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">COMPLETED</div>
                                        </td>
                                        <td className="px-10 py-10 text-right">
                                            <div className="text-3xl font-black text-green-500">{entry.total_score}</div>
                                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">ARENA POINTS</div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="py-32 text-center text-gray-500 italic font-bold text-lg">
                                            The Arena is empty. Be the first to build.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GlobalLeaderboard;
