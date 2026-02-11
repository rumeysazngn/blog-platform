import { config } from "../config";

const AI_URL = config.aiServiceUrl;

// ----------------------------
// 📌 İçerik Tabanlı Öneri (TF-IDF)
// ----------------------------
export async function getContentBasedRecommendations(posts: any[], targetPostId: number, topK = 5) {
  const response = await fetch(`${AI_URL}/recommend/content-based`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      posts,
      target_post_id: targetPostId,
      top_k: topK,
    }),
  });

  return await response.json();
}

// ----------------------------
// 📌 Collaborative Filtering
// ----------------------------
export async function getCollaborativeFilteringRecommendations(userId: number, interactions: any[], topK = 5) {
  const response = await fetch(`${AI_URL}/recommend/collaborative`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      interactions,
      top_k: topK,
    }),
  });

  return await response.json();
}
