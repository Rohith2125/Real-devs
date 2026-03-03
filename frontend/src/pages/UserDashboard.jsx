import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import { getChallenges, enrollInChallenge, syncUser } from "../services/api";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      navigate("/select-role");
      return;
    }

    const user = data.user;

    // 🔥 Sync user into backend (role="user" for Builders)
    await syncUser(user);

    setUserId(user.id);
    fetchChallenges();
    setLoading(false);
  };

  const fetchChallenges = async () => {
    const data = await getChallenges();
    setChallenges(data);
  };

  const handleEnroll = async (challengeId) => {
    try {
      await enrollInChallenge(userId, challengeId);
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
            MY CHALLENGES
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
          <h2 className="text-5xl font-bold mb-4">Available Challenges</h2>
          <p className="text-gray-500 font-medium max-w-lg">
            Build MVPs, get scored by AI, and land roles at the world's most innovative companies.
            Click a challenge to see details and start building.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {challenges.length > 0 ? challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="group bg-[#0A0A0A] border border-white/5 p-8 rounded-3xl hover:border-white/20 transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] cursor-pointer"
              onClick={() => navigate(`/challenge/${challenge.id}`)}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400">
                    LIVE CHALLENGE
                  </div>
                  <div className="text-2xl font-bold text-white">${challenge.prize_pool}</div>
                </div>

                <h3 className="text-2xl font-bold mb-3 group-hover:underline underline-offset-4 tracking-tight">
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

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEnroll(challenge.id);
                  }}
                  className="w-full bg-white text-black py-4 rounded-2xl font-black text-lg hover:bg-gray-200 transition-all shadow-xl shadow-white/5"
                >
                  ENROLL NOW
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-32 text-center text-gray-500 italic border-2 border-dashed border-white/5 rounded-3xl font-bold">
              No active challenges in the arena right now. Check back soon.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;