from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional, Literal
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS
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

# Define form data structure
class IntakeData(BaseModel):
    name: str
    email: str
    athlete_type: Optional[Literal["none", "college", "pro", "retired"]] = None
    season_status: Optional[Literal["offseason", "inseason", "playoffs", "not_applicable"]] = None
    injured: Optional[Literal["no", "minor", "serious"]] = None
    use_case: Optional[Literal["performance", "recovery", "mental_health", "all"]] = None
    referral_source: Optional[str] = None
    repeat_customer: Optional[bool] = None
    public_influence: Optional[Literal["none", "moderate", "high", "top_100"]] = None
    urgency: Optional[Literal["low", "moderate", "high", "code_red"]] = None
    purchase_scope: Optional[Literal["1", "2-5", "6+"]] = None
    represents_group: Optional[Literal["no", "team", "franchise"]] = None
    system_broken: Optional[Literal["no", "yes", "not_applicable"]] = None
    customer_type: Optional[str] = None
    additional_notes: Optional[str] = None

@app.post("/score")
async def score(data: IntakeData):
    score = 1.0  # Base score

    # ➕ Additive scoring logic
    if data.athlete_type == "college":
        score += 2.0
    elif data.athlete_type == "pro":
        score += 3.0
    elif data.athlete_type == "retired":
        score += 1.5

    if data.injured == "minor":
        score += 1.0
    elif data.injured == "serious":
        score += 2.0

    if data.use_case == "recovery":
        score += 1.0
    elif data.use_case == "mental_health":
        score += 1.5
    elif data.use_case == "all":
        score += 2.0

    if data.repeat_customer:
        score += 0.75

    if data.public_influence == "moderate":
        score += 1.0
    elif data.public_influence == "high":
        score += 2.0
    elif data.public_influence == "top_100":
        score += 2.5

    if data.purchase_scope == "2-5":
        score += 1.0
    elif data.purchase_scope == "6+":
        score += 2.0

    if data.represents_group == "team":
        score += 1.5
    elif data.represents_group == "franchise":
        score += 2.5

    if data.system_broken == "no":
        score -= 0.5

    # ✴️ Multipliers
    season_multiplier = {
        "offseason": 1.0,
        "inseason": 1.1,
        "playoffs": 1.25,
        "not_applicable": 1.0
    }.get(data.season_status, 1.0)

    urgency_multiplier = {
        "low": 1.0,
        "moderate": 1.05,
        "high": 1.1,
        "code_red": 1.3
    }.get(data.urgency, 1.0)

    broken_multiplier = 1.3 if data.system_broken == "yes" else 1.0

    # Final score with multipliers applied
    final_score = score * season_multiplier * urgency_multiplier * broken_multiplier

    return {
        "priority_score": final_score,
        "message": "Scoring successful"
    }
