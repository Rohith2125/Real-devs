import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SponsorOnboarding = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !companyName) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://127.0.0.1:8000/users/create", {
        email: email,
        company_name: companyName,
        role: "sponsor",
      });

      alert("Sponsor registered successfully!");

      navigate("/sponsor-dashboard");

    } catch (err) {
      console.error(err);
      alert("Error registering sponsor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-black text-white">
      <div className="bg-white text-black p-8 rounded-xl w-96">

        <h1 className="text-2xl font-bold mb-6">
          Sponsor Registration
        </h1>

        <input
          type="email"
          placeholder="Company Email"
          className="w-full p-2 border rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="Company Name"
          className="w-full p-2 border rounded mb-6"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded"
        >
          {loading ? "Registering..." : "Register"}
        </button>

      </div>
    </div>
  );
};

export default SponsorOnboarding;