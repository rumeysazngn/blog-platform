# TF-IDF + Cosine Similarity içerik tabanlı öneri sistemi 
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from html import unescape
import re


def clean_text(text: str):
    """HTML, URL, <img>, <p> vb. tüm etiketleri temizler"""
    if not text:
        return ""

    # HTML tagleri sil
    text = re.sub(r"<[^>]*>", " ", text)

    # HTML entity decode
    text = unescape(text)

    # URL'leri kaldır
    text = re.sub(r"http\S+|www\S+", " ", text)

    # Sayıları, sembolleri normalize et (opsiyonel)
    text = re.sub(r"[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\s]", " ", text)

    # Fazla boşlukları temizle
    text = re.sub(r"\s+", " ", text).strip()

    return text


def get_similar_posts(posts, target_post_id, top_k=5):
    """
    posts: [
      { "id": 17, "title": "...", "content": "..." },
      { "id": 19, ... }
    ]
    """

    # -------------------------------
    # 0) Hedef ID kontrolü
    # -------------------------------
    post_ids = [p["id"] for p in posts]

    if target_post_id not in post_ids:
        # Hedef yazı listede yok → Crash yerine boş öneri döndür
        return []

    # -------------------------------
    # 1) İçerikleri temizle
    # -------------------------------
    cleaned_contents = [
        clean_text(p.get("content", "")) for p in posts
    ]

    # Eğer tüm içerikler boşsa → öneri yapılamaz
    if all(len(c.strip()) == 0 for c in cleaned_contents):
        return []

    # -------------------------------
    # 2) TF-IDF Modeli
    # -------------------------------
    try:
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform(cleaned_contents)
    except Exception:
       
        return []

    # -------------------------------
    # 3) Hedef postun indexini bul
    # -------------------------------
    target_index = post_ids.index(target_post_id)

    # -------------------------------
    # 4) Cosine similarity hesapla
    # -------------------------------
    similarities = cosine_similarity(
        tfidf_matrix[target_index],
        tfidf_matrix
    ).flatten()

    # -------------------------------
    # 5) Kendisi hariç en benzer top_k yazıyı seç
    # -------------------------------
    similar_indices = similarities.argsort()[::-1]  # Büyükten küçüğe sırala
    similar_indices = [
        i for i in similar_indices
        if i != target_index
    ][:top_k]

    # -------------------------------
    # 6) Sonuç olarak ID listesi döndür
    # -------------------------------
    recommended_ids = [post_ids[i] for i in similar_indices]

    return recommended_ids
