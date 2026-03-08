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
    // 1️⃣ Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        checkAuth(session.user);
      } else if (event === 'SIGNED_OUT') {
        navigate("/select-role");
      }
    });

    // 2️⃣ Initial check
    checkCurrentSession();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkCurrentSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      checkAuth(session.user);
    } else {
      // Delay for hash processing
      setTimeout(async () => {
        const { data: { session: retrySession } } = await supabase.auth.getSession();
        if (retrySession) {
          checkAuth(retrySession.user);
        } else {
          if (!window.location.hash.includes('access_token')) {
            navigate("/select-role");
          }
        }
      }, 500);
    }
  };

  const checkAuth = async (user) => {
    try {
      // Check if they already exist in our DB
      const dbUser = await syncUser(user, "sponsor");

      // If we already have a company name, go straight to dashboard
      if (dbUser.company_name) {
        navigate("/sponsor-dashboard");
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setLoading(false); // Let them try to fill the form if sync fails briefly
    }
  };

  const [status, setStatus] = useState({ type: "", message: "" });

  const handleFinishOnboarding = async () => {
    setStatus({ type: "", message: "" });
    if (!companyName.trim()) {
      setStatus({ type: "error", message: "Please enter your company name" });
      return;
    }

    setIsSyncing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      await syncUser(user, "sponsor", companyName);

      navigate("/sponsor-dashboard");
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Error finishing onboarding" });
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

        {status.message && (
          <div className="p-4 rounded-xl text-center font-bold text-[10px] tracking-[0.2em] uppercase mb-6 bg-red-500/10 text-red-500 border border-red-500/20">
            {status.message}
          </div>
        )}

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