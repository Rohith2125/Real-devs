from fastapi import APIRouter, HTTPException
from db import supabase
from models import EnrollmentCreate
from uuid import UUID
router = APIRouter()


@router.post("/enroll")
def enroll_user(enrollment: EnrollmentCreate):
    # 1️⃣ Check if already enrolled
    # Ensure they are strings for the lookup
    uid = str(enrollment.user_id)
    cid = str(enrollment.challenge_id)
    print(f"DEBUG: Enrollment request - User: {uid}, Challenge: {cid}")
    
    existing = supabase.table("enrollments") \
        .select("*") \
        .eq("user_id", uid) \
        .eq("challenge_id", cid) \
        .execute()

    if existing.data:
        raise HTTPException(status_code=400, detail="User already enrolled")

    # 2️⃣ Insert enrollment
    enroll_data = {
        "user_id": uid,
        "challenge_id": cid
    }
    
    response = supabase.table("enrollments") \
        .insert(enroll_data) \
        .execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to enroll in challenge")

    return {
        "message": "Enrolled successfully",
        "data": response.data[0]
    }


@router.get("/user/{user_id}")
def get_user_enrollments(user_id: UUID):

    # 1️⃣ Get enrollments
    enrollments = supabase.table("enrollments") \
        .select("challenge_id") \
        .eq("user_id", str(user_id)) \
        .execute()

    if not enrollments.data:
        return {"enrolled_challenges": []}

    challenge_ids = [e["challenge_id"] for e in enrollments.data]

    # 2️⃣ Fetch full challenge details
    challenges = supabase.table("challenges") \
        .select("*") \
        .in_("id", challenge_ids) \
        .execute()

    return {
        "enrolled_challenges": challenges.data
    }