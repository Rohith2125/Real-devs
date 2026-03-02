import uuid
from fastapi import APIRouter
from models import UserCreate
from db import supabase

router = APIRouter()

@router.post("/create")
def create_user(user: UserCreate):

    # Check if email already exists
    existing = supabase.table("users") \
        .select("*") \
        .eq("email", user.email) \
        .execute()

    if existing.data:
        return existing.data[0]

    # Generate new user safely
    new_user = {
        "id": str(uuid.uuid4()),
        "email": user.email,
        "role": user.role,
        "company_name": user.company_name
    }

    response = supabase.table("users") \
        .insert(new_user) \
        .execute()

    return response.data[0]