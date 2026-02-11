"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContentBasedRecommendations = getContentBasedRecommendations;
exports.getCollaborativeFilteringRecommendations = getCollaborativeFilteringRecommendations;
const config_1 = require("../config");
const AI_URL = config_1.config.aiServiceUrl;
// ----------------------------
// 📌 İçerik Tabanlı Öneri (TF-IDF)
// ----------------------------
async function getContentBasedRecommendations(posts, targetPostId, topK = 5) {
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
async function getCollaborativeFilteringRecommendations(userId, interactions, topK = 5) {
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
