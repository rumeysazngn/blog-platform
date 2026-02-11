import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

def recommend_cf(user_id, interactions, top_k=5):
    if not interactions:
        return []

    # Kullanıcı ve post id'leri
    user_ids = sorted(list(set([i["user_id"] for i in interactions])))
    post_ids = sorted(list(set([i["post_id"] for i in interactions])))

    if user_id not in user_ids:
        return []

    user_index = {u: idx for idx, u in enumerate(user_ids)}
    post_index = {p: idx for idx, p in enumerate(post_ids)}

    # Kullanıcı–post matrisi
    matrix = np.zeros((len(user_ids), len(post_ids)))
    for inter in interactions:
        ui = user_index[inter["user_id"]]
        pi = post_index[inter["post_id"]]
        matrix[ui][pi] = inter["value"]

    # Hedef kullanıcı hiç etkileşim yapmadıysa
    if matrix[user_index[user_id]].sum() == 0:
        return post_ids[:top_k]

    # Benzerlik matrisi
    similarity = cosine_similarity(matrix)
    similarity = np.nan_to_num(similarity)

    target_idx = user_index[user_id]
    user_scores = similarity[target_idx]

    weighted_scores = user_scores @ matrix

    # Zaten gördüklerini çıkar
    seen = matrix[target_idx] > 0
    weighted_scores[seen] = -9999

    # En iyi top_k öneri
    best_indices = np.argsort(weighted_scores)[::-1][:top_k]

    return [post_ids[i] for i in best_indices]
