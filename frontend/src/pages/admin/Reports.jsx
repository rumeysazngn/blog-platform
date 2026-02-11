import { useEffect, useState } from "react";
import api from "../../api/axios";

// --- SPAM / HATE KELİME LİSTELERİ ---
const SPAM_WORDS = ["kazan", "bahis", "casino", "bonus", "kampanya", "tıkla", "bedava", "para"];
const HATE_WORDS = ["aptal", "salak", "nefret", "gerizekalı", "öldür", "yok et", "terbiyesiz"];

// --- HTML İçerikte kelime highlight etme ---
function highlightContent(html) {
  if (!html) return "";

  let highlighted = html;

  SPAM_WORDS.forEach((word) => {
    const regex = new RegExp(word + "\\w*", "gi"); // kelime köküne göre highlight
    highlighted = highlighted.replace(
      regex,
      `<span style="background:#fee2e2; color:#dc2626; font-weight:bold; padding:2px 4px; border-radius:4px;">$&</span>`
    );
  });

  HATE_WORDS.forEach((word) => {
    const regex = new RegExp(word + "\\w*", "gi");
    highlighted = highlighted.replace(
      regex,
      `<span style="background:#fde68a; color:#b45309; font-weight:bold; padding:2px 4px; border-radius:4px;">$&</span>`
    );
  });

  return highlighted;
}

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");

  // İçerik Modal State
  const [selectedContent, setSelectedContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await api.get("/reports");
      if (res.data.success) setReports(res.data.reports);
    } catch (err) {
      console.error("Raporlar alınamadı:", err);
    }
  };

  const updateStatus = async (id, durum) => {
    try {
      await api.put(`/reports/${id}`, { durum });
      fetchReports();
    } catch {
      alert("Durum güncellenemedi");
    }
  };

  const deleteTarget = async (reportId) => {
    if (!confirm("İçeriği silmek istediğine emin misin?")) return;
    try {
      await api.delete(`/reports/delete-target/${reportId}`);
      fetchReports();
    } catch {
      alert("Silinemedi");
    }
  };

  // İçeriği API'dan çek
  const fetchContent = async (postId) => {
    setContentLoading(true);
    try {
      const res = await api.get(`/posts/${postId}`);
      if (res.data.success) {
        const highlighted = highlightContent(res.data.post.icerik);
        setSelectedContent({ ...res.data.post, highlighted });
      }
    } catch {
      alert("İçerik yüklenemedi.");
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports =
    filter === "all" ? reports : reports.filter((r) => r.rapor_neden === filter);

  return (
    <div className="p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between bg-white shadow-xl rounded-2xl px-8 py-6 mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          🛡️ AI İçerik Moderasyon Sistemi
        </h1>
        <span className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow-md">
          🤖 AI Destekli
        </span>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500 text-sm font-semibold">Bekleyen Raporlar</h3>
          <div className="text-3xl font-bold text-yellow-500">
            {reports.filter((r) => r.durum === "beklemede").length}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500 text-sm font-semibold">Spam Tespitleri</h3>
          <div className="text-3xl font-bold text-red-500">
            {reports.filter((r) => r.rapor_neden === "spam").length}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500 text-sm font-semibold">Nefret İçeriği</h3>
          <div className="text-3xl font-bold text-red-700">
            {reports.filter((r) => r.rapor_neden === "hate").length}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-gray-500 text-sm font-semibold">Toplam Rapor</h3>
          <div className="text-3xl font-bold text-indigo-600">{reports.length}</div>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex gap-4 mb-6">
        {[
          { key: "all", label: "Tümü" },
          { key: "spam", label: "Spam" },
          { key: "hate", label: "Nefret İçeriği" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-5 py-2 rounded-full border font-semibold transition ${
              filter === f.key
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* REPORT CARDS */}
      <div className="space-y-6">
        {filteredReports.length === 0 ? (
          <div className="text-center text-gray-500 py-20 bg-white rounded-2xl shadow-md">
            <div className="text-6xl mb-4">📭</div>
            Hiç rapor bulunamadı.
          </div>
        ) : (
          filteredReports.map((r) => (
            <div
              key={r.rapor_id}
              className={`bg-white p-6 rounded-2xl shadow-lg border-l-8 ${
                r.rapor_neden === "spam"
                  ? "border-red-500"
                  : r.rapor_neden === "hate"
                  ? "border-red-700"
                  : "border-yellow-500"
              }`}
            >
              <div className="flex justify-between">
                <h2 className="text-xl font-bold">
                  #{r.rapor_id} – {r.hedef_tur.toUpperCase()} (ID: {r.hedef_id})
                </h2>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    r.rapor_neden === "spam"
                      ? "bg-red-100 text-red-600"
                      : r.rapor_neden === "hate"
                      ? "bg-red-200 text-red-800"
                      : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {r.rapor_neden}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl grid grid-cols-3 gap-4 my-4">
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Raporlayan</p>
                  <p className="font-medium">
                    @{r.kullanicilar_raporlar_raporlayan_idTokullanicilar?.kullanici_adi}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-semibold">Durum</p>
                  <p className="font-medium">{r.durum}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-semibold">Hedef İçerik ID</p>
                  <p className="font-medium">{r.hedef_id}</p>
                </div>
              </div>

              {r.aciklama && (
                <div className="bg-yellow-50 p-3 border-l-4 border-yellow-400 rounded">
                  <strong>Açıklama:</strong> {r.aciklama}
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => fetchContent(r.hedef_id)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow"
                >
                  📄 İçeriği Gör
                </button>

                <button
                  onClick={() => updateStatus(r.rapor_id, "incelendi")}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 shadow"
                >
                  ✓ İncele & Onayla
                </button>

                <button
                  onClick={() => updateStatus(r.rapor_id, "reddedildi")}
                  className="px-4 py-2 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-700 shadow"
                >
                  Reddet
                </button>

                <button
                  onClick={() => deleteTarget(r.rapor_id)}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 shadow"
                >
                  🗑 İçeriği Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- CONTENT MODAL --- */}
      {selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-4xl max-h-[85vh] overflow-y-auto">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                📄 {selectedContent.baslik}
              </h2>

              <button
                onClick={() => setSelectedContent(null)}
                className="text-gray-600 hover:text-red-500 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-sm text-gray-500 mb-2">
              <strong>Yazar:</strong> @{selectedContent.kullanicilar?.kullanici_adi}
            </div>

            <div className="mb-6 text-sm text-gray-500">
              <strong>Kategori:</strong>{" "}
              {selectedContent.yazi_kategorileri
                ?.map((k) => k.kategoriler.ad)
                .join(", ")}
            </div>

            {/* ✔✔✔ Highlight edilmiş içerik burada ✔✔✔ */}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedContent.highlighted }}
            />

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedContent(null)}
                className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 shadow"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
