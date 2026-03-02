// src/services/api.js

import axios from "axios";

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

export const syncUser = async (user) => {
  const res = await API.post("/users/create", {
    id: user.id,
    email: user.email,
    github_handle: user.user_metadata.user_name,
    role: new URLSearchParams(window.location.search).get("role") || "user"
  });

  return res.data;
};

// 🔹 Get enrolled challenges for a user
export const getEnrolledChallenges = async (user_id) => {
  const res = await API.get(`/enrollments/user/${user_id}`);
  return res.data;
};

export const createChallenge = async (data) => {
  const res = await API.post("/challenges/create", data);
  return res.data;
};