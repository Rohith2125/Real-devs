from fastapi import APIRouter, HTTPException
from db import supabase
from uuid import UUID
from datetime import datetime, timezone


router = APIRouter()



@router.get("/season")
def season_leaderboard():

    # 1️⃣ Get all season scores
    scores = supabase.table("season_scores") \
        .select("user_id, cumulative_score") \
        .execute()

    if not scores.data:
        return {"leaderboard": []}

    leaderboard = []

    for entry in scores.data:

        # 2️⃣ Get user info
        user = supabase.table("users") \
            .select("github_handle") \
            .eq("id", entry["user_id"]) \
            .single() \
            .execute()

        leaderboard.append({
            "github_handle": user.data["github_handle"],
            "cumulative_score": entry["cumulative_score"]
        })

    # 3️⃣ Sort by cumulative_score descending
    leaderboard = sorted(
        leaderboard,
        key=lambda x: x["cumulative_score"],
        reverse=True
    )

    # 4️⃣ Add rank
    for idx, entry in enumerate(leaderboard):
        entry["rank"] = idx + 1

    return {"leaderboard": leaderboard}

@router.get("/challenge/{challenge_id}")
def challenge_leaderboard(challenge_id: UUID):

    # 1️⃣ Fetch challenge first
    challenge_response = supabase.table("challenges") \
        .select("*") \
        .eq("id", str(challenge_id)) \
        .single() \
        .execute()

    if not challenge_response.data:
        raise HTTPException(status_code=404, detail="Challenge not found")

    challenge = challenge_response.data

    # 2️⃣ Deadline check
    deadline = datetime.fromisoformat(challenge["deadline"].replace("Z", "+00:00"))
    current_time = datetime.now(timezone.utc)

    if current_time < deadline:
        raise HTTPException(
            status_code=403,
            detail="Leaderboard will be available after the submission deadline."
        )

    # 3️⃣ Get submissions
    submissions = supabase.table("submissions") \
        .select("id, user_id") \
        .eq("challenge_id", str(challenge_id)) \
        .execute()

    if not submissions.data:
        return {"leaderboard": []}

    submission_ids = [s["id"] for s in submissions.data]

    # 4️⃣ Get scores
    scores = supabase.table("challenge_scores") \
        .select("submission_id, overall_score") \
        .in_("submission_id", submission_ids) \
        .execute()

    if not scores.data:
        return {"leaderboard": []}

    leaderboard = []

    for score in scores.data:
        submission = next(
            (s for s in submissions.data if s["id"] == score["submission_id"]),
            None
        )

        if submission:
            user = supabase.table("users") \
                .select("github_handle") \
                .eq("id", submission["user_id"]) \
                .single() \
                .execute()

            leaderboard.append({
                "github_handle": user.data["github_handle"],
                "overall_score": score["overall_score"]
            })

    # 5️⃣ Sort + Rank
    leaderboard = sorted(
        leaderboard,
        key=lambda x: x["overall_score"],
        reverse=True
    )

    for idx, entry in enumerate(leaderboard):
        entry["rank"] = idx + 1

    return {"leaderboard": leaderboard}