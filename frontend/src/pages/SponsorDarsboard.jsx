import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { createChallenge } from "../services/api";

const SponsorDashboard = () => {
  const [userId, setUserId] = useState(null);

  const [title, setTitle] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [prizePool, setPrizePool] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUserId(data.user.id);
    }
  };

  const handleCreate = async () => {
    if (!title || !problemStatement || !prizePool || !deadline) {
      alert("Please fill all fields");
      return;
    }

    try {
      await createChallenge({
        title,
        problem_statement: problemStatement,
        prize_pool: parseFloat(prizePool),
        deadline: new Date(deadline).toISOString(),
        sponsor_id: userId,
      });

      alert("Challenge created successfully!");

      // Clear form
      setTitle("");
      setProblemStatement("");
      setPrizePool("");
      setDeadline("");

    } catch (error) {
      console.error(error);
      alert("Error creating challenge");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">
        Sponsor Dashboard
      </h1>

      <div className="bg-white text-black p-6 rounded-xl max-w-xl space-y-4">

        <input
          type="text"
          placeholder="Challenge Title"
          className="w-full p-2 border rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Problem Statement"
          className="w-full p-2 border rounded"
          value={problemStatement}
          onChange={(e) => setProblemStatement(e.target.value)}
        />

        <input
          type="number"
          placeholder="Prize Pool"
          className="w-full p-2 border rounded"
          value={prizePool}
          onChange={(e) => setPrizePool(e.target.value)}
        />

        <input
          type="date"
          className="w-full p-2 border rounded"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />

        <button
          onClick={handleCreate}
          className="w-full bg-black text-white py-2 rounded"
        >
          Create Challenge
        </button>

      </div>
    </div>
  );
};

export default SponsorDashboard;