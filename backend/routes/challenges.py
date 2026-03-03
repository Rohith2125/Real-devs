import uuid
from fastapi import APIRouter, HTTPException, Header
from models import ChallengeCreate
from db import supabase

router = APIRouter()

@router.post("/create")
def create_challenge(
    challenge: ChallengeCreate,
    authorization: str = Header(None)
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing auth token")

    try:
        # Extract token and get user from Supabase Auth
        token = authorization.split(" ")[1]
        user_response = supabase.auth.get_user(token)
        
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token session")
            
        sponsor_id = user_response.user.id
        print(f"DEBUG: Authenticated sponsor_id from token: {sponsor_id}")
    except Exception as e:
        print(f"Auth error during challenge creation: {e}")
        raise HTTPException(status_code=401, detail="Could not verify sponsor identity")

    # Verify the sponsor exists in our 'users' table and has the correct role
    sponsor_check = supabase.table("users") \
        .select("id, role") \
        .eq("id", sponsor_id) \
        .execute()

    print(f"DEBUG: DB lookup for sponsor_id {sponsor_id}: {sponsor_check.data}")

    if not sponsor_check.data:
        raise HTTPException(
            status_code=400, 
            detail=f"User {sponsor_id} not found in database. Please complete onboarding."
        )

    if sponsor_check.data[0]["role"] != "sponsor":
        raise HTTPException(
            status_code=403, 
            detail="Only users with the 'sponsor' role can create challenges."
        )

    # All checks passed, create the challenge
    new_challenge_id = str(uuid.uuid4())
    
    challenge_data = {
        "id": new_challenge_id,
        "sponsor_id": str(sponsor_id),
        "title": challenge.title,
        "problem_statement": challenge.problem_statement,
        "prize_pool": challenge.prize_pool,
        "deadline": challenge.deadline.strftime("%Y-%m-%dT%H:%M:%S"),
        "is_live": True
    }
    
    print(f"DEBUG: Inserting challenge with data: {challenge_data}")

    result = supabase.table("challenges") \
        .insert(challenge_data) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save challenge to database")

    return result.data[0]


@router.get("/")
def get_all_challenges():
    response = supabase.table("challenges").select("*").execute()
    return response.data

@router.get("/my-challenges")
def get_sponsor_challenges(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing auth token")
    
    try:
        token = authorization.split(" ")[1]
        user_response = supabase.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid token session")
        sponsor_id = user_response.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Could not verify sponsor identity")

    response = supabase.table("challenges") \
        .select("*") \
        .eq("sponsor_id", str(sponsor_id)) \
        .execute()
    
    return response.data