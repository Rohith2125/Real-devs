import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import { getChallenges, enrollInChallenge, syncUser } from "../services/api";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [challenges, setChallenges] = useState([]);

const handleLogout = async () => {
  await supabase.auth.signOut();
  window.location.href = "/";
};

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      navigate("/");
      return;
    }

    const user = data.user;

    // 🔥 Sync user into backend
    await syncUser(user);

    setUserId(user.id);

    fetchChallenges();
  };

  const fetchChallenges = async () => {
    const data = await getChallenges();
    setChallenges(data);
  };

  const handleEnroll = async (challengeId) => {
    await enrollInChallenge(userId, challengeId);
    alert("Enrolled successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
<button
  onClick={handleLogout}
  className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded"
>
  Logout
</button>
      <h1 className="text-3xl font-bold mb-8">
        Available Challenges
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className="bg-white shadow-md rounded-xl p-6 border"
          >
            <h2 className="text-xl font-semibold mb-2">
              {challenge.title}
            </h2>

            <p className="text-gray-600 mb-2">
              Prize: ${challenge.prize_pool}
            </p>

            <p className="text-gray-500 text-sm mb-4">
              Deadline: {new Date(challenge.deadline).toLocaleString()}
            </p>

            <button
              onClick={() => handleEnroll(challenge.id)}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Enroll
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboard;