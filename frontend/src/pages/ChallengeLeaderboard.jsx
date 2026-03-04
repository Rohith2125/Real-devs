import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLeaderboard } from "../services/api";

const ChallengeLeaderboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchLeaderboard();
    }, [id]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getLeaderboard(id);
            setLeaderboard(data.submissions || []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || "Failed to load leaderboard.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full font-bold uppercase tracking-wider text-xs">Loading Leaderboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto flex justify-between items-end mb-16">
                <div>
                    <h1 className="text-6xl font-bold tracking-tighter mb-4">CHALLENGE<br /><span className="text-gray-500 italic">RANKINGS</span></h1>
                    <p className="text-gray-400 font-medium">Top AI Builders, scored by our AI engine and the community.</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm font-bold border border-white/20 hover:border-white/50 px-8 py-3 rounded-full transition-all uppercase tracking-widest"
                >
                    BACK TO CHALLENGES
                </button>
            </div>

            <div className="max-w-7xl mx-auto">
                {error ? (
                    <div className="bg-red-500/10 border border-red-500/20 p-12 rounded-3xl text-center">
                        <div className="text-4xl mb-4">🚫</div>
                        <h2 className="text-xl font-black text-red-500 uppercase tracking-widest mb-4">ACCESS DENIED</h2>
                        <p className="text-gray-400 font-medium mb-8 max-w-md mx-auto">{error}</p>
                        <button
                            onClick={fetchLeaderboard}
                            className="bg-white text-black px-8 py-3 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-200 transition-all"
                        >
                            RETRY CHECK
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
                                    <th className="px-10 py-6">Score</th>
                                    <th className="px-10 py-6">Execution</th>
                                    <th className="px-10 py-6 text-right">Submitted At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.length > 0 ? leaderboard.map((entry, idx) => (
                                    <React.Fragment key={entry.submission_id}>
                                        <tr
                                            onClick={() => setExpandedId(expandedId === entry.submission_id ? null : entry.submission_id)}
                                            className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer ${expandedId === entry.submission_id ? 'bg-white/[0.03]' : ''}`}
                                        >
                                            <td className="px-10 py-8 font-black text-2xl">
                                                #{idx + 1}
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="text-xl font-bold tracking-tight">{entry.github_handle}</div>
                                                <div className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">AI BUILDER</div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="text-sm font-medium text-gray-300 truncate max-w-[200px]">{entry.email}</div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigator.clipboard.writeText(entry.email);
                                                        alert('Email copied to clipboard!');
                                                    }}
                                                    className="text-[9px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest mt-2"
                                                >
                                                    COPY
                                                </button>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="text-2xl font-black text-green-500">{entry.overall_score || '0.0'}</div>
                                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">OVERALL RATING</div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        className={`text-[10px] font-black px-4 py-2 rounded-xl transition-all uppercase tracking-widest border ${expandedId === entry.submission_id ? 'bg-white text-black border-white' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}
                                                    >
                                                        {expandedId === entry.submission_id ? 'CLOSE REPORT' : 'AI BREAKDOWN'}
                                                    </button>
                                                    {entry.repo_url && (
                                                        <a
                                                            href={entry.repo_url}
                                                            target="_blank"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-[10px] font-black border border-white/10 px-4 py-2 rounded-xl hover:bg-white/5 transition-all uppercase tracking-widest"
                                                        >
                                                            REPO
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right text-sm text-gray-500 font-bold uppercase tracking-widest">
                                                {new Date(entry.submitted_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                        </tr>
                                        {expandedId === entry.submission_id && (
                                            <tr className="bg-white/[0.03] animate-in slide-in-from-top-4 duration-300">
                                                <td colSpan="6" className="px-10 py-12 border-b border-white/5">
                                                    {entry.evaluation ? (
                                                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                                                            <div className="lg:col-span-3">
                                                                <div className="flex items-center gap-4 mb-6">
                                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                                                    <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em]">AI Rationale</h4>
                                                                </div>
                                                                <p className="text-gray-300 text-xl leading-relaxed italic font-medium">
                                                                    "{entry.evaluation.rationale}"
                                                                </p>
                                                            </div>
                                                            <div className="lg:col-span-2">
                                                                <div className="flex items-center gap-4 mb-6">
                                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                                    <h4 className="text-[11px] font-black text-green-500 uppercase tracking-[0.3em]">Evaluation Parameters</h4>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    {Object.entries(entry.evaluation.scores || {}).map(([key, value]) => (
                                                                        <div key={key} className="bg-black/40 border border-white/5 p-4 rounded-2xl shadow-inner">
                                                                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">{key.replace('_', ' ')}</div>
                                                                            <div className="text-2xl font-black text-white">{value}<span className="text-xs text-gray-600 font-bold ml-1">/10</span></div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-8">
                                                            <div className="text-yellow-500/50 text-4xl mb-4">⌛</div>
                                                            <div className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Detailed analysis in progress</div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="py-32 text-center text-gray-500 italic font-bold text-lg">
                                            No arena entries recorded for this mission yet.
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

export default ChallengeLeaderboard;
