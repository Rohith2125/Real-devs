import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">

      {/* Navbar */}
      <div className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold">AI Builders Arena</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-white text-black px-5 py-2 rounded-lg font-medium"
        >
          Enter Platform
        </button>
      </div>

      {/* Hero Section */}
      <div className="flex flex-1 flex-col justify-center items-center text-center px-6">

        <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Prove Your AI Skills.
          <br />
          <span className="text-gray-400">Get Hired.</span>
        </h2>

        <p className="text-gray-400 max-w-2xl mb-10 text-lg">
          Build real AI MVPs. Compete in challenges.
          Get scored by AI + sponsors.
          Land real job opportunities.
        </p>

        <div className="flex gap-6">
          <button
            onClick={() => navigate("/select-role")}
            className="bg-white text-black px-8 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Join as Builder
          </button>

          <button
            onClick={() => navigate("/select-role")}
            className="border border-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-black transition"
          >
            Post a Challenge
          </button>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;