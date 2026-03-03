import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLeaderboard } from "../services/api";

const ChallengeLeaderboard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, [id]);

    const fetchLeaderboard = async () => {
        try {
            const data = await getLeaderboard(id);
            setLeaderboard(data.submissions || []);
        } catch (err) {
            console.error(err);
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
                <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-white/5">
                    <table className="w-full text-left">
                        <thead className="border-b border-white/5 bg-white/5">
                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                <th className="px-10 py-6">Rank</th>
                                <th className="px-10 py-6">Builder</th>
                                <th className="px-10 py-6">Score</th>
                                <th className="px-10 py-6">Artifacts</th>
                                <th className="px-10 py-6 text-right">Submitted At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.length > 0 ? leaderboard.map((entry, idx) => (
                                <tr key={entry.submission_id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-10 py-8 font-black text-2xl group-hover:text-blue-500 transition-colors">
                                        #{idx + 1}
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="text-xl font-bold tracking-tight">{entry.github_handle}</div>
                                        <div className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">AI BUILDER</div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="text-2xl font-black text-green-500">{entry.overall_score || '--'}</div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">OVERALL RATING</div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex gap-4">
                                            {entry.repo_url && (
                                                <a href={entry.repo_url} target="_blank" className="text-xs font-bold border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/30 transition-all uppercase tracking-widest">Code</a>
                                            )}
                                            {entry.demo_video_url && (
                                                <a href={entry.demo_video_url} target="_blank" className="text-xs font-bold border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/30 transition-all uppercase tracking-widest">Demo</a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right text-sm text-gray-500 font-bold uppercase tracking-widest">
                                        {new Date(entry.submitted_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-gray-500 italic font-bold">
                                        No submissions recorded for this challenge.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ChallengeLeaderboard;
