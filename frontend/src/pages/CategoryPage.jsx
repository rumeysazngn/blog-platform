import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [kategori, setKategori] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const res = await api.get(`/categories/${id}`);

        if (!res.data.success) {
          setKategori(null);
          setLoading(false);
          return;
        }

        setKategori(res.data.kategori);
        setPosts(res.data.yazilar || []);
      } catch (err) {
        console.error("Kategori yüklenemedi:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center text-white">
        <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-purple-400 rounded-full"></div>
        <p className="mt-4 text-gray-300">Yükleniyor...</p>
      </div>
    );
  }

  if (!kategori) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col justify-center items-center text-white">
        <h1 className="text-3xl font-bold mb-4">Kategori bulunamadı</h1>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
        >
          Ana sayfaya dön
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">

      {/* ⭐ HERO ALANI */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">

          {/* Breadcrumb */}
          <div className="text-gray-300 mb-6 text-sm flex justify-center gap-2">
            <Link to="/" className="hover:text-white">Ana Sayfa</Link>
            <span>›</span>
            <span className="text-purple-300">{kategori.ad}</span>
          </div>

          <h1 className="text-5xl font-extrabold mb-4">
            {kategori.ikon && <span className="text-5xl mr-2">{kategori.ikon}</span>}
            {kategori.ad}
          </h1>

          {kategori.aciklama && (
            <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
              {kategori.aciklama}
            </p>
          )}
        </div>
      </section>

      {/* ⭐ YAZILAR */}
      <section className="py-10 px-4">
        <div className="max-w-7xl mx-auto">

          {posts.length === 0 ? (
            <p className="text-gray-400 text-lg">Bu kategoride henüz yazı yok.</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

              {posts.map((post) => {
                const imageUrl = post.kapak_resmi
                  ? `http://localhost:5000${post.kapak_resmi}`
                  : null;

                return (
                  <article
                    key={post.yazi_id}
                    className="group bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg overflow-hidden hover:scale-[1.03] hover:shadow-cyan-400/20 transition"
                  >
                    <div className="relative h-52 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={post.baslik}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-purple-500 to-cyan-600 flex items-center justify-center">
                          <span className="text-white text-5xl">📝</span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      
                      {/* Kategori Etiketi */}
                      <span className="inline-block mb-2 px-3 py-1 text-xs font-semibold rounded-full bg-purple-600/80 border border-purple-400/50">
                        {kategori.ad}
                      </span>

                      <h3 className="text-xl font-bold text-white mb-2">
                        {post.baslik}
                      </h3>

                      <p className="text-gray-300 text-sm line-clamp-3">
                        {post.alt_baslik || post.icerik?.slice(0, 100) + "..."}
                      </p>

                      <div className="flex justify-between items-center mt-4">
                        <span className="text-gray-400 text-sm">
                          @{post.kullanicilar?.kullanici_adi}
                        </span>

                        <Link
                          to={`/post/${post.slug}`}
                          className="text-cyan-300 text-sm hover:underline"
                        >
                          Oku →
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
