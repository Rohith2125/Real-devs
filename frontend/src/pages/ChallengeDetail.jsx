import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { getChallenges, enrollInChallenge, getEnrolledChallenges } from "../services/api";
import SubmissionModal from "../components/SubmissionModal";

const ChallengeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  useEffect(() => {
    init();
  }, [id]);

  const init = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate("/select-role");
        return;
      }
      setUserId(data.user.id);

      const [allChallenges, enrolledData] = await Promise.all([
        getChallenges(),
        getEnrolledChallenges(data.user.id)
      ]);

      const found = allChallenges.find((c) => c.id === id);
      setChallenge(found);

      const enrolledChallenge = (enrolledData.enrolled_challenges || []).find(c => c.id === id);
      setIsEnrolled(!!enrolledChallenge);
      setHasSubmitted(enrolledChallenge?.has_submitted || false);
    } catch (err) {
      console.error("Initialization failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (isEnrolled) return;
    try {
      await enrollInChallenge(userId, id);
      setIsEnrolled(true);
      alert("Enrolled successfully! Ready to build? 🚀");
    } catch (err) {
      console.error(err);
      alert("Error enrolling. Please try again.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
    </div>
  );

  if (!challenge) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-xl font-bold uppercase tracking-widest text-gray-500">Challenge Not Found</div>
    </div>
  );

  const isAfterDeadline = new Date() > new Date(challenge.deadline);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <nav className="flex justify-between items-center mb-16 max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-bold opacity-70 hover:opacity-100 transition-all uppercase tracking-widest flex items-center gap-2"
        >
          ← BACK TO ARENA
        </button>
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">MISSION DETAILS</div>
      </nav>

      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="flex gap-4 mb-8">
            <div className={`px-4 py-1.5 border rounded-full text-xs font-black uppercase tracking-widest ${isAfterDeadline ? 'bg-red-500/10 border-red-500/20 text-red-500' : hasSubmitted ? 'bg-purple-500/10 border-purple-500/20 text-purple-500' : isEnrolled ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
              {isAfterDeadline ? 'MISSION CLOSED' : hasSubmitted ? 'MVP SUBMITTED' : isEnrolled ? 'ENROLLED' : 'ACTIVE MISSION'}
            </div>
            <div className="px-4 py-1.5 border border-white/10 rounded-full text-xs font-black tracking-widest text-gray-400">
              POOL: ${challenge.prize_pool}
            </div>
          </div>

          <h1 className="text-7xl font-bold tracking-tighter mb-8 leading-[0.9]">
            {challenge.title}
          </h1>

          <div className="bg-[#0A0A0A] border border-white/5 p-10 rounded-[2.5rem] mb-12 shadow-2xl shadow-blue-500/5">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">Execution Overview</h2>
            <p className="text-xl text-gray-300 leading-relaxed font-medium italic">
              "{challenge.problem_statement}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="border border-white/5 p-8 rounded-3xl bg-white/5">
              <h3 className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-4">Submission Terms</h3>
              <ul className="space-y-3 text-sm font-medium">
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Functional AI-powered repository
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  2-minute product demonstration
                </li>
              </ul>
            </div>
            <div className="border border-white/5 p-8 rounded-3xl bg-white/5">
              <h3 className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-4">End Observation</h3>
              <div className="text-2xl font-black">{new Date(challenge.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
              <div className="text-[10px] text-gray-400 font-bold mt-2">LOCAL ARENA TIME</div>
            </div>
          </div>

          <div className="flex gap-6">
            {isAfterDeadline ? (
              <button
                onClick={() => navigate(`/challenge/${id}/leaderboard`)}
                className="flex-1 bg-white text-black py-6 rounded-3xl font-black text-xl hover:bg-gray-200 transition-all shadow-2xl shadow-white/5 active:scale-[0.98]"
              >
                VIEW MISSION RESULTS 🏆
              </button>
            ) : hasSubmitted ? (
              <div className="flex-1 bg-[#0A0A0A] border border-white/5 text-gray-400 py-6 rounded-3xl font-black text-xs text-center uppercase tracking-[0.3em]">
                Result will be announced after deadline
              </div>
            ) : isEnrolled ? (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex-1 bg-white text-black py-6 rounded-3xl font-black text-xl hover:bg-gray-200 transition-all shadow-2xl shadow-white/5 active:scale-[0.98]"
              >
                SUBMIT ARENA MVP 🚀
              </button>
            ) : (
              <button
                onClick={handleEnroll}
                className="flex-1 bg-white text-black py-6 rounded-3xl font-black text-xl hover:bg-gray-200 transition-all shadow-2xl shadow-white/5 active:scale-[0.98]"
              >
                START THIS MISSION
              </button>
            )}
          </div>
        </div>
      </div>

      {showSubmitModal && (
        <SubmissionModal
          challenge={challenge}
          onClose={() => {
            setShowSubmitModal(false);
            init(); // Refresh tracking state
          }}
          userId={userId}
        />
      )}
    </div>
  );
};

export default ChallengeDetail;