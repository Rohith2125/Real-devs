from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from routes import users, challenges, submissions
from routes import enrollments
from routes import leaderboard
app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(challenges.router, prefix="/challenges", tags=["Challenges"])
app.include_router(submissions.router, prefix="/submissions", tags=["Submissions"])
app.include_router(enrollments.router, prefix="/enrollments", tags=["Enrollments"])
app.include_router(leaderboard.router, prefix="/leaderboard", tags=["Leaderboard"])

@app.get("/")
def root():
    return {"message": "AI Builders Platform Backend Running"}

