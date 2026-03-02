import uuid
from fastapi import APIRouter, HTTPException
from models import ChallengeCreate
from db import supabase

router = APIRouter()

@router.post("/create")
def create_challenge(challenge: ChallengeCreate):

    sponsor_check = supabase.table("users") \
        .select("id, role") \
        .eq("id", challenge.sponsor_id) \
        .execute()

    if not sponsor_check.data:
        raise HTTPException(status_code=400, detail="Sponsor not found")

    if sponsor_check.data["role"] != "sponsor":
        raise HTTPException(status_code=403, detail="Only sponsors can create challenges")

    new_challenge = {
        "id": str(uuid.uuid4()),
        "sponsor_id": challenge.sponsor_id,
        "title": challenge.title,
        "problem_statement": challenge.problem_statement,
        "prize_pool": challenge.prize_pool,
        "deadline": challenge.deadline.isoformat(),
        "is_live": True
    }

    response = supabase.table("challenges") \
        .insert(new_challenge) \
        .execute()

    return response.data[0]

@router.get("/")
def get_all_challenges():
    response = supabase.table("challenges").select("*").execute()
    return response.data