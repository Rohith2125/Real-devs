import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import RoleSelection from "./pages/RoleSelection";
import UserDashboard from "./pages/UserDashboard";
import ChallengeDetail from "./pages/ChallengeDetail";
import MyChallenges from "./pages/MyChallenges"
import SponsorOnboarding from './pages/SponsorOnboarding'
import SponsorDashboard from "./pages/SponsorDarsboard";
import SponsorChallenges from "./pages/SponsorChallenges";
import ChallengeLeaderboard from "./pages/ChallengeLeaderboard";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/select-role" element={<RoleSelection />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/challenge/:id" element={<ChallengeDetail />} />
        <Route path="/my-challenges" element={<MyChallenges />} />
        <Route path="/sponsor-dashboard" element={<SponsorDashboard />} />
        <Route path="/sponsor-onboarding" element={<SponsorOnboarding />} />
        <Route path="/sponsor-challenges" element={<SponsorChallenges />} />
        <Route path="/challenge/:id/leaderboard" element={<ChallengeLeaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;