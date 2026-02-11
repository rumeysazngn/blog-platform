# classifier.py
import re
from html import unescape
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB


# --- 1) HAFİF EĞİTİM SETİ (BARİZ ÖRNEKLER) ----

normal_texts = [
    "bugün dışarıda yürüyüş yaptım ve hava çok güzeldi",
    "sağlıklı beslenmek insanı daha enerjik hissettirir",
    "çocukların dil gelişimi üzerine bir makale yazıyorum",
    "kitap okumak zihni sakinleştirir ve bilgi kazandırır",
    "spor yapmak ruh sağlığını olumlu etkiler",
]

spam_texts = [
    "bedava para kazan hemen tıkla",
    "bahis oyna yüksek oran casino",
    "yüksek bonus kampanyası kaçırma",
    "ücretsiz hediye fırsatı için hemen tıkla",
    "para yatır anında kazan",
]

hate_texts = [
    "senden nefret ediyorum",
    "sen çok aptal bir insansın",
    "bu insanların hepsi salak",
    "seni yok edeceğim terbiyesiz",
    "bu grup tamamen gerizekalı",
]


train_texts = normal_texts + spam_texts + hate_texts

train_labels = (
    ["normal"] * len(normal_texts)
    + ["spam"] * len(spam_texts)
    + ["hate"] * len(hate_texts)
)


# --- 2) TEMİZLEME FONKSİYONU ---

def clean(text: str):
    text = unescape(text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip().lower()


texts_cleaned = [clean(t) for t in train_texts]

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts_cleaned)

model = MultinomialNB()
model.fit(X, train_labels)


# --- 3) HIZLI TAHMİN ALGORİTMASI ---

def predict_text(text: str):
    cleaned = clean(text)

    # Çok kısa metinler 
    if len(cleaned.split()) < 8:
        return "normal"

    # Spam kelime sinyali 
    spam_keywords = ["kazan", "bahis", "casino", "bonus", "kampanya", "tıkla"]
    if any(word in cleaned for word in spam_keywords):
        return "spam"

    # Nefret söylemi kontrolü
    hate_keywords = ["aptal", "salak", "nefret", "gerizekalı", "öldür", "yok et"]
    if any(word in cleaned for word in hate_keywords):
        return "hate"

    # Model tahmini
    X_test = vectorizer.transform([cleaned])
    pred = model.predict(X_test)[0]

    return pred
