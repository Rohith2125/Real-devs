import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import axios from "axios";

const API = "http://127.0.0.1:8000";

const SubmissionForm = () => {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [pitchUrl, setPitchUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadChallenge();
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUserId(data.user.id);
    }
  };

  const loadChallenge = async () => {
    const res = await axios.get(`${API}/challenges`);
    const found = res.data.find((c) => c.id === id);
    setChallenge(found);
  };

  const handleSubmit = async () => {
    await axios.post(`${API}/submissions/submit`, {
      user_id: userId,
      challenge_id: id,
      repo_url: repoUrl,
      pitch_deck_url: pitchUrl,
      demo_video_url: videoUrl,
    });

    alert("Submission sent! 🚀");
  };

  if (!challenge) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-3xl font-bold mb-4">
        {challenge.title}
      </h1>

      <p className="mb-4">{challenge.problem_statement}</p>

      <div className="bg-white p-6 rounded-xl shadow-md">

        <h2 className="text-xl font-semibold mb-4">
          Submit Your MVP
        </h2>

        <input
          type="text"
          placeholder="GitHub Repo URL"
          className="w-full mb-3 p-2 border rounded"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />

        <input
          type="text"
          placeholder="Pitch Deck URL"
          className="w-full mb-3 p-2 border rounded"
          value={pitchUrl}
          onChange={(e) => setPitchUrl(e.target.value)}
        />

        <input
          type="text"
          placeholder="Demo Video URL"
          className="w-full mb-3 p-2 border rounded"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
        >
          Submit
        </button>

      </div>
    </div>
  );
};

export default SubmissionForm;