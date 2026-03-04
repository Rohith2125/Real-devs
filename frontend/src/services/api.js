// src/services/api.js
import axios from "axios";
import { supabase } from "./supabase";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// 🔹 Get all challenges
export const getChallenges = async () => {
  const res = await API.get("/challenges");
  return res.data;
};

// 🔹 Enroll in challenge
export const enrollInChallenge = async (user_id, challenge_id) => {
  const res = await API.post("/enrollments/enroll", {
    user_id,
    challenge_id,
  });
  return res.data;
};

// 🔹 Sync user (handles builder github sync & sponsor profile completion)
export const syncUser = async (user, role = "user", companyName = null) => {
  const res = await API.post("/users/create", {
    id: user.id,
    email: user.email,
    github_handle: user.user_metadata?.user_name || null,
    role: role,
    company_name: companyName
  });

  return res.data;
};

// 🔹 Get enrolled challenges for a user
export const getEnrolledChallenges = async (user_id) => {
  const res = await API.get(`/enrollments/user/${user_id}`);
  return res.data;
};

// 🔹 Create challenge (Sponsor only)
export const createChallenge = async (data) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const res = await API.post(
    "/challenges/create",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

// 🔹 Get challenges for current sponsor
export const getSponsorChallenges = async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  if (!token) {
    throw new Error("User is not authenticated");
  }

  const res = await API.get(
    "/challenges/my-challenges",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

// 🔹 Get leaderboard for a challenge
export const getLeaderboard = async (challenge_id) => {
  const res = await API.get(`/leaderboard/challenge/${challenge_id}`);
  return res.data;
};

// 🔹 Submit MVP for a challenge
export const submitChallenge = async (data) => {
  const res = await API.post("/submissions/submit", data);
  return res.data;
};