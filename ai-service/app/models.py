from pydantic import BaseModel
from typing import List

class PostModel(BaseModel):
    id: int
    title: str
    content: str

class RecommendRequest(BaseModel):
    posts: List[PostModel]
    target_post_id: int
    top_k: int = 5

class RecommendResponse(BaseModel):
    target_post_id: int
    recommended_post_ids: List[int]

class Interaction(BaseModel):
    user_id: int
    post_id: int
    value: int = 1   # varsayılan etkileşim değeri

class CollaborativeRequest(BaseModel):
    user_id: int
    interactions: List[Interaction]
    top_k: int = 5

class CollaborativeResponse(BaseModel):
    user_id: int
    recommended_post_ids: List[int]
