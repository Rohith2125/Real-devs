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
def challenge_leaderboard(challenge_id: str):
    # 1️⃣ Fetch challenge first
    challenge_response = supabase.table("challenges") \
        .select("*") \
        .eq("id", str(challenge_id)) \
        .single() \
        .execute()

    if not challenge_response.data:
        raise HTTPException(status_code=404, detail="Challenge not found")

    challenge = challenge_response.data

    # 2️⃣ Deadline check (Robust aware/naive handling)
    deadline_str = challenge["deadline"]
    is_passed = False
    try:
        if "Z" in deadline_str or "+" in deadline_str:
            deadline = datetime.fromisoformat(deadline_str.replace("Z", "+00:00"))
            is_passed = datetime.now(timezone.utc) >= deadline
        else:
            # If naive, it's ambiguous. Check against BOTH UTC and Naive local.
            # If it passed in either, it's likely intended to be open (or passed).
            deadline_naive = datetime.fromisoformat(deadline_str[:19])
            passed_naive = datetime.now() >= deadline_naive
            passed_utc = datetime.now(timezone.utc) >= deadline_naive.replace(tzinfo=timezone.utc)
            is_passed = passed_naive or passed_utc
    except Exception as e:
        print(f"DEBUG: Date parsing error: {e}")
        is_passed = True # Default to open if we can't parse

    if not is_passed:
        # Re-calc for the debug print
        deadline = datetime.fromisoformat(deadline_str.replace("Z", "+00:00")) if "Z" in deadline_str else deadline_str
        print(f"DEBUG: Leaderboard access blocked. Deadline: {deadline}")
        raise HTTPException(
            status_code=403,
            detail="Leaderboard will be available after the submission deadline."
        )

    # 3️⃣ Get submissions for this challenge
    submissions = supabase.table("submissions") \
        .select("*") \
        .eq("challenge_id", str(challenge_id)) \
        .execute()

    if not submissions.data:
        return {"submissions": []}

    results = []

    for submission in submissions.data:
        # 4️⃣ Get user info
        user = supabase.table("users") \
            .select("github_handle, email") \
            .eq("id", submission["user_id"]) \
            .single() \
            .execute()

        # 5️⃣ Get score
        score_res = supabase.table("challenge_scores") \
            .select("overall_score, llm_output") \
            .eq("submission_id", submission["id"]) \
            .execute()

        overall_score = 0
        evaluation = None
        if score_res.data:
            overall_score = float(score_res.data[0]["overall_score"] or 0)
            evaluation = score_res.data[0].get("llm_output")

        results.append({
            "submission_id": submission["id"],
            "github_handle": user.data["github_handle"] if user.data else "Anonymous",
            "email": user.data["email"] if user.data else "N/A",
            "repo_url": submission["repo_url"],
            "pitch_deck_url": submission.get("pitch_deck_url"),
            "demo_video_url": submission.get("demo_video_url"),
            "overall_score": overall_score,
            "evaluation": evaluation,
            "submitted_at": submission["created_at"]
        })

    # 6️⃣ Sort by score descending
    results = sorted(
        results,
        key=lambda x: x["overall_score"],
        reverse=True
    )

    # 7️⃣ Add rank
    for idx, entry in enumerate(results):
        entry["rank"] = idx + 1

    return {"submissions": results}