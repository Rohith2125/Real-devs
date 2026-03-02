from fastapi import APIRouter, HTTPException
from db import supabase
from models import EnrollmentCreate
from uuid import UUID
router = APIRouter()


@router.post("/enroll")
def enroll_user(enrollment: EnrollmentCreate):

    # 1️⃣ Check if already enrolled
    existing = supabase.table("enrollments") \
        .select("*") \
        .eq("user_id", enrollment.user_id) \
        .eq("challenge_id", enrollment.challenge_id) \
        .execute()

    if existing.data:
        raise HTTPException(status_code=400, detail="User already enrolled")

    # 2️⃣ Insert enrollment
    response = supabase.table("enrollments") \
        .insert(enrollment.dict()) \
        .execute()

    return {
        "message": "Enrolled successfully",
        "data": response.data
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