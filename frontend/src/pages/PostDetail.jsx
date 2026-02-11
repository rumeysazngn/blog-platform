import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import GridBackground from "../components/GridBackground"; // Arka plan bileşenini unutma

export default function PostDetail() {
  const { slug } = useParams();
  
  // Data States
  const [post, setPost] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState(null);
  const [targetId, setTargetId] = useState(null);
  const [reportText, setReportText] = useState("");

  // Related Posts
  const [relatedIds, setRelatedIds] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // 🟢 1. Okuma İlerleme Çubuğu (Scroll Listener)
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔹 Veri Çekme (Mevcut mantık korundu)
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [postRes, likeRes, commentRes] = await Promise.all([
          api.get(`/posts/${slug}`),
          api.get(`/likes/post/${slug}`),
          api.get(`/comments/post/${slug}`),
        ]);

        if (postRes.data?.success) setPost(postRes.data.post);
        if (likeRes.data?.success) {
          setLikes(likeRes.data.count || 0);
          setLiked(likeRes.data.liked || false);
        }
        if (commentRes.data?.success) {
          setComments(Array.isArray(commentRes.data.comments) ? commentRes.data.comments : []);
        }
      } catch (err) {
        console.error("Veriler yüklenemedi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [slug]);

  // 🔹 Benzer Yazılar ID
  useEffect(() => {
    if (!post?.yazi_id) return;
    api.get(`/posts/${post.yazi_id}/recommend`)
      .then((res) => setRelatedIds(res.data.recommended || []))
      .catch((err) => console.error(err));
  }, [post]);

  // 🔹 Benzer Yazılar Detay
  useEffect(() => {
    if (relatedIds.length > 0) {
      Promise.all(relatedIds.map((id) => api.get(`/posts/${id}`)))
        .then((results) => {
          setRelatedPosts(results.map((r) => r.data.post).filter(Boolean));
        })
        .catch((err) => console.error(err));
    }
  }, [relatedIds]);

  // Aksiyonlar
  const toggleLike = async () => {
    try {
      const res = await api.post(`/likes/post/${slug}/toggle`);
      if (res.data?.success) {
        setLiked(res.data.liked);
        setLikes((p) => (res.data.liked ? p + 1 : p - 1));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendComment = async () => {
    if (!newComment.trim()) return alert("Yorum boş olamaz.");
    try {
      const res = await api.post(`/comments/post/${slug}`, { yorum_icerigi: newComment });
      if (res.data?.success) {
        setComments((prev) => [res.data.yorum, ...prev]);
        setNewComment("");
      }
    } catch (err) {
      alert("Yorum gönderilemedi.");
    }
  };

  const handleDeleteComment = async (yorumId) => {
    if (!window.confirm("Silmek istediğine emin misin?")) return;
    try {
      const res = await api.delete(`/comments/${yorumId}`);
      if (res.data?.success) {
        setComments((prev) => prev.filter((y) => y.yorum_id !== yorumId));
      }
    } catch (err) {
      alert("Silinemedi.");
    }
  };

  const openReportModal = (type, id) => {
    setReportType(type);
    setTargetId(id);
    setShowReportModal(true);
  };

  const sendReport = async () => {
    try {
      await api.post(`/reports/${reportType}/${targetId}`, { neden: "uygunsuz", aciklama: reportText });
      alert("Rapor iletildi. Teşekkürler.");
      setShowReportModal(false);
      setReportText("");
    } catch (err) {
      alert("Hata oluştu.");
    }
  };

  // --- RENDER ---

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-slate-900 text-cyan-400">
      <div className="animate-spin w-16 h-16 border-4 border-current border-t-transparent rounded-full"></div>
    </div>
  );

  if (!post) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
      <h2 className="text-3xl font-bold mb-4">😕 Yazı Bulunamadı</h2>
      <Link to="/" className="text-cyan-400 hover:underline">Anasayfaya Dön</Link>
    </div>
  );

  const author = post.kullanicilar || {};
  const imageUrl = post.kapak_resmi ? `http://localhost:5000${post.kapak_resmi}` : null;
  const formattedDate = new Date(post.yayinlanma_tarihi || post.olusturma_tarihi).toLocaleDateString("tr-TR", { dateStyle: "long" });

  return (
    <div className="min-h-screen relative text-gray-200 font-sans selection:bg-cyan-500/30">
      <GridBackground />

      {/* 🟢 İLERLEME ÇUBUĞU */}
      <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 z-[60]" style={{ width: `${scrollProgress}%` }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 lg:py-16">

        {/* --- HEADER --- */}
        <header className="mb-10 text-center">
          {/* Kategori Badge */}
          {post.yazi_kategorileri?.[0] && (
            <Link to={`/kategori/${post.yazi_kategorileri[0].kategoriler.kategori_id}`} className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider uppercase text-cyan-300 bg-cyan-900/30 border border-cyan-500/30 rounded-full hover:bg-cyan-900/50 transition">
              {post.yazi_kategorileri[0].kategoriler.ad}
            </Link>
          )}

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-gray-200 to-gray-400">
            {post.baslik}
          </h1>

          {post.alt_baslik && (
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              {post.alt_baslik}
            </p>
          )}

          {/* Yazar Bilgisi */}
          <div className="flex items-center justify-center gap-4">
             <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-white">
                    {author.kullanici_adi?.substring(0,2).toUpperCase()}
                </div>
             </div>
             <div className="text-left">
                <p className="text-white font-semibold">{author.tam_ad || author.kullanici_adi}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <span>{post.okuma_suresi || 5} dk okuma</span>
                </div>
             </div>
          </div>
        </header>

        {/* --- KAPAK RESMİ --- */}
        {imageUrl && (
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden mb-12 border border-white/10 shadow-2xl shadow-purple-500/10">
            <img src={imageUrl} alt={post.baslik} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
          </div>
        )}

        {/* --- İÇERİK (PROSE) --- */}
        <div className="relative flex gap-10">
           
           {/* Sol Taraf (Sabit Paylaş Butonları - Desktop) */}
           <aside className="hidden lg:flex flex-col gap-4 sticky top-32 h-fit">
              <button onClick={toggleLike} className={`group flex flex-col items-center gap-1 p-3 rounded-full border transition-all ${liked ? 'bg-pink-500/20 border-pink-500 text-pink-500' : 'bg-slate-800/50 border-white/10 text-gray-400 hover:text-white hover:border-white/30'}`}>
                 <span className="text-2xl">{liked ? "❤️" : "🤍"}</span>
                 <span className="text-xs font-bold">{likes}</span>
              </button>
              
              <button className="p-3 rounded-full bg-slate-800/50 border border-white/10 text-gray-400 hover:text-cyan-400 hover:border-cyan-400 transition" title="Paylaş">
                 🔗
              </button>

              <button onClick={() => openReportModal("post", post.yazi_id)} className="p-3 rounded-full bg-slate-800/50 border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-400 transition" title="Şikayet Et">
                 🚩
              </button>
           </aside>

           {/* Ana Metin */}
           <article className="flex-1 prose prose-invert prose-lg max-w-none 
              prose-headings:font-bold prose-headings:text-gray-100 
              prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline 
              prose-strong:text-white 
              prose-code:text-pink-300 prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded 
              prose-pre:bg-slate-950 prose-pre:border prose-pre:border-white/10
              prose-img:rounded-2xl prose-img:border prose-img:border-white/10
              prose-blockquote:border-l-cyan-500 prose-blockquote:bg-white/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg">
              
              <div dangerouslySetInnerHTML={{ __html: post.icerik }} />
           </article>
        </div>

        {/* --- MOBİL İÇİN ALT BAR (Sticky) --- */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-800/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl">
            <button onClick={toggleLike} className="flex items-center gap-2 text-white font-bold">
                 <span>{liked ? "❤️" : "🤍"}</span>
                 <span>{likes}</span>
            </button>
            <div className="w-px h-6 bg-white/10"></div>
            <button onClick={() => openReportModal("post", post.yazi_id)} className="text-gray-300 hover:text-red-400">🚩</button>
        </div>

        {/* --- YORUMLAR --- */}
        <div className="mt-20 pt-10 border-t border-white/10">
          <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            💬 Yorumlar <span className="text-gray-500 text-lg">({comments.length})</span>
          </h3>

          <div className="flex gap-4 mb-10">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-sm font-bold">
               {currentUser?.kullanici_adi?.substring(0,2) || "?"}
            </div>
            <div className="flex-1">
               <textarea
                 value={newComment}
                 onChange={(e) => setNewComment(e.target.value)}
                 placeholder="Düşüncelerini paylaş..."
                 className="w-full bg-slate-800/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition resize-none h-24"
               />
               <div className="flex justify-end mt-2">
                 <button onClick={sendComment} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition shadow-lg shadow-cyan-500/20">
                    Yorum Yap
                 </button>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            {comments.map((c) => (
              <div key={c.yorum_id} className="group flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center font-bold text-white shadow-lg">
                    {c.kullanicilar?.kullanici_adi?.substring(0,2)}
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                       <h4 className="font-bold text-gray-200">{c.kullanicilar?.tam_ad || c.kullanicilar?.kullanici_adi}</h4>
                       <span className="text-xs text-gray-500">{new Date(c.olusturma_tarihi).toLocaleDateString("tr-TR")}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed text-sm">{c.yorum_icerigi}</p>
                    
                    <div className="flex gap-4 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openReportModal("comment", c.yorum_id)} className="text-xs text-red-400 hover:underline">Şikayet Et</button>
                        {currentUser?.kullanici_id === c.kullanicilar?.kullanici_id && (
                           <button onClick={() => handleDeleteComment(c.yorum_id)} className="text-xs text-gray-400 hover:text-white">Sil</button>
                        )}
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- BENZER YAZILAR --- */}
        {relatedPosts.length > 0 && (
           <div className="mt-20">
              <h3 className="text-2xl font-bold mb-6 text-white border-l-4 border-purple-500 pl-4">Bunları da beğenebilirsin</h3>
              <div className="grid md:grid-cols-2 gap-6">
                 {relatedPosts.map(rp => {
                    const rpImg = rp.kapak_resmi ? `http://localhost:5000${rp.kapak_resmi}` : null;
                    return (
                       <Link key={rp.yazi_id} to={`/post/${rp.slug}`} className="group flex gap-4 bg-slate-800/40 border border-white/5 p-4 rounded-xl hover:bg-slate-800/80 hover:border-cyan-500/30 transition">
                          <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-900">
                             {rpImg ? <img src={rpImg} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📝</div>}
                          </div>
                          <div className="flex flex-col justify-center">
                             <h4 className="font-bold text-gray-200 group-hover:text-cyan-400 transition line-clamp-2">{rp.baslik}</h4>
                             <p className="text-xs text-gray-500 mt-2 line-clamp-2">{rp.alt_baslik}</p>
                          </div>
                       </Link>
                    )
                 })}
              </div>
           </div>
        )}

      </div>

      {/* --- MODAL (GLASSMORPHISM) --- */}
      {showReportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           {/* Backdrop Blur */}
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowReportModal(false)}></div>
           
           <div className="relative w-full max-w-md bg-slate-800 border border-white/10 shadow-2xl shadow-black/50 rounded-2xl p-6 transform transition-all scale-100">
              <h3 className="text-xl font-bold text-white mb-2">🚩 İçeriği Raporla</h3>
              <p className="text-sm text-gray-400 mb-4">Bu içeriğin neden uygunsuz olduğunu düşünüyorsunuz?</p>
              
              <textarea 
                 className="w-full h-32 bg-slate-900/50 border border-white/10 rounded-lg p-3 text-white placeholder-gray-600 focus:border-red-500 focus:outline-none resize-none"
                 placeholder="Açıklama yazınız..."
                 value={reportText}
                 onChange={(e) => setReportText(e.target.value)}
              ></textarea>

              <div className="flex justify-end gap-3 mt-4">
                 <button onClick={() => setShowReportModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">İptal</button>
                 <button onClick={sendReport} className="px-6 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition shadow-lg shadow-red-600/20">Raporla</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}