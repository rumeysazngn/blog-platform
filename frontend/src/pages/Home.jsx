import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [recommendedIds, setRecommendedIds] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  // Kategori listesi (ikon vs için)
  const [categories, setCategories] = useState([]);

  // Kullanıcı
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.kullanici_id;

  // Tüm kategoriler
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        if (res.data.success) setCategories(res.data.kategoriler);
      } catch (err) {
        console.error("Kategori yüklenemedi:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error("❌ Yazılar alınamadı:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!userId) {
      setLoadingRecs(false);
      return;
    }

    try {
      const res = await api.get(`/posts/recommend/user/${userId}`);
      setRecommendedIds(res.data.recommendations || []);
    } catch (err) {
      console.error("❌ Öneriler alınamadı:", err.response?.data || err.message);
    } finally {
      setLoadingRecs(false);
    }
  };

  // ⭐ Çoklu kategori gösterim — ilk kategori + diğerleri için +N
  const renderCategoryBadge = (yazi_kategorileri) => {
    if (!yazi_kategorileri || yazi_kategorileri.length === 0) return null;

    const first = yazi_kategorileri[0];
    const firstCat = first.kategoriler;
    const extra = yazi_kategorileri.length - 1;

    return (
      <div className="inline-flex items-center gap-2 mb-2">
        <Link
          to={`/kategori/${firstCat.kategori_id}`}
          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-purple-600/80 border border-purple-400/50 hover:bg-purple-700 transition"
        >
          {firstCat.ikon && <span>{firstCat.ikon}</span>}
          <span>{firstCat.ad}</span>
        </Link>

        {extra > 0 && (
          <span className="text-sm text-gray-300 font-semibold">+{extra}</span>
        )}
      </div>
    );
  };

  const recommendedPosts = posts.filter((p) =>
    recommendedIds.includes(p.yazi_id)
  );

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">


      {/* HERO ------------------------- */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden ">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-sm text-gray-200">AI-Powered Blog Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-gradient">
              Fikirlerin
            </span>
            <br />
            <span className="text-white">Dijital Evi</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Yapay zeka ile güçlendirilmiş, sana özel içerik önerileriyle
            <span className="text-cyan-400 font-semibold"> yeni nesil </span>
            blog deneyimi
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#posts"
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full font-semibold text-white hover:scale-105 transition"
            >
              Yazıları Keşfet →
            </a>

            <Link
              to="/create"
              className="px-8 py-4 rounded-full font-semibold text-white border-2 border-white/20 hover:bg-white/10 transition"
            >
              Yazı Yaz ✍️
            </Link>
          </div>
        </div>
      </section>

      {/* POSTS SECTION ----------------------- */}
      <section id="posts" className="relative py-24 ">
        <div className="w-full px-4 md:px-8">


          {/* 🎯 Sana Özel Öneriler */}
          {userId && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-3">Sana Özel</h2>
              <p className="text-gray-400 text-sm mb-6">
                Yapay zekanın senin için seçtiği yazılar.
              </p>

              {loadingRecs || loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-10 w-10 border-t-2 border-b-2 border-cyan-400 rounded-full"></div>
                </div>
              ) : recommendedPosts.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  Beğeniler geldikçe öneriler burada görünecek ✨
                </p>
              ) : (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {recommendedPosts.map((post) => {
                    const imageUrl = post.kapak_resmi
                      ? `http://localhost:5000${post.kapak_resmi}`
                      : null;

                    return (
                      <article
                        key={post.yazi_id}
                        className="group bg-white/10 border border-cyan-400/40 rounded-2xl overflow-hidden hover:scale-105 hover:shadow-cyan-400/30 transition"
                      >
                        <div className="relative h-52 overflow-hidden">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={post.baslik}
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-5xl">⭐</span>
                            </div>
                          )}
                        </div>

                        <div className="p-5">
                          
                          {renderCategoryBadge(post.yazi_kategorileri)}

                          <h3 className="text-lg font-bold text-white mb-2">
                            {post.baslik}
                          </h3>

                          <p className="text-gray-300 text-sm line-clamp-3">
                            {post.alt_baslik || post.icerik?.slice(0, 100) + "..."}
                          </p>

                          <div className="flex justify-between mt-3">
                            <span className="text-gray-400 text-xs">
                              {post.kullanicilar?.kullanici_adi}
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
          )}

          {/* 🔻 Son Yazılar */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Son Yazılar</h2>
            <p className="text-gray-400 text-lg">
              {loading ? "Yükleniyor..." : `${posts.length} yazı bulundu`}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-cyan-400 rounded-full"></div>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const imageUrl = post.kapak_resmi
                  ? `http://localhost:5000${post.kapak_resmi}`
                  : null;

                return (
                  <article
                    key={post.yazi_id}
                    className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:scale-105 hover:shadow-purple-500/20 transition"
                  >
                    <div className="relative h-56 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={post.baslik}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-purple-500 to-cyan-600 flex items-center justify-center">
                          <span className="text-white text-6xl">📝</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      
                      {renderCategoryBadge(post.yazi_kategorileri)}

                      <h3 className="text-xl font-bold text-white mb-3">
                        {post.baslik}
                      </h3>

                      <p className="text-gray-400 line-clamp-3">
                        {post.alt_baslik || post.icerik?.slice(0, 100) + "..."}
                      </p>

                      <div className="flex justify-between mt-4">
                        <span className="text-gray-400 text-sm">
                          @{post.kullanicilar?.kullanici_adi}
                        </span>

                        <Link
                          to={`/post/${post.slug}`}
                          className="text-cyan-400 text-sm hover:underline"
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
