from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime


class UserCreate(BaseModel):
    id: Optional[UUID] = None
    email: str
    github_handle: Optional[str] = None
    role: str
    company_name: Optional[str] = None

class ChallengeCreate(BaseModel):
    sponsor_id: Optional[UUID] = None
    title: str
    problem_statement: str
    prize_pool: float
    deadline: datetime
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "sponsor_id": "550e8400-e29b-41d4-a716-446655440000",
                "title": "Build a RAG app",
                "problem_statement": "Create a robust RAG system...",
                "prize_pool": 1000.0,
                "deadline": "2025-12-31T23:59:59Z"
            }
        }
    )


class EnrollmentCreate(BaseModel):
    user_id: UUID
    challenge_id: UUID


class SubmissionCreate(BaseModel):
    user_id: UUID
    challenge_id: UUID
    repo_url: str
    pitch_deck_url: str
    demo_video_url: str