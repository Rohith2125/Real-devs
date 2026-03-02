// src/components/ChallengeCard.jsx

const ChallengeCard = ({ challenge, onEnroll }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 border">
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
        onClick={() => onEnroll(challenge.id)}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        Enroll
      </button>
    </div>
  );
};

export default ChallengeCard;