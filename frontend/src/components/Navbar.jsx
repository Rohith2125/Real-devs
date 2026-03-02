// src/components/Navbar.jsx

const Navbar = () => {
  return (
    <div className="bg-black text-white p-4 flex justify-between">
      <h1 className="text-xl font-bold">AI Builders Arena</h1>
      <button className="bg-white text-black px-4 py-1 rounded">
        Leaderboard
      </button>
    </div>
  );
};

export default Navbar;