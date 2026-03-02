from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class UserCreate(BaseModel):
    email: str
    github_handle: str
    role: str
    company_name: Optional[str] = None
    
class ChallengeCreate(BaseModel):
    title: str
    problem_statement: str
    prize_pool: float
    deadline: datetime
    sponsor_id: str


class EnrollmentCreate(BaseModel):
    user_id: UUID
    challenge_id: UUID


class SubmissionCreate(BaseModel):
    user_id: UUID
    challenge_id: UUID
    repo_url: str
    pitch_deck_url: str
    demo_video_url: str

class EnrollmentCreate(BaseModel):
    user_id: UUID
    challenge_id: UUID

class UserCreate(BaseModel):
    email: str
    role: str
    company_name: Optional[str] = None