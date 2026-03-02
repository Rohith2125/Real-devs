from fastapi import APIRouter
from db import supabase
from models import SubmissionCreate
from services.scoring import score_submission
from uuid import UUID
from datetime import datetime, timezone


router = APIRouter()


@router.post("/submit")
def submit_mvp(submission: SubmissionCreate):

    # 1️⃣ Fetch challenge first
    challenge_response = supabase.table("challenges") \
        .select("*") \
        .eq("id", submission.challenge_id) \
        .single() \
        .execute()

    if not challenge_response.data:
        raise HTTPException(status_code=404, detail="Challenge not found")

    challenge = challenge_response.data

    # 2️⃣ Deadline check
    deadline = datetime.fromisoformat(challenge["deadline"].replace("Z", "+00:00"))
    current_time = datetime.now(timezone.utc)

    if current_time > deadline:
        raise HTTPException(
            status_code=403,
            detail="Submission deadline has passed"
        )

    # 3️⃣ Save submission
    inserted = supabase.table("submissions").insert(
        submission.dict()
    ).execute()

    submission_data = inserted.data[0]

    # 4️⃣ Score using LLM
    score_result = score_submission(challenge, submission_data)

    if score_result is None:
        raise HTTPException(status_code=500, detail="Scoring failed")

    # 5️⃣ Save challenge score
    supabase.table("challenge_scores").insert({
        "submission_id": submission_data["id"],
        "overall_score": score_result["overall_score"],
        "llm_output": score_result
    }).execute()

    # 6️⃣ Update season score
    existing = supabase.table("season_scores") \
        .select("*") \
        .eq("user_id", submission.user_id) \
        .execute()

    if existing.data:
        new_score = existing.data[0]["cumulative_score"] + score_result["overall_score"]

        supabase.table("season_scores") \
            .update({"cumulative_score": new_score}) \
            .eq("user_id", submission.user_id) \
            .execute()
    else:
        supabase.table("season_scores").insert({
            "user_id": submission.user_id,
            "cumulative_score": score_result["overall_score"]
        }).execute()

    return {
        "message": "Submission scored successfully",
        "score": score_result
    }



@router.get("/challenge/{challenge_id}")
def get_submissions_for_challenge(challenge_id: UUID):

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
            .select("github_handle") \
            .eq("id", submission["user_id"]) \
            .single() \
            .execute()

        # 5️⃣ Get score
        score = supabase.table("challenge_scores") \
            .select("overall_score") \
            .eq("submission_id", submission["id"]) \
            .execute()

        overall_score = None
        if score.data:
            overall_score = score.data[0]["overall_score"]

        results.append({
            "submission_id": submission["id"],
            "github_handle": user.data["github_handle"],
            "repo_url": submission["repo_url"],
            "pitch_deck_url": submission["pitch_deck_url"],
            "demo_video_url": submission["demo_video_url"],
            "overall_score": overall_score,
            "submitted_at": submission["created_at"]
        })

    # 6️⃣ Sort by score descending
    results = sorted(
        results,
        key=lambda x: x["overall_score"] if x["overall_score"] is not None else 0,
        reverse=True
    )

    # 7️⃣ Add rank
    for idx, entry in enumerate(results):
        entry["rank"] = idx + 1

    return {"submissions": results}