from fastapi import APIRouter, HTTPException
from db import supabase
from models import SubmissionCreate
from services.scoring import score_submission
from uuid import UUID
from datetime import datetime, timezone
import json

router = APIRouter()


@router.post("/submit")
def submit_mvp(submission: SubmissionCreate):
    # Ensure IDs are strings for Supabase
    uid = str(submission.user_id)
    cid = str(submission.challenge_id)
    
    print(f"DEBUG: Processing submission for user {uid} in challenge {cid}")

    try:
        # 1️⃣ Fetch challenge first
        challenge_response = supabase.table("challenges") \
            .select("*") \
            .eq("id", cid) \
            .single() \
            .execute()

        if not challenge_response.data:
            raise HTTPException(status_code=404, detail="Challenge not found")

        challenge = challenge_response.data

        # 2️⃣ Deadline check
        deadline_str = challenge["deadline"]
        if deadline_str.endswith("Z"):
            deadline = datetime.fromisoformat(deadline_str.replace("Z", "+00:00"))
        else:
            deadline = datetime.fromisoformat(deadline_str).replace(tzinfo=timezone.utc)
            
        current_time = datetime.now(timezone.utc)

        if current_time > deadline:
            print(f"DEBUG: Submission rejected - Deadline: {deadline}, Current: {current_time}")
            raise HTTPException(
                status_code=403,
                detail="Submission deadline has passed"
            )

        # 3️⃣ Check for existing submission
        existing_sub = supabase.table("submissions") \
            .select("*") \
            .eq("user_id", uid) \
            .eq("challenge_id", cid) \
            .execute()
        
        is_update = len(existing_sub.data) > 0
        old_score = 0
        existing_submission_id = None

        if is_update:
            existing_submission_id = existing_sub.data[0]["id"]
            # Get existing score if any
            existing_score_data = supabase.table("challenge_scores") \
                .select("overall_score") \
                .eq("submission_id", existing_submission_id) \
                .execute()
            if existing_score_data.data:
                old_score = float(existing_score_data.data[0]["overall_score"] or 0)

        # 4️⃣ Save/Update submission
        submission_dict = {
            "user_id": uid,
            "challenge_id": cid,
            "repo_url": submission.repo_url,
            "pitch_deck_url": submission.pitch_deck_url,
            "demo_video_url": submission.demo_video_url
        }
        
        if is_update:
            res = supabase.table("submissions").update(submission_dict).eq("id", existing_submission_id).execute()
        else:
            res = supabase.table("submissions").insert(submission_dict).execute()

        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to save/update submission")
            
        submission_data = res.data[0]
        print(f"DEBUG: Submission {'updated' if is_update else 'saved'} with ID: {submission_data['id']}")

        # 5️⃣ Score using LLM
        new_score = 0
        score_result = None
        try:
            score_result = score_submission(challenge, submission_data)
            print(f'check score: {score_result}')
            if score_result and "overall_score" in score_result:
                new_score = float(score_result["overall_score"])
                score_result["overall_score"] = new_score
            else:
                print("DEBUG: Scoring returned invalid result, skipping automatic scoring.")
        except Exception as e:
            print(f"DEBUG: Scoring failed - {e}")
            # we don't raise here, allow the submission to succeed without score for now

        # 6️⃣ Save challenge score (Always create a record for the leaderboard)
        score_data = {
            "submission_id": submission_data["id"],
            "overall_score": new_score,
            "llm_output": score_result if score_result else {"overall_score": 0, "rationale": "AI scoring in progress or unavailable.", "scores": {}}
        }
        
        existing_score = supabase.table("challenge_scores") \
            .select("id") \
            .eq("submission_id", submission_data["id"]) \
            .execute()
            
        if existing_score.data:
            supabase.table("challenge_scores") \
                .update(score_data) \
                .eq("submission_id", submission_data["id"]) \
                .execute()
        else:
            supabase.table("challenge_scores").insert(score_data).execute()

            # 7️⃣ Update season score
            existing_season = supabase.table("season_scores") \
                .select("*") \
                .eq("user_id", uid) \
                .execute()

            if existing_season.data:
                current_cum = float(existing_season.data[0]["cumulative_score"] or 0)
                new_cumulative = current_cum - old_score + new_score
                supabase.table("season_scores") \
                    .update({"cumulative_score": new_cumulative}) \
                    .eq("user_id", uid) \
                    .execute()
            else:
                supabase.table("season_scores").insert({
                    "user_id": uid,
                    "cumulative_score": new_score
                }).execute()

        return {
            "message": f"Submission {'updated' if is_update else 'saved'} successfully. Scoring {'complete' if score_result else 'pending'}.",
            "score": score_result
        }
        
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"CRITICAL ERROR in submit_mvp: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

    return {
        "message": f"Submission {'updated' if is_update else 'scored'} successfully",
        "score": score_result
    }


