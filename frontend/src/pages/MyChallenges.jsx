import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { getEnrolledChallenges } from "../services/api";
import SubmissionModal from "../components/SubmissionModal";

const MyChallenges = () => {
  const [userId, setUserId] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUserId(data.user.id);
      fetchEnrolled(data.user.id);
    }
  };

  const fetchEnrolled = async (uid) => {
    const data = await getEnrolledChallenges(uid);
    setChallenges(data);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">
        My Challenges
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-2">
              {challenge.title}
            </h2>

            <p className="text-gray-500 mb-3">
              Deadline: {new Date(challenge.deadline).toLocaleString()}
            </p>

            <button
              onClick={() => setSelectedChallenge(challenge)}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Submit
            </button>
          </div>
        ))}
      </div>

      {selectedChallenge && (
        <SubmissionModal
          challenge={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          userId={userId}
        />
      )}
    </div>
  );
};

export default MyChallenges;