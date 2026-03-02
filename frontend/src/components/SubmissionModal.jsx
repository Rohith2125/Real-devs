import { useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

const SubmissionModal = ({ challenge, onClose, userId }) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [pitchUrl, setPitchUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const handleSubmit = async () => {
    await axios.post(`${API}/submissions/submit`, {
      user_id: userId,
      challenge_id: challenge.id,
      repo_url: repoUrl,
      pitch_deck_url: pitchUrl,
      demo_video_url: videoUrl,
    });

    alert("Submitted successfully 🚀");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">

      <div className="bg-white p-8 rounded-xl w-96">
        <h2 className="text-xl font-bold mb-4">
          Submit for {challenge.title}
        </h2>

        <input
          className="w-full mb-3 p-2 border rounded"
          placeholder="Repo URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
        />

        <input
          className="w-full mb-3 p-2 border rounded"
          placeholder="Pitch Deck URL"
          value={pitchUrl}
          onChange={(e) => setPitchUrl(e.target.value)}
        />

        <input
          className="w-full mb-4 p-2 border rounded"
          placeholder="Demo Video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionModal;