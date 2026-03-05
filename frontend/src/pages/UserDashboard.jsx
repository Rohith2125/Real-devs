import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import { getChallenges, enrollInChallenge, syncUser, getEnrolledChallenges } from "../services/api";
import SubmissionModal from "../components/SubmissionModal";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  useEffect(() => {
    // 1️⃣ Listen for auth state changes (crucial for OAuth redirects)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUserId(session.user.id);
        init(session.user);
      } else if (event === 'SIGNED_OUT') {
        navigate("/select-role");
      }
    });

    // 2️⃣ Initial check
    checkCurrentSession();

    return () => subscription.unsubscribe();
  }, []);

  const checkCurrentSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUserId(session.user.id);
      init(session.user);
    } else {
      // Small delay to allow Supabase to process URL hash if present
      setTimeout(async () => {
        const { data: { session: retrySession } } = await supabase.auth.getSession();
        if (retrySession) {
          setUserId(retrySession.user.id);
          init(retrySession.user);
        } else {
          // Only redirect if absolutely no session found after retry
          if (!window.location.hash.includes('access_token')) {
            navigate("/select-role");
          }
        }
      }, 500);
    }
  };

  const init = async (user) => {
    // 🔥 Sync user into backend
    try {
      await syncUser(user);
    } catch (err) {
      console.error("User sync failed:", err);
    }

    await Promise.all([
      fetchChallenges(),
      fetchEnrolled(user.id)
    ]);
    setLoading(false);
  };

  const fetchChallenges = async () => {
    try {
      const data = await getChallenges();
      setChallenges(data);
    } catch (err) {
      console.error("Failed to fetch challenges:", err);
    }
  };

  const fetchEnrolled = async (uid) => {
    try {
      const enrolledData = await getEnrolledChallenges(uid);
      const ids = new Set((enrolledData.enrolled_challenges || []).map(c => c.id));
      setEnrolledIds(ids);
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
    }
  };

  const handleEnroll = async (challengeId) => {
    if (enrolledIds.has(challengeId)) return;

    try {
      await enrollInChallenge(userId, challengeId);
      setEnrolledIds(prev => new Set([...prev, challengeId]));
      alert("Enrolled successfully!");
    } catch (err) {
      console.error(err);
      alert("Error enrolling in challenge");
    }
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
      <nav className="flex justify-between items-center mb-20 max-w-7xl mx-auto">
        <h1 className="text-2xl font-black tracking-tighter">BUILDER PORTAL</h1>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/my-challenges")}
            className="text-sm font-bold opacity-70 hover:opacity-100 transition-all uppercase tracking-widest"
          >
            MY MISSIONS
          </button>
          <button
            onClick={() => navigate("/global-leaderboard")}
            className="text-sm font-bold opacity-70 hover:opacity-100 transition-all uppercase tracking-widest"
          >
            GLOBAL ARENA
          </button>
          <button
            onClick={handleLogout}
            className="text-sm font-bold border border-white/20 hover:border-white/50 px-6 py-2.5 rounded-full transition-all uppercase tracking-widest"
          >
            LOGOUT
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-5xl font-bold mb-4 italic">Available<br /><span className="text-gray-500 not-italic">Challenges</span></h2>
          <p className="text-gray-500 font-medium max-w-lg">
            Build MVPs, get scored by AI, and land roles at the world's most innovative companies.
            Select a challenge to begin your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {challenges.length > 0 ? challenges.map((challenge) => {
            const isEnrolled = enrolledIds.has(challenge.id);
            const isAfterDeadline = new Date() > new Date(challenge.deadline);

            return (
              <div
                key={challenge.id}
                className="group bg-[#0A0A0A] border border-white/5 p-8 rounded-3xl hover:border-white/20 transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] cursor-pointer"
                onClick={() => navigate(`/challenge/${challenge.id}`)}
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className={`px-3 py-1 border rounded-full text-[10px] font-black uppercase tracking-widest ${isAfterDeadline ? 'bg-red-500/10 border-red-500/20 text-red-500' : isEnrolled ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                      {isAfterDeadline ? 'CLOSED' : isEnrolled ? 'ENROLLED' : 'LIVE CHALLENGE'}
                    </div>
                    <div className="text-2xl font-bold text-white">${challenge.prize_pool}</div>
                  </div>

                  <h3 className="text-2xl font-bold mb-1 group-hover:underline underline-offset-4 tracking-tight">
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

                  {isAfterDeadline ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/challenge/${challenge.id}/leaderboard`);
                      }}
                      className="w-full bg-white text-black py-4 rounded-2xl font-black text-lg hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
                    >
                      VIEW LEADERBOARD 🏆
                    </button>
                  ) : isEnrolled ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChallenge(challenge);
                      }}
                      className="w-full bg-white text-black py-4 rounded-2xl font-black text-lg hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
                    >
                      SUBMIT MVP
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnroll(challenge.id);
                      }}
                      className="w-full bg-white text-black py-4 rounded-2xl font-black text-lg hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
                    >
                      ENROLL NOW
                    </button>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-32 text-center text-gray-500 italic border-2 border-dashed border-white/5 rounded-3xl font-bold">
              No active challenges in the arena right now. Check back soon.
            </div>
          )}
        </div>
      </div>

      {selectedChallenge && (
        <SubmissionModal
          challenge={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          userId={userId}
        />
      )}
    </div>
  );
};

export default UserDashboard;