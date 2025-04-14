from fastapi import FastAPI
from pydantic import BaseModel
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# ✅ Enable CORS for both local dev and live frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://shiftwavesales.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# test
# ✅ Define structure of incoming form data
class IntakeData(BaseModel):
    name: str
    email: str
    athlete_type: Literal["none", "college", "pro", "retired"]
    season_status: Literal["offseason", "inseason", "playoffs"]
    injured: Literal["yes", "no"]
    celebrity: Literal["yes", "no"]
    use_case: Literal["performance", "needs_based", "both"]

# ✅ Scoring logic
@app.post("/score")
async def score(data: IntakeData):
    score = 1.0  # Base

    if data.athlete_type == "college":
        score = max(score, 2.5)
    elif data.athlete_type == "pro":
        score = max(score, 3.0)
    elif data.athlete_type == "retired":
        score = max(score, 2.0)

    if data.season_status == "inseason":
        score += 1.0
    elif data.season_status == "playoffs":
        score += 2.0

    if data.injured == "yes":
        score += 1.0

    if data.use_case == "needs_based":
        score += 0.75
    elif data.use_case == "both":
        score += 0.5

    final_score = min(score, 7.0)

    return {
        "priority_score": round(final_score, 2),
        "message": "Scoring successful"
    }

@app.post("/privatescore")
async def score(data: IntakeData):
    score = 1.0  # Base

    if data.athlete_type == "college":
        score = max(score, 2.5)
    elif data.athlete_type == "pro":
        score = max(score, 3.0)
    elif data.athlete_type == "retired":
        score = max(score, 2.0)

    if data.season_status == "inseason":
        score += 1.0
    elif data.season_status == "playoffs":
        score += 2.0

    if data.celebrity == "yes":
        score += 1.0

    if data.use_case == "needs_based":
        score += 0.75
    elif data.use_case == "both":
        score += 0.5

    final_score = min(score, 7.0)

    return {
        "priority_score": round(final_score, 2),
        "message": "Scoring successful"
    }


#LEO AND KOL COMMENTS