import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { getChallenges, createChallenge, syncUser } from "../services/api";

const SponsorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getLocalDefaultDeadline = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(17, 0, 0, 0);
    const tzOffset = tomorrow.getTimezoneOffset() * 60000;
    return new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [title, setTitle] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [prizePool, setPrizePool] = useState("");
  const [deadline, setDeadline] = useState(getLocalDefaultDeadline());
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      navigate("/select-role");
      return;
    }

    try {
      // Standardized sync using the api service
      const dbUser = await syncUser(data.user, "sponsor");

      if (!dbUser.company_name) {
        navigate("/sponsor-onboarding");
        return;
      }

      setUser(data.user);
      setLoading(false);
    } catch (err) {
      console.error("Critical error during user sync:", err);
      // Fallback to onboarding if we can't sync or it's a new user
      navigate("/sponsor-onboarding");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleCreate = async () => {
    if (!title || !problemStatement || !prizePool || !deadline) {
      alert("Please fill all fields");
      return;
    }

    setIsLaunching(true);
    try {
      await createChallenge({
        title,
        problem_statement: problemStatement,
        prize_pool: parseFloat(prizePool),
        deadline: deadline,
      });

      alert("Challenge created successfully!");
      setTitle("");
      setProblemStatement("");
      setPrizePool("");
      setDeadline(getLocalDefaultDeadline());
    } catch (error) {
      console.error(error);
      alert("Error creating challenge. Ensure your profile is fully set up.");
    } finally {
      setIsLaunching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Navbar */}
      <nav className="flex justify-between items-center mb-16 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-black tracking-tighter">SPONSOR PORTAL</h1>
          <p className="text-gray-500 text-xs tracking-widest uppercase font-bold mt-1">Sponsor @ AI ARENA</p>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/sponsor-challenges")}
            className="text-sm font-bold opacity-70 hover:opacity-100 transition-all uppercase tracking-widest"
          >
            VIEW MY CHALLENGES
          </button>
          <button
            onClick={handleLogout}
            className="text-sm font-bold border border-white/10 hover:border-white/30 px-6 py-2 rounded-full transition-all"
          >
            LOGOUT
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Challenge Creator */}
        <div className="bg-[#111] border border-white/5 p-10 rounded-2xl">
          <h2 className="text-3xl font-bold mb-8">Create New Challenge</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Title</label>
              <input
                type="text"
                className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-white/30"
                placeholder="e.g. Build a Generative AI for Sales"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Problem Statement</label>
              <textarea
                className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-white/30 min-h-[150px]"
                placeholder="Describe the challenge details..."
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Prize Pool ($)</label>
                <input
                  type="number"
                  className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-white/30"
                  placeholder="2500"
                  value={prizePool}
                  onChange={(e) => setPrizePool(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Deadline</label>

                <input
                  type="datetime-local"
                  className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-white/30 [color-scheme:dark]"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />

                <p className="text-[10px] text-gray-600 mt-2 ml-1 font-bold uppercase tracking-widest">
                  Set to your local time (saved as UTC)
                </p>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={isLaunching}
              className={`w-full py-4 rounded-xl font-bold mt-4 transition-all font-black text-lg shadow-xl flex items-center justify-center gap-3 ${isLaunching ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5' : 'bg-white text-black hover:bg-gray-200 active:scale-[0.98] shadow-white/5'}`}
            >
              {isLaunching ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-500 border-t-white rounded-full animate-spin"></div>
                  <span>LAUNCHING ARENA MISSION...</span>
                </>
              ) : (
                "LAUNCH CHALLENGE"
              )}
            </button>
          </div>
        </div>

        {/* Info Column */}
        <div className="flex flex-col justify-center">
          <div className="inline-block p-4 mb-8">
            <h3 className="text-5xl font-bold mb-4">Post. Recruit.<br /><span className="text-gray-500 italic">Build.</span></h3>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Your challenge will be broadcast to our community of top AI Builders.
              The most promising MVPs will be surfaced to you for review and hiring.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="p-6 border border-white/5 rounded-2xl bg-white/5">
              <div className="text-white font-bold mb-1">Community Reach</div>
              <div className="text-gray-500 text-sm italic">Direct access to 2,400+ builders</div>
            </div>
            <div className="p-6 border border-white/5 rounded-2xl bg-white/5">
              <div className="text-white font-bold mb-1">AI Scoring</div>
              <div className="text-gray-500 text-sm italic">Automatic initial screening of all submissions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorDashboard;