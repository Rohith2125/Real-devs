import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { syncUser } from "../services/api";

const SponsorOnboarding = () => {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate("/select-role");
        return;
      }

      // Check if they already exist in our DB
      const dbUser = await syncUser(data.user, "sponsor");

      // If we already have a company name, go straight to dashboard
      if (dbUser.company_name) {
        navigate("/sponsor-dashboard");
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleFinishOnboarding = async () => {
    if (!companyName.trim()) {
      alert("Please enter your company name");
      return;
    }

    setIsSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await syncUser(user, "sponsor", companyName);

      navigate("/sponsor-dashboard");
    } catch (err) {
      console.error(err);
      alert("Error finishing onboarding");
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-lg tracking-widest font-bold uppercase">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md bg-[#111] border border-white/10 p-10 rounded-2xl shadow-2xl shadow-white/5">
        <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
        <p className="text-gray-400 mb-8 font-medium italic border-l-2 border-white/10 pl-4">
          Let's finish setting up your <span className="text-white font-bold uppercase tracking-tighter">Sponsor</span> profile.
        </p>

        <div className="mb-8">
          <label className="block text-[10px] font-black text-gray-500 mb-3 ml-1 uppercase tracking-[0.2em]">
            Company Name
          </label>
          <input
            type="text"
            className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-white/30 transition-all font-medium"
            placeholder="e.g. OpenAI"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <button
          onClick={handleFinishOnboarding}
          disabled={isSyncing}
          className="w-full bg-white text-black py-4 rounded-xl font-black text-lg hover:bg-gray-200 transition-all disabled:opacity-50 active:scale-95 transition-transform"
        >
          {isSyncing ? "CREATING PROFILE..." : "COMPLETE PROFILE"}
        </button>

        <p className="mt-8 text-[10px] text-gray-600 text-center font-bold tracking-widest uppercase">
          AI BUILDERS ARENA &copy; 2026
        </p>
      </div>
    </div>
  );
};

export default SponsorOnboarding;