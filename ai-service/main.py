from fastapi import FastAPI
from app.models import RecommendRequest, RecommendResponse,  CollaborativeRequest, CollaborativeResponse
from app.recommender import get_similar_posts
from app.collaborative import recommend_cf
from pydantic import BaseModel
from classifier import predict_text
app = FastAPI(
    title="Blog AI Recommendation Service",
    version="0.1.0",
    description="Blog platformu için yapay zeka öneri servisi"
)
class AnalyzeRequest(BaseModel):
    text: str

class AnalyzeResponse(BaseModel):
    label: str

@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-service"}


@app.post("/recommend/content-based", response_model=RecommendResponse)
def recommend_content_based(payload: RecommendRequest):
    recommended = get_similar_posts(
        posts=[p.dict() for p in payload.posts],
        target_post_id=payload.target_post_id,
        top_k=payload.top_k
    )

    return RecommendResponse(
        target_post_id=payload.target_post_id,
        recommended_post_ids=recommended
    )
@app.post("/recommend/collaborative", response_model=CollaborativeResponse)
def recommend_collaborative(payload: CollaborativeRequest):
    recommended = recommend_cf(
        user_id=payload.user_id,
        interactions=[i.dict() for i in payload.interactions],
        top_k=payload.top_k
    )

    return CollaborativeResponse(
        user_id=payload.user_id,
        recommended_post_ids=recommended
    )
@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(payload: AnalyzeRequest):
    label = predict_text(payload.text)
    return AnalyzeResponse(label=label)