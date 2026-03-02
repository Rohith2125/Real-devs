import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleSelect = async (role) => {

    if (role === "user") {
      // Builder → GitHub OAuth
      await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${import.meta.env.VITE_FRONTEND_URL}/dashboard?role=user`,
        },
      });
    }

    if (role === "sponsor") {
      // Sponsor → Go to email onboarding page
      navigate("/sponsor-onboarding");
    }
  };

//   const { data } = await supabase.auth.getUser();
// const userId = data.user.id;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center">
      <h1 className="text-4xl mb-10">Select Role</h1>

      <div className="flex gap-10">
        <div
          onClick={() => handleSelect("user")}
          className="bg-white text-black p-8 rounded-xl cursor-pointer"
        >
          👨‍💻 Builder
        </div>

        <div
          onClick={() => handleSelect("sponsor")}
          className="border border-white p-8 rounded-xl cursor-pointer"
        >
          🏢 Sponsor
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;