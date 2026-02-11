import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function EditProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    tam_ad: "",
    biyografi: "",
    profil_pic: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
        setUser({
          tam_ad: res.data.user.tam_ad || "",
          biyografi: res.data.user.biyografi || "",
          profil_pic: res.data.user.profil_pic || "",
        });
      } catch (err) {
        console.error("Profil bilgisi alınamadı:", err);
        alert("Bilgiler alınamadı. Lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put("/users/me", user);
      alert("✅ Profil başarıyla güncellendi!");

      // 🧭 Doğru profiline yönlendir
      const localUser = JSON.parse(localStorage.getItem("user"));
      if (localUser?.kullanici_id) {
        navigate(`/profile/${localUser.kullanici_id}`);
      } else {
        navigate("/"); // fallback
      }
    } catch (err) {
      console.error("Profil güncelleme hatası:", err);
      alert("❌ Profil güncellenemedi.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white py-16 px-4">
      <div className="max-w-3xl mx-auto backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-8">👤 Profili Düzenle</h1>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm text-white/70 mb-2">Tam Ad</label>
            <input
              type="text"
              name="tam_ad"
              value={user.tam_ad}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Adınızı girin"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">Biyografi</label>
            <textarea
              name="biyografi"
              value={user.biyografi}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-2">Profil Resmi URL</label>
            <input
              type="text"
              name="profil_pic"
              value={user.profil_pic}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="https://..."
            />
            {/* 🔹 Önizleme */}
            {user.profil_pic && (
              <img
                src={user.profil_pic}
                alt="Profil Önizleme"
                className="mt-4 w-32 h-32 rounded-full object-cover border border-white/20 mx-auto"
              />
            )}
          </div>

          <div className="flex gap-4 justify-end mt-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-lg border border-white/20 hover:bg-white/10 transition font-semibold"
            >
              ⮐ Geri
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 font-semibold hover:opacity-90 transition"
            >
              💾 Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
