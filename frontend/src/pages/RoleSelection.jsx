import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleSelect = async (role) => {
    if (role === "user") {
      // Builder → GitHub OAuth
      await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
    }

    if (role === "sponsor") {
      // Sponsor → Google OAuth
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/sponsor-onboarding`,
        },
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-6">
      <div className="max-w-4xl w-full text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
          How do you want to <span className="text-gray-400">contribute?</span>
        </h1>
        <p className="text-gray-500 text-lg">
          Choose your role to get started on the AI Builders Arena.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Builder Card */}
        <div
          onClick={() => handleSelect("user")}
          className="group relative bg-[#111] border border-white/10 p-10 rounded-2xl cursor-pointer hover:border-white/30 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-100 transition-opacity">
            <span className="text-4xl">👨‍💻</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">I'm a Builder</h2>
          <p className="text-gray-400 mb-8 max-w-[250px]">
            Build real AI MVPs, compete in challenges, and get hired by top companies.
          </p>
          <div className="inline-flex items-center gap-2 text-white font-medium">
            Continue with <span className="underline underline-offset-4">GitHub</span>
          </div>
        </div>

        {/* Sponsor Card */}
        <div
          onClick={() => handleSelect("sponsor")}
          className="group relative bg-white text-black p-10 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-100 transition-opacity">
            <span className="text-4xl">🏢</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">I'm a Sponsor</h2>
          <p className="text-gray-600 mb-8 max-w-[250px]">
            Post challenges, find top AI talent, and accelerate your project building.
          </p>
          <div className="inline-flex items-center gap-2 font-semibold">
            Continue with <span className="underline underline-offset-4 text-black">Google</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate("/")}
        className="mt-12 text-sm text-gray-500 hover:text-white transition-colors"
      >
        Go back to home
      </button>
    </div>
  );
};

export default RoleSelection;