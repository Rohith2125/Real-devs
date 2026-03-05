import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { getSponsorChallenges } from "../services/api";

const SponsorChallenges = () => {
    const navigate = useNavigate();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const data = await getSponsorChallenges();
            setChallenges(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isAfterDeadline = (deadline) => {
        return new Date() > new Date(deadline);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full font-bold uppercase tracking-wider text-xs">Loading Challenges...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            {/* Navbar */}
            <nav className="flex justify-between items-center mb-16 max-w-7xl mx-auto">
                <h1 className="text-2xl font-black tracking-tighter">SPONSOR PORTAL</h1>
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate("/sponsor-dashboard")}
                        className="text-sm font-bold opacity-70 hover:opacity-100 transition-all uppercase tracking-widest"
                    >
                        CREATE NEW
                    </button>
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            navigate("/");
                        }}
                        className="text-sm font-bold border border-white/20 hover:border-white/50 px-6 py-2.5 rounded-full transition-all uppercase tracking-widest"
                    >
                        LOGOUT
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h2 className="text-5xl font-bold mb-4">My Posted Challenges</h2>
                    <p className="text-gray-500 font-medium max-w-lg">
                        Manage your challenges and view the results after each deadline passes.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {challenges.length > 0 ? challenges.map((challenge) => (
                        <div
                            key={challenge.id}
                            className="group bg-[#0A0A0A] border border-white/5 p-8 rounded-3xl hover:border-white/20 transition-all duration-300 flex flex-col justify-between hover:scale-[1.02]"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest ${isAfterDeadline(challenge.deadline) ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                                        {isAfterDeadline(challenge.deadline) ? 'CLOSED' : 'ACTIVE'}
                                    </div>
                                    <div className="text-2xl font-bold text-white">${challenge.prize_pool}</div>
                                </div>

                                <h3 className="text-2xl font-bold mb-1 tracking-tight">
                                    {challenge.title}
                                </h3>

                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                                    Sponsored by {challenge.sponsor_name || 'Anonymous'}
                                </div>

                                <p className="text-gray-500 text-sm mb-8 leading-relaxed line-clamp-2 italic">
                                    "{challenge.problem_statement}"
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest border-t border-white/5 pt-6 group-hover:border-white/20 transition-all">
                                    <span>Deadline</span>
                                    <span className="text-gray-300 font-black">{new Date(challenge.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                </div>

                                {isAfterDeadline(challenge.deadline) ? (
                                    <button
                                        onClick={() => navigate(`/challenge/${challenge.id}/leaderboard`)}
                                        className="w-full bg-white text-black py-4 rounded-2xl font-black text-lg hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
                                    >
                                        VIEW LEADERBOARD
                                    </button>
                                ) : (
                                    <div className="w-full bg-[#111] text-gray-600 py-4 rounded-2xl font-black text-lg text-center cursor-not-allowed">
                                        RESULTS PENDING
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-32 text-center text-gray-500 italic border-2 border-dashed border-white/5 rounded-3xl font-bold">
                            You haven't posted any challenges yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SponsorChallenges;
