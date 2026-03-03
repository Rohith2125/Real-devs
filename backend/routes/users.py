import uuid
from fastapi import APIRouter, HTTPException
from models import UserCreate
from db import supabase

router = APIRouter()

@router.post("/create")
def create_user(user: UserCreate):
    # Search for user by ID or Email
    # Supabase Auth IDs are UUIDs. If we have a match by email but a different ID,
    # it means we have a stale record from a previous manual registration.
    
    # 1. Search by email first to find potential stale records
    existing_by_email = supabase.table("users") \
        .select("*") \
        .eq("email", user.email) \
        .execute()
    
    if existing_by_email.data:
        db_user = existing_by_email.data[0]
        
        # If the ID in our DB doesn't match the Supabase Auth ID, we need to correct it.
        # This prevents the "Sponsor not found" 400 error in challenges/create.
        if user.id and str(db_user["id"]) != str(user.id):
            print(f"DEBUG: Correcting stale ID for {user.email}: {db_user['id']} -> {user.id}")
            # Delete stale record and let the code below insert the fresh one with correct ID
            supabase.table("users").delete().eq("id", db_user["id"]).execute()
        else:
            # ID matches or isn't provided, just update fields
            updates = {}
            if user.company_name and not db_user.get("company_name"):
                updates["company_name"] = user.company_name
            if user.github_handle and not db_user.get("github_handle"):
                updates["github_handle"] = user.github_handle
            if user.role and db_user.get("role") != user.role:
                updates["role"] = user.role

            if updates:
                response = supabase.table("users") \
                    .update(updates) \
                    .eq("id", db_user["id"]) \
                    .execute()
                return response.data[0]
            
            return db_user

    # 2. Search by ID if still necessary (e.g. email didn't match but ID might)
    if user.id:
        existing_by_id = supabase.table("users") \
            .select("*") \
            .eq("id", str(user.id)) \
            .execute()
        if existing_by_id.data:
            return existing_by_id.data[0]

    # 3. Create fresh record with the provided (or generated) ID
    new_user_id = str(user.id) if user.id else str(uuid.uuid4())
    
    new_user = {
        "id": new_user_id,
        "email": user.email,
        "github_handle": user.github_handle,
        "role": user.role,
        "company_name": user.company_name
    }

    response = supabase.table("users") \
        .insert(new_user) \
        .execute()

    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to sync user to database")

    return response.data[0]