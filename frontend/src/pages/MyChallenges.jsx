import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { getEnrolledChallenges } from "../services/api";
import SubmissionModal from "../components/SubmissionModal";

const MyChallenges = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      navigate("/select-role");
      return;
    }

    setUserId(data.user.id);
    fetchEnrolled(data.user.id);
  };

  const fetchEnrolled = async (uid) => {
    try {
      const data = await getEnrolledChallenges(uid);
      // The backend returns { enrolled_challenges: [...] }
      setChallenges(data.enrolled_challenges || []);
    } catch (err) {
      console.error("Error fetching enrolled challenges:", err);
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
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full font-bold uppercase tracking-wider text-xs">Loading Arena...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Navbar */}
      <nav className="flex justify-between items-center mb-16 max-w-7xl mx-auto">
        <h1 className="text-2xl font-black tracking-tighter">BUILDER PORTAL</h1>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm font-bold opacity-70 hover:opacity-100 transition-all uppercase tracking-widest"
          >
            THE ARENA
          </button>
          <button
            onClick={() => navigate("/global-leaderboard")}
            className="text-sm font-bold opacity-70 hover:opacity-100 transition-all uppercase tracking-widest"
          >
            GLOBAL ARENA
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
          <h2 className="text-5xl font-bold mb-4 italic">My Arena<br /><span className="text-gray-500 not-italic">Enrollments</span></h2>
          <p className="text-gray-500 font-medium max-w-lg">
            Build your MVPs before the clock runs out. Once the deadline passes, your submission will be scored by the AI.
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
                  <div className={`px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest ${isAfterDeadline(challenge.deadline) ? 'bg-red-500/10 border-red-500/20 text-red-500' : challenge.has_submitted ? 'bg-purple-500/10 border-purple-500/20 text-purple-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                    {isAfterDeadline(challenge.deadline) ? 'CLOSED' : challenge.has_submitted ? 'MVP SUBMITTED' : 'ENROLLED'}
                  </div>
                  <div className="text-2xl font-bold text-white">${challenge.prize_pool}</div>
                </div>

                <h3 className="text-2xl font-bold mb-3 tracking-tight">
                  {challenge.title}
                </h3>

                <p className="text-gray-500 text-sm mb-8 leading-relaxed line-clamp-2 italic">
                  "{challenge.problem_statement}"
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest border-t border-white/5 pt-6 group-hover:border-white/20 transition-all">
                  <span>Deadline</span>
                  <span className="text-gray-300 font-black">{new Date(challenge.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>

                {challenge.has_submitted && !isAfterDeadline(challenge.deadline) ? (
                  <div className="text-center py-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">MVP SUBMITTED</p>
                    <p className="text-[10px] text-gray-500 italic uppercase">Result will be announced after deadline</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedChallenge(challenge)}
                    disabled={isAfterDeadline(challenge.deadline)}
                    className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-xl ${isAfterDeadline(challenge.deadline) ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5' : 'bg-white text-black hover:bg-gray-200 active:scale-95 shadow-white/5'}`}
                  >
                    {isAfterDeadline(challenge.deadline) ? 'SUBMISSION CLOSED' : 'SUBMIT MVP'}
                  </button>
                )}

                {isAfterDeadline(challenge.deadline) && (
                  <button
                    onClick={() => navigate(`/challenge/${challenge.id}/leaderboard`)}
                    className="text-[10px] font-bold text-center text-gray-400 hover:text-white transition-colors uppercase tracking-[0.2em]"
                  >
                    View Results
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="col-span-full py-32 text-center text-gray-500 italic border-2 border-dashed border-white/5 rounded-3xl font-bold">
              You haven't enrolled in any challenges yet.
              <br />
              <button
                onClick={() => navigate("/dashboard")}
                className="mt-6 text-white not-italic underline underline-offset-4 hover:text-gray-300"
              >
                Find a challenge to start building
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedChallenge && (
        <SubmissionModal
          challenge={selectedChallenge}
          onClose={() => {
            setSelectedChallenge(null);
            fetchEnrolled(userId);
          }}
          userId={userId}
        />
      )}
    </div>
  );
};

export default MyChallenges;