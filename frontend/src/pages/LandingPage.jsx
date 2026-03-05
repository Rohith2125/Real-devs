import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-8 md:px-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-sm rotate-45"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tighter">Real Devs</h1>
        </div>

        <div className="hidden md:flex gap-10 text-sm font-medium text-gray-400">
          <a href="#challenges" className="hover:text-white transition-colors">CHALLENGES</a>
          <a href="#leaderboard" className="hover:text-white transition-colors">LEADERBOARD</a>
          <a href="#sponsors" className="hover:text-white transition-colors">SPONSORS</a>
        </div>

        <button
          onClick={() => navigate("/select-role")}
          className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-lg shadow-white/5"
        >
          GET STARTED
        </button>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-1 flex-col justify-center items-center text-center px-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-white/10 bg-white/5 text-xs font-bold tracking-widest text-gray-400 uppercase">
            The Future of Technical Recruiting
          </div>

          <h2 className="text-6xl md:text-8xl font-bold mb-8 leading-[1.05] tracking-tight">
            Prove your AI skills.<br />
            <span className="text-gray-500 italic">Get hired.</span>
          </h2>

          <p className="text-gray-400 max-w-xl mb-12 text-lg mx-auto leading-relaxed border-l-2 border-white/10 pl-6 text-left italic">
            "Stop sending resumes. Start building MVPs. Show the world what you can do with AI while competing for real prizes and jobs."
          </p>

          <div className="flex flex-col sm:flex-col items-center gap-4 justify-center">
            <button
              onClick={() => navigate("/select-role")}
              className="group relative bg-white text-black px-12 py-5 rounded-2xl font-black text-lg hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-white/10 flex items-center gap-3"
            >
              JOIN THE ARENA
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button
              onClick={() => navigate("/select-role")}
              className="px-10 py-5 rounded-2xl font-bold text-gray-400 hover:text-white transition-colors"
            >
              HIRE TOP TALENT
            </button>
          </div>
        </div>
      </div>

      {/* Footer / Stats */}
      <div className="p-16 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 text-center bg-[#050505]">
        <div>
          <div className="text-3xl font-bold mb-1">2.4k+</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">BUILDERS</div>
        </div>
        <div>
          <div className="text-3xl font-bold mb-1">150+</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">CHALLENGES</div>
        </div>
        <div>
          <div className="text-3xl font-bold mb-1">$500k</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">PRIZE POOL</div>
        </div>
        <div>
          <div className="text-3xl font-bold mb-1">45+</div>
          <div className="text-xs text-gray-500 uppercase tracking-widest font-bold">SPONSORS</div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;