import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Eye, Trash2, RefreshCcw, Search } from "lucide-react";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [search, setSearch] = useState("");

  const fetchPosts = async () => {
    try {
      const res = await api.get("/admin/posts");
      if (res.data.success) setPosts(res.data.posts);
    } catch (err) {
      console.error("Admin post fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (id) => {
    if (!confirm("Bu yazıyı silmek istediğine emin misin?")) return;

    try {
      await api.delete(`/admin/posts/${id}`);
      setPosts(posts.filter((p) => p.yazi_id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Silinemedi");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "yayinda" ? "taslak" : "yayinda";

    try {
      await api.put(`/admin/posts/${id}/status`, { durum: newStatus });

      setPosts(
        posts.map((p) =>
          p.yazi_id === id ? { ...p, durum: newStatus } : p
        )
      );
    } catch (err) {
      console.error("Status update error:", err);
      alert("Durum değiştirilemedi");
    }
  };

  const filteredPosts = posts.filter((p) =>
    p.baslik.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-10">

      {/* HEADER */}
      <div className="bg-white shadow-lg p-6 rounded-2xl flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📝 Yazı Yönetimi</h1>
          <p className="text-gray-500 mt-1">Yayınlanan ve taslak yazıları yönetin.</p>
        </div>

        <div className="px-4 py-2 bg-indigo-600 text-white rounded-full shadow">
          Toplam Yazı: {posts.length}
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-md">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Başlık ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 outline-none"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-4">#</th>
              <th className="p-4">Başlık</th>
              <th className="p-4">Yazar</th>
              <th className="p-4">Kategori</th>
              <th className="p-4">Durum</th>
              <th className="p-4">İşlemler</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-400">
                  Yükleniyor...
                </td>
              </tr>
            ) : filteredPosts.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-400">
                  Yazı bulunamadı.
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => {

                // 🔍 BURADA LOG VAR → Konsolda kategori yapısı görünecek!
                console.log("POST OBJESİ:", post);

                return (
                  <tr key={post.yazi_id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4">{post.yazi_id}</td>

                    <td className="p-4 font-semibold">{post.baslik}</td>

                    {/* Yazar */}
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
                        {post.kullanicilar?.kullanici_adi?.charAt(0).toUpperCase()}
                      </div>
                      @{post.kullanicilar?.kullanici_adi}
                    </td>

                    {/* KATEGORİ */}
                    <td className="p-4">
                      {post.yazi_kategorileri?.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                          {post.yazi_kategorileri.map((k, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                            >
                              {k.kategoriler.ad}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">Kategori Yok</span>
                      )}
                    </td>

                    {/* DURUM */}
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          post.durum === "yayinda"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {post.durum.toUpperCase()}
                      </span>
                    </td>

                    {/* İŞLEMLER */}
                    <td className="p-4 flex gap-3">
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition shadow"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => toggleStatus(post.yazi_id, post.durum)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow"
                      >
                        <RefreshCcw size={18} />
                      </button>

                      <button
                        onClick={() => deletePost(post.yazi_id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-[90%] max-w-3xl max-h-[85vh] overflow-y-auto animate-fadeIn">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedPost.baslik}</h2>

              <button
                onClick={() => setSelectedPost(null)}
                className="text-gray-600 hover:text-red-500 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: selectedPost.icerik }} />
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 shadow"
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
