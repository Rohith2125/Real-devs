import { useState } from "react";
import { submitChallenge } from "../services/api";

const SubmissionModal = ({ challenge, onClose, userId }) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [pitchUrl, setPitchUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!repoUrl.trim()) {
      alert("Please provide the GitHub repository URL");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitChallenge({
        user_id: userId,
        challenge_id: challenge.id,
        repo_url: repoUrl,
        pitch_deck_url: pitchUrl.trim() || null,
        demo_video_url: videoUrl.trim() || null,
      });

      alert("CHALLENGE SUBMITTED SUCCESSFULLY 🚀");
      if (typeof onClose === 'function') onClose();
    } catch (err) {
      console.error(err);
      alert("Error submitting. Please check your URLs and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-6 animate-in fade-in zoom-in duration-300">

      <div className="bg-[#111] border border-white/10 p-10 rounded-[2.5rem] w-full max-w-lg shadow-[0_0_100px_rgba(255,255,255,0.03)] relative overflow-hidden">

        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 blur-[100px] rounded-full"></div>

        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black mb-3 tracking-tighter uppercase italic">
            SUBMIT ARENA MVP
          </h2>
          <p className="text-gray-500 font-bold text-xs tracking-widest uppercase border-b border-white/5 pb-6">
            Challenge: {challenge.title}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-3 ml-1 uppercase tracking-[0.2em]">
              GitHub Repo URL
            </label>
            <input
              className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-white/30 transition-all font-medium text-white placeholder:text-gray-700"
              placeholder="e.g. https://github.com/user/arena-builder"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-3 ml-1 uppercase tracking-[0.2em]">
                Pitch URL (PDF)
              </label>
              <input
                className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-white/30 transition-all font-medium text-white placeholder:text-gray-700"
                placeholder="Link to your deck"
                value={pitchUrl}
                onChange={(e) => setPitchUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-3 ml-1 uppercase tracking-[0.2em]">
                Demo Video URL
              </label>
              <input
                className="w-full bg-black border border-white/10 p-4 rounded-xl outline-none focus:border-white/30 transition-all font-medium text-white placeholder:text-gray-700"
                placeholder="Loom, YouTube, etc."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4">
          <button
            disabled={isSubmitting}
            onClick={handleSubmit}
            className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${isSubmitting ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5' : 'bg-white text-black hover:bg-gray-200 active:scale-[0.98] shadow-white/5'}`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-500 border-t-white rounded-full animate-spin"></div>
                <span>PROCESSING ARENA ENTRY...</span>
              </>
            ) : (
              "UPLOAD BUILD 🚀"
            )}
          </button>
          <button
            onClick={onClose}
            className="text-xs font-black text-gray-500 hover:text-white transition-all uppercase tracking-widest py-2"
          >
            CANCEL SUBMISSION
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionModal;